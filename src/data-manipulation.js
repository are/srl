export function ofType(type) {
    return object => typeof object === 'object' && object.type === type
}

export function orDefault(value, defaultValue) {
    return value === null || value === undefined ? defaultValue : value
}
