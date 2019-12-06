import util from 'util'
import fs from 'fs'
import yargs from 'yargs'

export const argv = yargs.argv

export const format = input =>
    input
        .map(entry => {
            if (Array.isArray(entry)) {
                return `(${format(entry)})`
            }

            if (entry.type === 'SYMBOL') {
                return `<${entry.value}>`
            }

            if (entry.type === 'BOX') {
                return `#${entry.value}`
            }

            if (entry.type === 'UNIT') {
                return `()`
            }

            return entry.value
        })
        .join(' ')

export const readFile = util.promisify(fs.readFile)
