import util from 'util'

import { format } from './utils.js'
import BoxManager from './BoxManager.js'
import { ofType, orDefault } from './data-manipulation.js'

import SIDE_EFFECTS from './side-effects.js'

import {
    IrreducibleExpressionError,
    UnknownDeclarationError,
    InsufficientArgumentsError,
    UnknownEffectError
} from './errors.js'

export default class Context {
    moduleDeclaration = null
    declarations = new Map()
    asserts = new Set()
    imports = new Set()

    boxes = new BoxManager()

    getModuleDeclaration() {
        return this.moduleDeclaration
    }

    getDeclaration(name) {
        return this.declarations.get(name)
    }

    hasDeclaration(name) {
        return this.declarations.has(name)
    }

    addDeclaration(name, declaration) {
        return this.declarations.set(name, declaration)
    }

    loadProgram(statements) {
        statements
            .filter(ofType('DECLARATION'))
            .forEach(({ name, args, body, sideEffects }) =>
                this.declarations.set(name.value, {
                    name: name.value,
                    args: args,
                    body: body,
                    sideEffects: orDefault(sideEffects, [])
                })
            )

        statements
            .filter(ofType('ASSERTION'))
            .forEach(({ name, body, comment, sideEffects }) =>
                this.asserts.add({
                    test: name,
                    expect: body,
                    comment: comment,
                    sideEffects: orDefault(sideEffects, [])
                })
            )

        statements.filter(ofType('IMPORT')).forEach(({ name, ids }) =>
            this.imports.add({
                name: name.value,
                identifiers: ids
            })
        )

        this.moduleDeclaration = statements.find(
            statement => statement.type === 'MODULE'
        )
    }

    getImplicitImports(identifiers) {
        let queue = identifiers.slice()
        let result = new Map()
        let seen = new Set()

        while (queue.length > 0) {
            const identifier = queue.shift()

            if (this.hasDeclaration(identifier.value)) {
                const declaration = this.getDeclaration(identifier.value)

                if (seen.has(declaration.name)) {
                    continue
                } else {
                    seen.add(declaration.name)
                    result.set(declaration.name, declaration)

                    queue.push(...declaration.body.flat())
                }
            }
        }

        return result
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

    runSideEffect(effect, shape, rest) {
        const [head, ...tail] = effect
        const handler = SIDE_EFFECTS[head.value]

        if (!handler) {
            throw new UnknownEffectError(head.value)
        }

        let res = [...tail]
        let from = shape === null ? [] : [...shape]
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

    reduce(expression, shouldRunEffects = true) {
        let [head, ...tail] = expression

        while (Array.isArray(head)) {
            ;[head, ...tail] = [...head, ...tail]
        }

        if (tail.length === 0) {
            if (head.type === 'IDENTIFIER') {
                const declaration = this.getDeclaration(head.value)

                if (declaration && declaration.args.length > 0) {
                    return [head]
                }
            } else {
                return [head]
            }
        } else {
            if (head.type !== 'IDENTIFIER') {
                throw new IrreducibleExpressionError(head.type)
            }
        }

        if (!this.hasDeclaration(head.value)) {
            throw new UnknownDeclarationError(head.value)
        }

        const declaration = this.getDeclaration(head.value)

        const from = [...declaration.args]
        const effects = [...declaration.sideEffects]
        let result = [...declaration.body]
        let args = [...tail]

        while (from.length > 0) {
            const argument = from.shift()
            let value

            if (argument.hasStar) {
                value = args.slice()
                args = []
            } else {
                value = args.shift()
            }

            if (value === undefined) {
                throw new InsufficientArgumentsError()
            }

            result = this.replace(result, argument, value)
        }

        if (Array.isArray(effects) && shouldRunEffects) {
            for (let effect of effects) {
                this.runSideEffect(effect, declaration.args, tail)
            }
        }

        return [result, ...args]
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

    evaluate(expression, options = {}) {
        let result
        ;(options.onStart || (() => {}))(expression)
        for (let res of this.solve(expression)) {
            result = res
            ;(options.onStep || (() => {}))(result)
        }

        ;(options.onEnd || (() => {}))(result)

        return result
    }
}
