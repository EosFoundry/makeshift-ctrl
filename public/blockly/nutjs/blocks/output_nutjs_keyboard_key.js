function generateCode(block, generator, Order) {
  const key = block.getFieldValue('KEYBOARD_KEY')

  // return code = 'keyboard.type(' + keyInput + ');\n'
  return ['plugins.Nut.' + key, Order.MEMBER]
}

module.exports = {
  generateCode
}