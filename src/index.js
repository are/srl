import Module from './Module.js'
import Linker from './Linker.js'
import TestHarness from './TestHarness.js'
import { FileSource, StdinSource } from './sources.js'

import { UnknownDeclarationError, UnexpectedResultError } from './errors.js'

import { helpText } from './constants.js'
import { format } from './utils.js'

export async function main(flags) {
    // Check if help has been requested
    if (flags.help === true || flags.h === true) {
        console.log(helpText)
        return process.exit(0)
    }

    // Create all modules that have been included in CLI command
    const modules = []

    if (flags.stdin === true) {
        const source = new StdinSource()
        modules.push(new Module(source))
    }

    if (Array.isArray(flags._)) {
        for (let filePath of flags._) {
            const source = new FileSource(filePath)
            modules.push(new Module(source))
        }
    }

    if (Array.isArray(flags.import)) {
        for (let filePath of flags.import) {
            const source = new FileSource(filePath)
            modules.push(new Module(source, true))
        }
    } else if (typeof flags.import === 'string') {
        const source = new FileSource(flags.import)
        modules.push(new Module(source, true))
    }

    // Initialize all modules in parallel
    await Promise.all(modules.map(mod => mod.initialize()))

    // Create a linker...
    const linker = new Linker(modules)

    // and link all modules
    linker.linkAll()

    // Get all modules that are not library imports (main modules)
    const mains = linker.getMains()

    // Decide what to do next:
    // 1. Run all assertions in main modules
    if (flags.runAssertions === true) {
        const testHarness = new TestHarness(mains)

        return testHarness.run()
    } else if (typeof flags.solve === 'string') {
        // 2. Solve a specific declaration
        const declarationName = flags.solve

        const mod = mains.find(mod => mod.hasDeclaration(declarationName))

        if (mod === undefined) {
            throw new UnknownDeclarationError(declarationName)
        }

        const declaration = mod.getDeclaration(declarationName)

        // TODO: if declaration has inputs, throw and ask for them

        const result = mod.evaluate(declaration.body, {
            onStep: data => {
                console.log(format(data))
                // TODO: Display trace step by step
            }
        })

        // TODO: Display output

        if (!result) {
            throw new UnexpectedResultError()
        }

        return
    }
}

//         console.log(`TAP version 13`)
//
//         let testIndex = 0
//         const testCount = mainModules.reduce(
//             (acc, mod) =>
//                 acc +
//                 Array.from(mod.context.asserts).reduce(
//                     (amm, ass) => 1 + ass.sideEffects.length + amm,
//                     0
//                 ),
//             0
//         )
//
//         console.log(`1..${testCount}`)
//
//         let didAnyFail = false
//         for (let mainModule of mainModules) {
//             console.log(`# ${mainModule.name} (${mainModule.path})`)
//             let context = mainModule.context
//
//             for (let {
//                 test,
//                 expect,
//                 comment,
//                 sideEffects
//             } of context.asserts) {
//                 context.boxes.push()
//                 const description = `${comment ? comment + ' ' : ''}(${format(
//                     test
//                 )})`
//                 testIndex += 1
//
//                 let result
//                 let error
//                 let didThisFail = false
//
//                 try {
//                     result = context.run(test, d => {
//                         if (flags.trace) {
//                             console.log(format(d))
//                         }
//                     })
//                     assert.deepStrictEqual(expect, result, 'abc')
//                 } catch (e) {
//                     error = e
//                     didAnyFail = true
//                     didThisFail = true
//                 }
//
//                 if (didThisFail) {
//                     if (typeof error === 'string') {
//                         console.log(`
// not ok ${testIndex} - ${description}
//   ---
//     error:      ${error}
//   ...`)
//                     } else {
//                         console.log(`
// not ok ${testIndex} - ${description}
//   ---
//     expected:   ${format(expect)}
//     actual:     ${format(result)}
//     stack:      ${format(test)}
//   ...`)
//                     }
//                 } else {
//                     console.log(`ok ${testIndex} - ${description}`)
//                     let seFailed = false
//
//                     for (let effect of sideEffects) {
//                         const result = context.sideEffect(effect, [], [])
//                         testIndex += 1
//
//                         if (result === true) {
//                             console.log(
//                                 `ok ${testIndex} -- side-effect: (${format(
//                                     effect
//                                 )})`
//                             )
//                         } else {
//                             seFailed = false
//                             console.log(
//                                 `not ok ${testIndex} -- sife-effect: (${format(
//                                     effect
//                                 )})
//   ---
//     expected:   ${result.expected}
//     actual:     ${result.actual}
//   ...`
//                             )
//                         }
//                     }
//                 }
//
//                 context.boxes.pop()
//             }
//         }
//
//         process.exit(didAnyFail ? 1 : 0)
