export default {
    'increment!': ([box], ctx) => {
        if (box.type === 'BOX') {
            const currentValue = ctx.boxes.get(box.value) || 0
            ctx.boxes.set(box.value, currentValue + 1)
        }

        return true
    },
    'equals!': ([box, symbol], ctx) => {
        if (box.type === 'BOX' && symbol.type === 'SYMBOL') {
            const currentValue = ctx.boxes.get(box.value) || 0
            if (currentValue === parseFloat(symbol.value)) {
                return true
            } else {
                return {
                    expected: symbol.value,
                    actual: currentValue
                }
            }
        }

        return {
            expected: 'equals! [BOX] [SYMBOL]',
            actual: `equals! [${box.type}] [${symbol.type}]`
        }
    }
}
