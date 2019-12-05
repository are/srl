#!/usr/bin/env node

const util = require('util')
const assert = require('assert')

const { argv, trace, format, readFile } = require('./utils.js')
const { Context } = require('./interpreter.js')
const { Module } = require('./modules.js')

async function main(inputPaths, flags) {
    let modules = []

    if (flags.stdin === true) {
        modules.push(new Module('-', true, false))
    }

    if (flags.i !== undefined) {
        let includes = Array.isArray(flags.i) ? flags.i : [flags.i]

        for (let include of includes) {
            modules.push(new Module(include, false, true))
        }
    }

    if (flags.stdin === undefined) {
        for (let inputPath of inputPaths) {
            modules.push(new Module(inputPath, false, false))
        }
    }

    const moduleMap = {}

    for (let mod of modules) {
        await mod.parse()

        moduleMap[mod.name] = mod
    }

    for (let mod of modules) {
        mod.link(moduleMap)
    }

    const mainModules = modules.filter(mod => mod.isMain)

    if (flags.runTests === true) {
        console.log(`TAP version 13`)

        let testIndex = 0
        const testCount = mainModules.reduce(
            (acc, mod) =>
                acc +
                Array.from(mod.ctx.asserts).reduce(
                    (amm, ass) => 1 + ass.sideEffects.length + amm,
                    0
                ),
            0
        )

        console.log(`1..${testCount}`)

        let didAnyFail = false
        for (let mainModule of mainModules) {
            console.log(`# ${mainModule.name} (${mainModule.path})`)
            let ctx = mainModule.ctx

            for (let { test, expect, comment, sideEffects } of ctx.asserts) {
                const description = `${comment ? comment + ' ' : ''}(${format(
                    test
                )})`
                testIndex += 1

                let result
                let error
                let didThisFail = false

                try {
                    result = ctx.run(test, d => {
                        if (flags.trace) {
                            console.log(format(d))
                        }
                    })
                    assert.deepStrictEqual(expect, result, 'abc')
                } catch (e) {
                    error = e
                    didAnyFail = true
                    didThisFail = true
                }

                if (didThisFail) {
                    if (typeof error === 'string') {
                        console.log(`
not ok ${testIndex} - ${description}
  ---
    error:      ${error}
  ...`)
                    } else {
                        console.log(`
not ok ${testIndex} - ${description}
  ---
    expected:   ${format(expect)}
    actual:     ${format(result)}
    stack:      ${format(test)}
  ...`)
                    }
                } else {
                    console.log(`ok ${testIndex} - ${description}`)
                    let seFailed = false

                    for (let effect of sideEffects) {
                        const result = ctx.sideEffect(effect, [], [])
                        testIndex += 1

                        if (result === true) {
                            console.log(
                                `ok ${testIndex} -- side-effect: (${format(
                                    effect
                                )})`
                            )
                        } else {
                            seFailed = false
                            console.log(
                                `not ok ${testIndex} -- sife-effect: (${format(
                                    effect
                                )})
  ---
    expected:   ${result.expected}
    actual:     ${result.actual}
  ...`
                            )
                        }
                    }
                }
            }
        }

        process.exit(didAnyFail ? 1 : 0)
    } else if (typeof flags.solve === 'string') {
        let ruleName = flags.solve

        const mod = mainModules.find(mod => mod.hasRule(ruleName))

        if (!mod) {
            throw `Cannot find rule '${ruleName}'`
        }

        const rule = mod.ctx.rules.get(ruleName)
        const result = mod.ctx.run(rule.to, i => {
            if (flags.trace === true) {
                console.log('STEP:', format(i))
            }
        })

        if (result) {
            console.log(format(result))
        }

        process.exit(0)
    } else {
        console.log(
            `Usage: srl [...main modules] [-options]

Main modules:
    Can import rules from other modules

Options:
    --stdin                             read main module from stdin
    -i, --include <MODULE>              include a module to link to from main modules
    --solve <RULE>                      reduce rule to basic term from any main module
    --run-tests                         run all assertions in main modules`
        )
    }
}

main(argv._, argv).catch(e => {
    console.log(e)
    trace('ERROR', e)
    process.exit(1)
})
