#!/usr/bin/env node

const nearley = require('nearley')
const getStdin = require('get-stdin')
const util = require('util')
const assert = require('assert')

const grammar = require('./grammar.js')
const { argv, trace, format, readFile } = require('./utils.js')
const { Context } = require('./interpreter.js')

async function main([filename], flags) {
    if (filename === undefined) {
        throw 'No input specified'
    }

    let input
    if (filename === '-') {
        input = await getStdin()
    } else {
        input = await readFile(filename, 'utf8')
    }

    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    try {
        parser.feed(input)
    } catch (error) {
        if (flags.debug) {
            console.error(error)
        }

        if (error.token) {
            throw `Syntax error at line ${error.token.line} col ${error.token.col}`
        } else {
            throw `Other error`
        }
    }

    const program = parser.results[0]

    if (!program || parser.results.length > 1) {
        if (flags.debug) {
            console.log(
                util.inspect(parser.results, { depth: Infinity, colors: true })
            )
        }
        throw 'Cannot parse program'
    }

    const ctx = new Context(program.statements)

    if (flags.runTests === true) {
        let didFail = false
        for (let [name, { expect }] of ctx.asserts) {
            const declaration = ctx.declaration(name)

            if (declaration.from !== null) {
                continue
            }

            try {
                assert.deepStrictEqual(expect, ctx.run(declaration.to), 'abc')
                console.log(`${name}: passed`)
            } catch (e) {
                didFail = true
                console.log(`${name}: failed`)
            }
        }

        process.exit(didFail ? 1 : 0)
    }

    let mainRuleName = 'main'
    if (typeof flags.solve === 'string') {
        mainRuleName = flags.solve
    }

    const mainRule = ctx.rules.get(mainRuleName)

    if (!mainRule) {
        throw `Rule '${mainRuleName}' not found`
    }

    const { to: body } = mainRule

    trace('INPUT', format(body))

    let final
    for (let result of ctx.solve(body)) {
        trace('TRACE', format(result))

        if (result.length === 1 && result[0].type === 'BOX') {
            trace('BOX', ctx.boxes.get(result[0].value))
        }

        final = result
    }

    trace('OUTPUT', format(final))
}

main(argv._, argv).catch(e => {
    trace('ERROR', e)
    process.exit(1)
})
