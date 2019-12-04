const util = require('util')
const fs = require('fs')
const argv = require('yargs').argv

const LOGLEVEL = {
    ERROR: 1,
    OUTPUT: 3,
    BOX: 4,
    INPUT: 4,
    TRACE: 5
}

let logLevel

if (typeof argv.logLevel !== 'string') {
    logLevel = LOGLEVEL.OUTPUT
} else {
    logLevel = LOGLEVEL[argv.logLevel] || LOGLEVEL.OUTPUT
}

const trace = (name, message) => {
    const level = LOGLEVEL[name] || 10

    if (level <= logLevel) {
        if (name === 'ERROR') {
            console.error(`ERROR: ${message}`)
        } else {
            if (argv.debug) {
                console.log(`${name}: ${message}`)
            } else {
                console.log(`${message}`)
            }
        }
    }
}

const format = input =>
    input
        .map(entry => {
            if (Array.isArray(entry)) {
                return `(${format(entry)})`
            }

            if (entry.type === 'SYMBOL') {
                return `<${entry.value}>`
            }

            if (entry.type === 'BOX') {
                return `@${entry.value}`
            }

            return entry.value
        })
        .join(' ')

const readFile = util.promisify(fs.readFile)

module.exports = {
    trace,
    format,
    argv,
    readFile
}
