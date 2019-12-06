import { format } from './utils.js'
import { inspect } from 'util'
import assert from 'assert'

const templates = {
    getHeader: () => [`TAP version 13`],
    getCount: testCount => [`1..${testCount}`],
    getModuleHeader: module => [`# ${module.name} (${module.source.name})`],
    getSkipped: (testIndex, description) => [
        `ok ${testIndex} -${description} # SKIP`
    ],
    getSuccess: (testIndex, description) => [`ok ${testIndex} -${description}`],
    getFailure: (testIndex, description, details) => [
        `not ok ${testIndex} -${description}`,
        `  ---`,
        details.error ? `    error:      ${details.error}` : null,
        details.expected ? `    expected:   ${format(details.expected)}` : null,
        details.actual ? `    actual:     ${format(details.actual)}` : null,
        details.stack ? `    stack:      ${format(details.stack)}` : null,
        `  ...`
    ]
}

export default class TestHarness {
    constructor(modules, flags) {
        this.flags = flags
        this.modules = modules
    }

    get testCount() {
        return this.modules.reduce(
            (sum, module) =>
                sum +
                Array.from(module.context.asserts).reduce(
                    (sum, assert) => 1 + assert.sideEffects.length + sum,
                    0
                ),
            0
        )
    }

    run() {
        const state = {
            testIndex: 0,
            failedCount: 0,
            skippedCount: 0,
            passedCount: 0,
            testCount: 0
        }

        let results = [
            templates.getHeader(),
            templates.getCount(this.testCount)
        ]

        for (let module of this.modules) {
            const context = module.context

            results.push(templates.getModuleHeader(module))

            for (let {
                test,
                expect,
                comment,
                sideEffects
            } of context.asserts) {
                state.testIndex += 1

                context.boxes.push()

                const testDescription = ` ${
                    comment ? comment + ' ' : ''
                }(${format(test)})`

                let result
                let evaluatedExpect
                let error

                try {
                    result = context.evaluate(
                        test,
                        this.flags.trace
                            ? {
                                  onStart: data =>
                                      console.log(`---\n${format(data)}`),
                                  onStep: data => console.log(format(data))
                              }
                            : {}
                    )

                    try {
                        evaluatedExpect = context.evaluate(expect)
                    } catch (e) {
                        evaluatedExpect = expect
                    }

                    assert.deepStrictEqual(evaluatedExpect, result)

                    state.passedCount += 1
                    results.push(
                        templates.getSuccess(state.testIndex, testDescription)
                    )

                    for (let effect of sideEffects) {
                        state.testIndex += 1

                        const effectDescription = `- side-effect: ${format(
                            effect
                        )}`

                        const result = context.runSideEffect(effect, [], [])

                        if (result === true) {
                            results.push(
                                templates.getSuccess(
                                    state.testIndex,
                                    effectDescription
                                )
                            )
                        } else {
                            results.push(
                                templates.getFailure(
                                    state.testIndex,
                                    effectDescription,
                                    result
                                )
                            )
                        }
                    }
                } catch (e) {
                    state.failedCount += 1

                    error = e

                    results.push(
                        templates.getFailure(state.testIndex, testDescription, {
                            error:
                                error instanceof assert.AssertionError
                                    ? null
                                    : error,
                            expected: evaluatedExpect,
                            actual: result,
                            stack: test
                        })
                    )

                    for (let effect of sideEffects) {
                        state.testIndex += 1

                        results.push(
                            templates.getSkipped(
                                state.testIndex,
                                `- side-effect`
                            )
                        )
                    }
                } finally {
                    state.testCount += 1
                }

                context.boxes.pop()
            }
        }

        const resultString = results
            .reduce((acc, strs) => [...acc, strs.filter(Boolean).join('\n')])
            .join('\n')

        console.log(resultString)

        process.exit(state.failedCount > 0 ? 1 : 0)
    }
}
