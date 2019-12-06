export const TOKEN_TYPES = {
    IDENTIFIER: 'IDENTIFIER',
    SYMBOL: 'SYMBOL',
    EXPRESSION: 'EXPRESSION',
    DECLARATION: 'DECLARATION',
    ASSERTION: 'ASSERTION',
    IMPORT: 'IMPORT',
    PROGRAM: 'PROGRAM',
    BOX: 'BOX',
    UNIT: 'UNIT',
    MODULE: 'MODULE'
}

const VALUE_TYPES = {}

export const helpText = `Usage: srl [...main modules] [-options]

Options:
    --stdin                             read main module from stdin
    -i, --include <MODULE>              include a module to link to from main modules
    --solve <RULE>                      reduce rule to basic term from any main module
    --run-tests                         run all assertions in main modules
`
