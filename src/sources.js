import { AbstractSourceError, NotImplementedError } from './errors.js'

import getStdin from 'get-stdin'
import path from 'path'

import { readFile } from './utils.js'

class Source {
    constructor(type) {
        this.type = type
    }

    async pull() {
        return Promise.reject(new AbstractSourceError())
    }
}

export class StdinSource extends Source {
    constructor() {
        super('STDIN')
    }

    get name() {
        return `stdin`
    }

    async pull() {
        return await getStdin()
    }
}

export class FileSource extends Source {
    constructor(filePath) {
        super('FILE')

        this.filePath = path.resolve(filePath)
    }

    get name() {
        return `${this.filePath}`
    }

    async pull() {
        return await readFile(this.filePath, 'utf8')
    }
}

export class HttpSource extends Source {
    constructor(url) {
        super('HTTP')

        this.url = url
    }

    get name() {
        return `${this.url}`
    }

    async pull() {
        return Promise.reject(new NotImplementedError())
    }
}
