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
            onStart: data => {
                console.log(format(data))
            },
            onStep: data => {
                console.log(format(data))
                // TODO: Display trace step by step
            },
            onEnd: data => {
                console.log(format(data))
            }
        })

        // TODO: Display output

        if (!result) {
            throw new UnexpectedResultError()
        }

        return
    }
}
