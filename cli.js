import { main } from './src/index.js'
import yargs from 'yargs'

main(yargs.argv)
    .then(() => {
        process.exit(0)
    })
    .catch(error => {
        if (yargs.argv.debug === true) {
            console.error(error)
        }

        console.log(`ERROR: ${error.message}`)
        process.exit(1)
    })
