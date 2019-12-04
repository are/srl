const util = require('util')

const zip = (as, bs) => as.map((a, i) => [a, bs[i]])

const SIDE_EFFECTS = {
    'inc!': ([box], ctx) => {
        if (box.type === 'BOX') {
            const currentValue = ctx.boxes.get(box.value) || 0
            ctx.boxes.set(box.value, currentValue + 1)
        }
    }
}

class Context {
    constructor(declarations) {
        this.rules = new Map()
        this.boxes = new Map()

        for (let declaration of declarations) {
            this.rules.set(declaration.name.value, {
                type: 'rule',
                from: declaration.args,
                to: declaration.body,
                sideEffects: declaration.sideEffects || []
            })
        }
    }

    get(identifier) {
        let rule = this.rules.get(identifier.value)

        if (rule) {
            return rule
        }

        return { type: 'special', action: this.specials[identifier.value] }
    }

    replace(subject, target, replacement) {
        const result = subject.reduce((acc, entry) => {
            if (Array.isArray(entry)) {
                return this.replace(entry, target, replacement)
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
                value = args
            } else {
                value = args.shift()
            }

            result = this.replace(result, argument, value)
        }

        if (Array.isArray(sideEffects)) {
            for (let effect of sideEffects) {
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

                handler(res, this)
            }
        }

        return result
    }

    run(input) {
        let result = input

        while (
            result.length !== 1 ||
            (result.length === 1 && Array.isArray(result[0]))
        ) {
            result = this.reduce(result)
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
