export default class BoxManager {
    stack = [new Map()]

    get current() {
        return this.stack[this.stack.length - 1]
    }

    get isEmpty() {
        return this.stack.length === 1
    }

    push() {
        this.stack.push(new Map())

        return this
    }
    pop() {
        if (!this.isEmpty) {
            this.stack.pop()
        }

        return this
    }

    save() {
        // TODO: IMPLEMENT
        return this
    }
    restore() {
        // TODO: IMPLEMENT
        return this
    }

    get(key) {
        return this.current.get(key)
    }
    set(key, value) {
        return this.current.set(key, value)
    }
    over(key, fn) {
        const newValue = fn(this.current.get(key))
        this.current.set(key, newValue)
        return newValue
    }
    has(key) {
        return this.current.has(key)
    }
}
