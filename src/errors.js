class DomainError extends Error {
    constructor(message) {
        super(message)

        this.name = this.constructor.name

        Error.captureStackTrace(this, this.constructor)
    }
}

class ModuleError extends DomainError {}

export class AbstractSourceError extends ModuleError {
    constructor() {
        super(`Cannot pull from an abstract source`)
    }
}

export class NotImplementedError extends DomainError {
    constructor() {
        super(`Not implemented yet`)
    }
}

export class ParsingError extends ModuleError {
    constructor(source, token) {
        super(`Parsing error in ${source.name} at ${token.line}:${token.col}`)
    }
}

export class AmbiguousGrammarError extends ModuleError {
    constructor(resultCount) {
        super(
            `Ambiguous grammar detected - number of possible parsings: ${resultCount}`
        )
    }
}

export class UnexpectedEOFError extends ModuleError {
    constructor() {
        super(`Unexpected end of input`)
    }
}

export class UnknownDeclarationError extends DomainError {
    constructor(name) {
        super(`Cannot find declaration '${name}'`)
    }
}

export class UnknownModuleError extends DomainError {
    constructor(name) {
        super(`Cannot find module '${name}'`)
    }
}

export class UnknownEffectError extends DomainError {
    constructor(name) {
        super(`Cannot find effect '${name}'`)
    }
}

export class UnexpectedResultError extends DomainError {
    constructor() {
        super(`Unexpected solution to a declaration`)
    }
}

export class DuplicateDeclarationError extends DomainError {
    constructor(name) {
        super(
            `Cannot import '${name}' as it would overwrite existing declaration`
        )
    }
}

export class IrreducibleExpressionError extends DomainError {
    constructor(type) {
        super(`Cannot reduce expression starting with ${type}`)
    }
}

export class InsufficientArgumentsError extends DomainError {
    constructor() {
        super(`Not enough arguments to make a reduction`)
    }
}
