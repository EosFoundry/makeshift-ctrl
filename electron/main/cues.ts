import * as chokidar from 'chokidar'

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve, basename, normalize, sep as pathSep } from 'node:path'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmdirSync, rmSync } from 'original-fs'
import { resolve as resolvePosix, normalize as normalizePosix, } from 'pathe'
import { ensureDir, copyFile, ensureDirSync } from 'fs-extra'
import { v5 as uuidv5, } from 'uuid'
import { pathToFileURL } from 'node:url'

import { Msg, nspct2, LogLevel, MsgLevel, nspect, logRank } from '@eos-makeshift/msg'

import { ctrlLogger } from './utils'
import { dialog } from 'electron'
import { plugins } from './plugins'

export type IModule = typeof Electron.CrossProcessExports

export interface Cue {
  id: CueId,
  file: string,
  fullPath: string,
  name: string,
  folder: string,
  contents?: Buffer
  modulePath?: string
}

export type CueId = string

export type CueMap = Map<string, Cue>

export interface CueModule extends IModule {
  requiredPlugins?: string[],
  plugins?: any,
  setup: Function,
  run: () => void,
  runTriggers: { deviceId: string, events: string[] }[],
  moduleId: string,
}

// Create Loggers
const msgen = new Msg({ host: 'CueHost', logLevel: 'all' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()
const textDecoder = new TextDecoder()

export let cueWatcher: chokidar.FSWatcher
export const cues: CueMap = new Map()
export const loadedCues: { [key: string]: CueModule } = {}


export async function initCues() {
  const examplesFolder = join(process.env.CUES, 'examples')
  if (existsSync(examplesFolder)) {

  } else {
    // this should be on first run or if the user nukes 
    // the ../AppData/../makeshift-ctrl folder
    const dest = examplesFolder
    const src = join(process.env.INSTALL_ROOT, 'examples')
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


export function newCueFromPath(path): Cue {
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
  log.debug(`Adding new file...`)
  log.debug(`path: ${path}`)
  log.debug(`url: ${nspct2(fullPath)}`)
  log.debug(`folder: ${folderName}`)
  log.debug(`file: ${fileName}`)
  log.debug(`cueName: ${cueName}`)
  const id = normalizePosix(path)
  return {
    id: id,
    file: fileName,
    fullPath: fullPath,
    name: cueName,
    folder: folderName,
    modulePath: '',
  } as Cue
}

export async function saveCueFile(data: { cueId: string, contents: Uint8Array }): Promise<string> {
    const { cueId, contents } = data
    // log.debug(nspct2(cueId))
    log.debug(`Saving ${cueId} with data: ${nspct2(data)}`)
    const contentString = textDecoder.decode(contents)
    const fullPath = join(process.env.CUES, cueId)

    try {
      await writeFile(fullPath, contentString)
      return fullPath
    } catch (e) {
      return ''
    }
  }

// TODO: create temp directory for 'attached' cues
export async function importCueModule(cue: Cue): Promise<Cue> {
  log.debug(`importing... ${cue.id}\n\tExisting cue: loadedCues[${cue.id}] => ${typeof loadedCues[cue.id]}`)
  if (typeof loadedCues[cue.id] !== 'undefined') {
    // TODO: change to hash checking for better performance
    log.debug(`Cue ${cue.id} has been loaded as ${nspct2(loadedCues[cue.id])}`)
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

  const modulePath = join(process.env.TEMP, 'cues', moduleFile)
  const id = cue.id

  log.debug(modulePath)
  await ensureDir(join(process.env.TEMP, 'cues'))
  await copyFile(cue.fullPath, modulePath)
  loadedCues[id] = require(modulePath) as CueModule
  loadedCues[id].moduleId = modulePath
  const cueExports = Object.keys(loadedCues[id])
  // log.debug(nspct2(require.cache))
  // big fat type checker
  if (cueExports.includes('requiredPlugins') && Array.isArray(loadedCues[id].requiredPlugins)
    && cueExports.includes('plugins') && typeof loadedCues[id].plugins === 'object'
    && cueExports.includes('setup') && typeof loadedCues[id].setup === 'function'
    && cueExports.includes('run') && typeof loadedCues[id].run === 'function') {
    if (typeof loadedCues[id].requiredPlugins !== 'undefined') {
      loadedCues[id].requiredPlugins.forEach((pluginName) => {
        if (typeof plugins[pluginName] !== 'undefined'
          && pluginName !== 'ctrlTerm') {
          loadedCues[id].plugins[pluginName] = plugins[pluginName]
        }
      })
    }
    loadedCues[id].plugins.msg = new Msg({
      host: 'cue:' + id,
      logger: ctrlLogger,
      showTime: false,
      logLevel: 'all'
    })
    loadedCues[id].plugins.ctrlTerm = loadedCues[id].plugins.msg.getLevelLoggers()
    loadedCues[id].plugins.ctrlTerm.log = loadedCues[id].plugins.ctrlTerm.info
    loadedCues[id].runTriggers = []
    loadedCues[id].setup()
    cue.modulePath = modulePath
    return cue
  } else {
    unloadCueModule(cue)
    delete loadedCues[id]
    throw 'Module missing required exports.'
  }
}

export async function unloadCueModule(cue: Cue) {
  // this deliberately does not detach any loaded cues
  // to avoid running errors if an event is still attached
  if (typeof loadedCues[cue.id] !== 'undefined') {
    const moduleId = loadedCues[cue.id].moduleId
    log.debug(`Unloading ${cue.id} loaded as ${moduleId}`)
    log.debug(`Require cache: ${nspct2(require.cache)}`)
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
