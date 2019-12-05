const nearley = require('nearley')
const grammar = require('./grammar.js')
const getStdin = require('get-stdin')
const path = require('path')

const { readFile } = require('./utils.js')
const { Context } = require('./interpreter.js')

class Module {
    constructor(filepath, isStdin = false, isInclude = false) {
        this.ctx = new Context()
        this.isStdin = isStdin
        this.isInclude = isInclude
        this.path = filepath
        this.name = path.basename(filepath, '.srl')
        this.parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    }

    get isMain() {
        return this.isInclude === false
    }

    hasRule(ruleName) {
        return this.ctx.rules.has(ruleName)
    }

    async parse() {
        if (this.isStdin) {
            this.contents = await getStdin()
        } else {
            this.contents = await readFile(this.path, 'utf8')
        }

        try {
            this.parser.feed(this.contents)
        } catch (error) {
            if (error.token) {
                console.log(error)
                throw `Syntax error at line ${error.token.line} col ${error.token.col} in '${this.path}'`
            } else {
                console.log(error)
                throw `Unexpected error has occured in '${this.path}'`
            }
        }

        const program = this.parser.results[0]

        if (!program || this.parser.results.length > 1) {
            throw `'Cannot parse program in '${this.path}'`
        }

        this.node = program

        this.ctx.load(program.statements)
    }

    link(moduleMap) {
        // TODO: RECURSIVE IMPORTING OF SYMBOLS
        for (let [name, { rules }] of this.ctx.imports) {
            const mod = moduleMap[name]

            if (!mod) {
                throw `Module not found '${name}'`
            }

            for (let id of rules) {
                const rule = mod.ctx.rules.get(id.value)

                this.ctx.rules.set(id.value, rule)
            }
        }
    }
}

module.exports = {
    Module
}
