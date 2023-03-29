
import { open, readFile } from "node:fs/promises"

const argv = process.argv.slice(2)

console.log(argv)

try {
  const file = await readFile(argv[0], { encoding: 'utf8' })

  console.log(file)
  const rgbFile = file.replace(/#[0-9a-fA-F]{6}/g, (hex) => {
    const rgb = hexToRGB(hex).join(' ')
    console.log(`hex: ${hex} rgb: ${rgb}`)
    return rgb
  })
  console.log(rgbFile)
} catch (err) {
  console.error(err)
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}