function generateCode(block, generator, Order) {
    const keyInput = generator.valueToCode(
        block,
        'KEYBOARD_KEY',
        Order.MEMBER
    )

    return 'plugins.Nut.keyboard.type(' + keyInput + ');\n'
}

module.exports = {
    generateCode
}