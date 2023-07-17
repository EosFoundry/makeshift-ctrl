import { reactive, ref } from 'vue'

export const cssParameters = reactive({
  rootFontSize: 16,
})

const isFont = /^([+-]?[0-9]*[.]?[0-9]+)(px|em|rem|pt|pc|mm|cm|in|ex|ch|vw|vh|vmin|vmax)$/

cssParameters.rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);

export function pxToRem(px: number) {
  return (px / cssParameters.rootFontSize)
}

export function remToPx(rem: number) {
  // console.log(`rem: ${rem}`)
  // console.log(`rootFontSize: ${cssParameters.rootFontSize}`)
  // console.log(`rem * rootFontSize: ${rem * cssParameters.rootFontSize}`)
  return (rem * cssParameters.rootFontSize)
}

export function updateFont(newFontSize: string) {
  const matches = newFontSize.match(isFont)
  // console.log(matches)
  if (matches !== null) {
    const type = matches[2]
    switch (type) {
      case 'px': {
        cssParameters.rootFontSize = parseFloat(matches[1])
      }
      default: {
      }
    }
  }
}

export function checkFontSize(el: HTMLElement) {
  const fontSize = getComputedStyle(el).fontSize
  const matches = fontSize.match(isFont)
  // console.log(`fontSize: ${fontSize}`)
  // console.log(matches)
  if (matches !== null) {
    const type = matches[2]
    switch (type) {
      case 'px': {
        return parseFloat(matches[1])
      }
      default: {
        return 0
      }
    }
  }
  return 0
}