const util = require('util')
const { format } = require('./utils.js')

const zip = (as, bs) => as.map((a, i) => [a, bs[i]])

const savedBoxes = []

const SIDE_EFFECTS = {
    'increment!': ([box], ctx) => {
        if (box.type === 'BOX') {
            const currentValue = ctx.boxes.get(box.value) || 0
            ctx.boxes.set(box.value, currentValue + 1)
        }

        return true
    },
    'equals!': ([box, symbol], ctx) => {
        if (box.type === 'BOX' && symbol.type === 'SYMBOL') {
            const currentValue = ctx.boxes.get(box.value) || 0
            if (currentValue === parseFloat(symbol.value)) {
                return true
            } else {
                return {
                    expected: symbol.value,
                    actual: currentValue
                }
            }
        }

        return {
            expected: 'equals! [BOX] [SYMBOL]',
            actual: `equals! [${box.type}] [${symbol.type}]`
        }
    },
    'save!': ([box], ctx) => {
        savedBoxes.push(box)

        return true
    },
    'increment-saved!': (_, ctx) => {
        const box = savedBoxes[savedBoxes.length - 1]

        const currentValue = ctx.boxes.get(box.value) || 0
        ctx.boxes.set(box.value, currentValue + 1)

        return true
    }
}

class Context {
    constructor() {
        this.rules = new Map()
        this.boxes = new Map()
        this.asserts = new Set()
        this.imports = new Map()
    }

    load(statements) {
        for (let declaration of statements.filter(
            s => s.type === 'DECLARATION'
        )) {
            this.rules.set(declaration.name.value, {
                type: 'rule',
                from: declaration.args,
                to: declaration.body,
                sideEffects: declaration.sideEffects || []
            })
        }

        for (let assertion of statements.filter(s => s.type === 'ASSERTION')) {
            this.asserts.add({
                type: 'assertion',
                test: assertion.name,
                expect: assertion.body,
                comment: assertion.comment,
                sideEffects: assertion.sideEffects
            })
        }

        for (let include of statements.filter(s => s.type === 'IMPORT')) {
            this.imports.set(include.name.value, {
                type: 'import',
                name: include.name.value,
                rules: include.ids
            })
        }
    }

    declaration(name) {
        return this.rules.get(name)
    }

    get(identifier) {
        let rule = this.rules.get(identifier.value)

        if (!rule) {
            throw `Cannot reduce rule '${identifier.value}'`
        }

        return rule
    }

    replace(subject, target, replacement) {
        const result = subject.reduce((acc, entry) => {
            if (Array.isArray(entry)) {
                return [...acc, this.replace(entry, target, replacement)]
            }

            if (target.type === entry.type && target.value === entry.value) {
                if (entry.hasStar && Array.isArray(replacement)) {
                    return [...acc, ...replacement]
                } else {
                    return [...acc, replacement]
                }
            } else {
                return [...acc, entry]
            }
        }, [])
        return result
    }

    sideEffect(effect, fromD, rest) {
        const [head, ...body] = effect
        const handler = SIDE_EFFECTS[head.value]

        if (!handler) {
            throw `Unknown side-effect ${head.value}`
        }

        let res = [...body]
        let from = fromD === null ? [] : [...fromD]
        let args = [...rest]

        while (from.length > 0) {
            const argument = from.shift()

            let value
            if (argument.hasStar) {
                value = args
            } else {
                value = args.shift()
            }

            res = this.replace(res, argument, value)
        }

        return handler(res, this)
    }

    reduce(input) {
        const [head, ...rest] = input

        if (Array.isArray(head)) {
            return [...head, ...rest]
        }

        if (head.type !== 'IDENTIFIER') {
            throw 'SYMBOL or BOX is not a valid reduction rule'
        }

        const declaration = this.get(head)

        if (declaration === undefined) {
            throw `Unknown rule '${head.value}' of type ${head.type}`
        }

        if (declaration.type === 'special') {
            return declaration.action(head, rest)
        }

        const { from: fromD, to: toD, sideEffects: sideEffectsD } = declaration

        const from = fromD === null ? [] : [...fromD]
        const sideEffects = [...sideEffectsD]
        const args = [...rest]
        let result = [...toD]

        while (from.length > 0) {
            const argument = from.shift()

            let value
            if (argument.hasStar) {
                value = []
                while (args.length > 0) {
                    value.push(args.shift())
                }
            } else {
                value = args.shift()
            }

            if (value === undefined) {
                throw `Cannot reduce '${head.value}' - not enough arguments`
            }

            result = this.replace(result, argument, value)
        }

        if (Array.isArray(sideEffects)) {
            for (let effect of sideEffects) {
                this.sideEffect(effect, fromD, rest)
            }
        }

        return [result, ...args]
    }

    run(input, im = () => {}) {
        let result
        for (let res of this.solve(input)) {
            im(res)
            result = res
        }

        return result
    }

    *solve(input) {
        let result = input

        while (
            result.length !== 1 ||
            (result.length === 1 && Array.isArray(result[0]))
        ) {
            result = this.reduce(result)
            yield result
        }

        return result
    }
}

module.exports = {
    Context
}
