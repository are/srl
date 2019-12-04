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
        let didFail = false
        for (let mainModule of mainModules) {
            let ctx = mainModule.ctx

            for (let [name, { expect }] of ctx.asserts) {
                const declaration = ctx.declaration(name)

                if (declaration.from !== null) {
                    continue
                }

                const result = ctx.run(declaration.to)

                try {
                    assert.deepStrictEqual(expect, result, 'abc')
                    console.log(`${mainModule.name} ${name}: passed`)
                } catch (e) {
                    didFail = true
                    console.log(
                        `${
                            mainModule.name
                        } ${name}: failed - expected '${format(
                            expect
                        )}', instead got '${format(result)}'`
                    )
                }
            }

            continue
        }

        process.exit(didFail ? 1 : 0)
    } else if (typeof flags.solve === 'string') {
        let ruleName = flags.solve

        const mod = mainModules.find(mod => mod.hasRule(ruleName))

        if (!mod) {
            throw `Cannot find rule '${ruleName}'`
        }

        const rule = mod.ctx.rules.get(ruleName)
        const result = mod.reduceRule(ruleName)

        console.log(format(result))
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
    trace('ERROR', e)
    process.exit(1)
})
