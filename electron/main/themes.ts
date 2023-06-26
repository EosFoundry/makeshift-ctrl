import stylelint from 'stylelint'
import { Msg, nspct2, LogLevel, MsgLevel, nspect, logRank } from '@eos-makeshift/msg'
import { ctrlLogger } from './utils'
import { readFileSync } from 'node:fs'

export const DefaultTheme = {
  cssClass: 'default-theme',
  isLight: false,
  cssRaw: `.default-theme{
{
    --color-bg: 36 34 40;
    --color-dark: 23 23 28;
    --color-neutral: 152 147 141;
    --color-text: 238 231 221;
    --color-text-primary-contrast: 36 34 40;
    --color-hl: 66 63 61;
    --color-hl1: 224 212 204;
    --color-primary: 214 178 235;
    --color-primary1: 163 112 183;
    --color-primary2: 128 75 149;
    --color-secondary: 199 78 41;
    --color-secondary1: 255 154 122;
    --color-secondary2: 255 177 153;
    --color-red: 190 91 112;
    --color-green: 167 192 123;
    --color-blue: 170 206 222;
}`
}


const stylelintConfig = {
  rules: {
    'color-no-invalid-hex': true,
    'property-allowed-list': [
      '/--color-.*/'
      // '--color-bg',
      // '--color-dark',
      // '--color-neutral',
      // '--color-text',
      // '--color-hl',
      // '--color-hl1',
      // '--color-primary',
      // '--color-primary1',
      // '--color-primary2',
      // '--color-secondary',
      // '--color-secondary1',
      // '--color-secondary2',
      // '--color-red',
      // '--color-green',
      // '--color-blue',
    ],
  },
}

// Create Loggers
const msgen = new Msg({ host: 'ThemeLoader', logLevel: 'debug' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()

export type Theme = {
  cssClass: string
  isLight: boolean
  cssRaw: string
}

/**
 * 
 * 
 * @param path relative path to css file
 * @returns {css: string, linterResult: stylelint.LinterResult, error: boolean, errorObj: any}
 */
export async function loadTheme(path: string) {
  let ret = {
    theme: {} as Theme,
    linterResult: {} as stylelint.LinterResult,
    error: false,
    errorObj: null,
  }
  try {
    log.info(`Loading CSS file from ${path}`)
    ret.theme.cssRaw = readFileSync(path, 'utf8')
    const options = {
      config: stylelintConfig,
      files: path,
    }
    ret.linterResult = await stylelint.lint(options)
    if (ret.linterResult.errored) {
      log.warn(`CSS file failed linting, returning empty string`)
      ret.error = true
      ret.errorObj = ret.linterResult.results[0]
    } else {
      log.info(`CSS file loaded successfully, building metadata...`)
      ret.theme.cssClass = await getThemeName(ret.theme.cssRaw)
      ret.theme.isLight = await checkThemeBrightness(ret.theme.cssRaw)
    }
  } catch (err) {
    log.error(`Error loading CSS file: ${err}`)
    ret.error = true
    ret.errorObj = err
  }
  return ret
}
export async function getThemeName(themeCss: string) {
  const themeCssClass = themeCss.match(/\.([a-z-]*)\ /) === null ? '' : themeCss.match(/\.([a-z-]*)\ /)[1]
  let themeReadableName = themeCssClass.replace('-theme', '')
  themeReadableName = themeReadableName.replace(/-/g, ' ')
  log.info(`Finding theme css class string...`)
  log.debug(`themeCssClass: ${themeCssClass}`)
  log.debug(`themeReadableName: ${themeReadableName}`)
  return themeCssClass
}

export async function checkThemeBrightness(themeCss: string) {
  const bgLine = themeCss.match('--color-bg:.*')
  log.info(`Checking theme brightness...`)
  log.debug(`bgLine: ${bgLine}`)

  return false
}