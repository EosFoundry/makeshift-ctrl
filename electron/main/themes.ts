import stylelint from 'stylelint'
import { Msg, nspct2, LogLevel, MsgLevel, nspect, logRank } from '@eos-makeshift/msg'
import { ctrlLogger } from './utils'
import { readFileSync } from 'node:fs'

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

/**
 * 
 * 
 * @param path relative path to css file
 * @returns {css: string, linterResult: stylelint.LinterResult, error: boolean, errorObj: any}
 */
export async function loadCss(path: string) {
  let ret = {
    themeCssClass: '',
    isLight: false,
    css: '',
    linterResult: {} as stylelint.LinterResult,
    error: false,
    errorObj: null,
  }
  try {
    log.info(`Loading CSS file from ${path}`)
    ret.css = readFileSync(path, 'utf8')
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
      ret.themeCssClass = await getThemeName(ret.css)
      ret.isLight = await checkThemeBrightness(ret.css)
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