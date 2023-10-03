import * as chokidar from 'chokidar'

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve, basename, normalize, sep as pathSep } from 'node:path'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmdirSync, rmSync } from 'original-fs'
import { resolve as resolvePosix, normalize as normalizePosix, } from 'pathe'
import { ensureDir, copyFile, ensureDirSync } from 'fs-extra'
import { v5 as uuidv5, } from 'uuid'
import { pathToFileURL } from 'node:url'

import { Msg, nspct2, LogLevel, MsgLevel, nspect, logRank } from '@eos-makeshift/msg'

import * as Nut from '@nut-tree/nut-js'
import { ctrlLogger } from './utils'
import { dialog } from 'electron'
import { plugins } from './plugins'
import { Fileio } from './fileio'
// import { DeviceId } from '.'

export type IModule = typeof Electron.CrossProcessExports

export interface Cue {
  id: CueId,
  file: string,
  fullPath: string,
  name: string,
  folder: string,
  contents?: Buffer
}

export type CueId = string

export type CueMap = Map<string, Cue>

export interface CueModule extends IModule {
  suspicions: any,
  id: CueId,
  requiredPlugins?: string[],
  plugins?: any,
  setup: Function,
  run: (eventData?: any) => void,
  runTriggers: {
    [key: string]: {
      events: string[]
    }
  },
  modulePath: string,
  [key: string]: any
}

// Create Loggers
const msgen = new Msg({ host: 'CueHandler', logLevel: 'info' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()
const textDecoder = new TextDecoder()

export let cueWatcher: chokidar.FSWatcher
export const cues: CueMap = new Map()
export const loadedCueModules: { [key: CueId]: CueModule } = {}
let cueTempDir = ''

export async function initCues(opts: { logLvl?: LogLevel}) {
  msgen.logLevel = opts.logLvl || 'info'
  log.info('Initializing CueHandler...')
  const examplesFolder = join(process.env.CUES, 'examples')
  cueTempDir = join(process.env.TEMP, 'temp')
  if (existsSync(examplesFolder) === false) {
    // this should be on first run or if the user nukes
    // the ../AppData/../makeshift-ctrl folder
    const dest = examplesFolder
    const src = join(process.env.RESOURCES, 'examples')
    await ensureDir(dest)
    const examples = await readdir(src)
    examples.forEach((filePath) => {
      copyFileSync(join(src, filePath), join(dest, filePath))
    })
  }
  cueWatcher = chokidar.watch(process.env.CUES, {
    cwd: process.env.CUES
  })
}


export function cueExists(cueId: CueId): boolean {
  return existsSync(join(process.env.CUES, cueId))
}


/**
 * Creates a new cue from a path relative to the default cue folder 
 * i.e.  `{folders if any}/cuefile.cue.js` - the path does not need to exist.
 * @param path 
 */
export function generateCueFromRelativePath(path): Cue {
  const fileName = basename(path)
  const folderName = dirname(path)
  const fullPath = resolve(join(process.env.CUES, path))

  let ext = '.cue.js'
  if (fileName.endsWith('.cue.js')) { ext = '.cue.js' }
  else if (fileName.endsWith('.js')) { ext = '.js' }
  else if (fileName.endsWith('.mjs')) { ext = '.mjs' }
  else if (fileName.endsWith('.cjs')) { ext = '.cjs' }
  else {
    throw 'Path given does not contain a cue file.'
  }
  const cueName = basename(fileName, ext)
  const id = normalizePosix(path)
  log.debug(`Adding new file...`)
  log.debug(`path: ${path}`)
  log.debug(`id: ${id}`)
  log.debug(`fullPath: ${fullPath}`)
  log.debug(`folder: ${folderName}`)
  log.debug(`file: ${fileName}`)
  log.debug(`cueName: ${cueName}`)
  return {
    id: id,
    file: fileName,
    fullPath: fullPath,
    name: cueName,
    folder: folderName,
  } as Cue
}

export async function saveCueFile(data: { cueId: CueId, contents: Uint8Array | string }): Promise<string> {
  const { cueId, contents } = data
  // log.debug(nspct2(cueId))
  log.debug(`Saving ${cueId} with data: ${nspct2(data)}`)

  let contentString

  if (typeof contents !== 'string') {
    contentString = textDecoder.decode(contents)
  } else {
    contentString = contents
  }

  const fullPath = join(process.env.CUES, cueId)

  try {
    await Fileio.writeFile(fullPath, contentString)
    return fullPath
  } catch (e) {
    return ''
  }
}

/**
 * Imports a cue module by generating a temporary file name and copying the cue file to it.
 * If the cue module has already been loaded, it will be unloaded before being reloaded.
 * @param cue The cue to import
 * @returns The imported cue
 */
export async function importCueModule(cue: Cue): Promise<Cue> {
  log.debug(`importing... ${cue.id}\n\tExisting cue: loadedCues[${cue.id}] => ${typeof loadedCueModules[cue.id]}`)
  if (typeof loadedCueModules[cue.id] !== 'undefined') {
    // TODO: change to hash checking for better performance
    log.debug(`Cue ${cue.id} has been loaded as ${nspect(loadedCueModules[cue.id], 0)}`)
    unloadCueModule(cue)
  }
  // the temporary cue file naming scheme:
  // [folder]-[name]_[id].cue.js
  // where all the path separators are replaced with '-'
  let moduleFile = cue.name
  moduleFile += '_'
  moduleFile += uuidv5(cue.name, process.env.NAMESPACE)
  // moduleFile += nanoid()
  moduleFile += '.cue.js'

  if (cue.folder !== '.' && cue.folder !== '' && cue.folder !== '..') {
    moduleFile = cue.folder.replaceAll(pathSep, '-') + '-' + moduleFile
  }

  const modulePath = join(cueTempDir, moduleFile)
  const id = cue.id

  log.debug(modulePath)
  await ensureDir(join(cueTempDir))
  await copyFile(cue.fullPath, modulePath)
  loadedCueModules[id] = require(modulePath) as CueModule
  loadedCueModules[id].id = cue.id
  loadedCueModules[id].modulePath = modulePath
  const cueExports = Object.keys(loadedCueModules[id])

  // log.debug(nspct2(require.cache))

  // big fat type checker
  if (cueExports.includes('requiredPlugins') && Array.isArray(loadedCueModules[id].requiredPlugins)
    && cueExports.includes('plugins') && typeof loadedCueModules[id].plugins === 'object'
    && cueExports.includes('setup') && typeof loadedCueModules[id].setup === 'function'
    && cueExports.includes('run') && typeof loadedCueModules[id].run === 'function') {
    if (typeof loadedCueModules[id].requiredPlugins !== 'undefined') {
      loadedCueModules[id].requiredPlugins.forEach((pluginName) => {
        if (typeof plugins[pluginName] !== 'undefined'
          && pluginName !== 'ctrlTerm') {
          loadedCueModules[id].plugins[pluginName] = plugins[pluginName]
        }
      })
    }
    loadedCueModules[id].plugins.msg = new Msg({
      host: 'cue:' + id,
      logger: ctrlLogger,
      showTime: false,
      logLevel: 'all'
    })
    loadedCueModules[id].plugins.ctrlTerm = loadedCueModules[id].plugins.msg.getLevelLoggers()
    loadedCueModules[id].plugins.ctrlTerm.log = loadedCueModules[id].plugins.ctrlTerm.info
    loadedCueModules[id].plugins.Nut = Nut
    loadedCueModules[id].runTriggers = {}

    // Run module setup
    try {
      loadedCueModules[id].setup()
    } catch (e) {
      unloadCueModule(cue)
      delete loadedCueModules[id]
      throw 'Error when running setup()'
    }
    return cue
  } else {
    unloadCueModule(cue)
    delete loadedCueModules[id]
    throw 'Module missing required exports.'
  }
}


/**
 * Unloads a cue module from memory.
 * @param cue The cue to unload.
 */
export async function unloadCueModule(cue: Cue) {
  // this deliberately does not detach any loaded cues
  // to avoid running errors if an event is still attached
  if (typeof loadedCueModules[cue.id] !== 'undefined') {
    const moduleId = loadedCueModules[cue.id].modulePath

    log.info(`Unloading '${cue.id}' with loaded module: '${moduleId}'`)

    const cacheList = Object.keys(require.cache)
    const cueModulesCacheList = cacheList.filter((val) => {
      const posixPath = normalize(val)
      return posixPath.startsWith(process.env.CUES) || posixPath.startsWith(cueTempDir)
    })

    log.debug(process.env.CUES)
    log.debug(cueTempDir)
    log.debug(`Require cache: ${nspct2(cueModulesCacheList)}`)

    delete require.cache[moduleId]
  }
}

export async function loadCueDialog(): Promise<{ name: string; path: string }> {
  const openResult = await dialog.showOpenDialog({
    filters: [
      {
        name: 'Javascript',
        extensions: ['js', 'mjs', 'cjs']
      },
      {
        name: 'All Files',
        extensions: ['*'],
      },
    ],
    properties: [
      'openFile',
    ]
  })
  if (openResult.canceled === false) {
    try {
      const fp = resolve(openResult.filePaths[0])
      const pathUrl = pathToFileURL(fp)
      let cueName = basename(fp)
      let ext = '.cue.js'
      if (cueName.endsWith('.cue.js')) { ext = '.cue.js' }
      else if (cueName.endsWith('.js')) { ext = '.js' }
      else if (cueName.endsWith('.mjs')) { ext = '.mjs' }
      else if (cueName.endsWith('.cjs')) { ext = '.cjs' }
      else {
        //something has gone wrong
      }

      cueName = basename(fp, ext)

      return {
        name: cueName,
        path: fp,
      }
    } catch (e) {
      log.error(e)
    }
  }
}
