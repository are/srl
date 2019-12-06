import nearley from 'nearley'
import grammar from './grammar.cjs'

import Context from './Context.js'

import {
    ParsingError,
    AmbiguousGrammarError,
    UnexpectedEOFError
} from './errors.js'

export default class Module {
    context = new Context()
    parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))
    rootAstNode = null
    name = null
    isInitialized = false

    constructor(source, isLibrary = false) {
        this.source = source
        this.isLibrary = isLibrary
    }

    async initialize() {
        const contents = await this.source.pull()

        try {
            this.parser.feed(contents)
        } catch (error) {
            console.log(error)
            throw new ParsingError(this.source, error.token)
        }

        if (this.parser.results.length > 1) {
            throw new AmbiguousGrammarError(this.parser.results.length)
        }

        if (this.parser.results.length === 0) {
            throw new UnexpectedEOFError()
        }

        this.rootAstNode = this.parser.results[0]

        this.context.loadProgram(this.rootAstNode.statements)

        this.name = this.context.getModuleDeclaration().name
        this.isInitialized = true
    }

    hasDeclaration(name) {
        return this.context.hasDeclaration(name)
    }

    getDeclaration(name) {
        return this.context.getDeclaration(name)
    }

    addDeclaration(name, declaration) {
        return this.context.addDeclaration(name, declaration)
    }

    evaluate(expression, options = {}) {
        return this.context.evaluate(expression, options)
    }
}
