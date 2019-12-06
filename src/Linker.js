import { DuplicateDeclarationError, UnknownModuleError } from './errors.js'

export default class Linker {
    modules = new Map()

    constructor(modules) {
        for (let module of modules) {
            if (module.isInitialized) {
                this.modules.set(module.name, module)
            } else {
                throw new LinkError()
            }
        }
    }

    linkAll() {
        for (let [selfName, module] of this.modules) {
            const { context } = module

            for (let { name, identifiers } of context.imports) {
                const importedModule = this.modules.get(name)

                if (importedModule === undefined) {
                    throw new UnknownModuleError(name)
                }

                const importedIdentifiers = importedModule.context.getImplicitImports(
                    identifiers
                )

                for (let [identifier, declaration] of importedIdentifiers) {
                    if (module.hasDeclaration(identifier)) {
                        throw new DuplicateDeclarationError(identifier)
                    } else {
                        module.addDeclaration(identifier, declaration)
                    }
                }
            }
        }
    }

    getMains() {
        return Array.from(this.modules.values()).filter(
            module => !module.isLibrary
        )
    }
}
