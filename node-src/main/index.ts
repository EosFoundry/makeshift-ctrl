// The built directory utructure
//
// ├─┬ dist
// │ ├─┬ electron
// │ │ ├─┬ main
// │ │ │ └── index.js
// │ │ └─┬ preload
// │ │   └── index.js
// │ ├── index.html
// │ ├── ...other-static-files-from-public
// │

// File handling imports
import { release, type } from 'node:os'
import { readdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve, basename, normalize, sep as pathSep } from 'node:path'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmdirSync, rmSync } from 'original-fs'
import { ensureDir, copyFile, ensureDirSync } from 'fs-extra'
import * as chokidar from 'chokidar'
import { pathToFileURL } from 'node:url'

// electron related imports
import { app, Tray, BrowserWindow, shell, ipcMain, Menu, SafeStorage, dialog } from 'electron'
import * as Store from 'electron-store'
import { Block } from 'blockly'

// makeshift serial imports
import {
  // emitter apis
  DeviceEvents,
  SerialEvents,
  HardwareDescriptors,
  PortAuthorityEvents,
  // emitter objects
  Ports,
  PortAuthority,
  // functions
  getPortFingerPrintSnapShot,
  startAutoScan,
  setLogLevel,
  setPortAuthorityLogLevel,
  // types
  LogMessage,
  MakeShiftPort,
  MakeShiftPortFingerprint,
  MakeShiftDeviceEvents,
  MakeShiftSerialEvents,
} from '@eos-makeshift/serial'

// Utilities
import { Msg, nspct2, LogLevel, MsgLevel, nspect, logRank } from '@eos-makeshift/msg'
import { json } from 'stream/consumers'
import {
  v4 as uuidv4,
  v5 as uuidv5,
} from 'uuid'
import { Maybe, Just, Nothing } from 'purify-ts/Maybe'

// makeshift ctrl imports
import { plugins, initPlugins, installPlugin } from './plugins'
import { ctrlIpcApi, storeKeys } from '../ipcApi'
import { ctrlLogger } from './utils'
import {
  initBlockly,
  syncGroupsWithToolbox,
  generateCodeFromWorkspace,
  sendBlocks,
  sendDefaultWorkspace,
  saveSerialWorkspace,
  workspaceStore,
  workspaceList,
  deleteSerialWorkspace
} from './blockly'
import {
  // data structures
  cues, cueWatcher,
  // functions
  initCues, loadedCueModules, importCueModule, saveCueFile, generateCueFromRelativePath, cueExists,
  // types
  Cue, CueId, CueMap, CueModule,
} from './cues'
import { DefaultTheme, Theme, loadTheme } from './themes'
import { block } from 'blockly/core/tooltip'
import { maybe } from 'purify-ts'
import { Fileio } from './fileio'


let nanoid
import('nanoid').then((e) => {
  nanoid = e.customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);
})

// Disallow multiple instances due to makeshift-serial resource locking
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (require('electron-squirrel-startup')) { app.exit(); }
require('update-electron-app')({
  repo: 'EosFoundry/makeshift-ctrl',
  updateInterval: '48 hour',
  // logger: electronLog,
})

// initializing all independent globals
let attachedDeviceFingerprints: MakeShiftPortFingerprint[] = []
let knownDeviceFingerprints: MakeShiftPortFingerprint[] = [];
let mainWindow: Maybe<BrowserWindow> = Nothing
let splashWindow: Maybe<BrowserWindow> = Nothing
let tray: Tray | null = null
let menu: Menu | null = null

const store = new Store.default()



// TODO: Fix the API so these are real
export type DeviceId = string
export type MakeShiftEvent = string
export type EventCueMap = Map<MakeShiftEvent, Cue>
export type LayerLabel = {
  name: string,
  color: string,
  graphic?: string,
  audio?: any,
}
export type Layout = {
  layers: EventCueMap[],
  layerLabels: LayerLabel[],
}
// export type CompactedLayout = {
//   layers: Map<MakeShiftEvent, string>[],
//   layerLabels: LayerLabel[],
// }
export type Size = {
  width: number,
  height: number,
}

export function getMainWindow() { return mainWindow }

const layout: Layout = {
  layers: [new Map()],
  layerLabels: [{
    name: 'base',
    color: '#FFFFFF'
  }],
}

let currentLayer = 0

// Create Loggers
const msgen = new Msg({ host: 'Ctrl', logLevel: 'debug' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()

// Set up app directories that are relative to install location
//
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;
const workingDir = __dirname
const devUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL as string

process.env.DIST_NODE = join(workingDir, '..')
process.env.APPROOT = join(process.env.DIST_NODE, '../..')
process.env.DIST = join(process.env.APPROOT, 'dist')
process.env.DIST_RENDERER = join(process.env.DIST, 'renderer')

if (app.isPackaged) {
  // msgen.logLevel = 'info'
  process.env.RESOURCES = join(process.env.APPROOT, '..')
  process.env.PUBLIC = join(process.env.RESOURCES, 'public')
  process.env.DATA = join(process.env.RESOURCES, 'data')
  process.env.ASSETS = join(process.env.DIST_RENDERER, 'assets')
} else {
  process.env.RESOURCES = process.env.APPROOT
  process.env.PUBLIC = join(process.env.APPROOT, 'public')
  process.env.DATA = join(process.env.APPROOT, 'data')
  process.env.ASSETS = join(process.env.APPROOT, 'src/assets')
}

// Set up data directories
process.env.APPDATA = join(app.getPath('appData'), 'makeshift-ctrl')
process.env.PLUGINS = join(process.env.APPDATA, 'plugins')
process.env.CUES = join(process.env.APPDATA, 'cues')
process.env.BLOCKLY_CUES = join(process.env.APPDATA, 'blocks')
process.env.TEMP = join(app.getPath('temp'), 'makeshift-ctrl')
if (process.platform === 'darwin') {
  process.env.TEMP = join('/private', process.env.TEMP)
}

ensureDir(process.env.APPDATA)
ensureDir(process.env.PLUGINS)
ensureDir(process.env.CUES)
ensureDir(process.env.BLOCKLY_CUES)
ensureDir(process.env.TEMP)

// always cleanup temp from last startup
if (existsSync(process.env.TEMP)) {
  rmSync(process.env.TEMP, {
    recursive: true,
  })
}
mkdirSync(process.env.TEMP)

// generate paths for html/js entry points
const preloadScriptPath = join(process.env.DIST_NODE, 'preload/index.js')
const mainHtmlEntry = join(process.env.DIST_RENDERER, './index.html')
const loaderEntry = join(process.env.DIST_RENDERER, './loader.html')

// Set up API constants
const Api = ctrlIpcApi
function flattenEmitterApi(obj) {
  const ret = []
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      ret.push(obj[key])
    } else {
      const subArr = flattenEmitterApi(obj[key])
      if (Array.isArray(subArr)) {
        ret.push(...subArr)
      } else {
        ret.push(subArr)
      }
    }
  }
  return ret
}

const DeviceEventsFlat = flattenEmitterApi(DeviceEvents)
process.env.MakeShiftSerializedApi = JSON.stringify(ctrlIpcApi)
// log.debug(nspct2(DeviceEventsFlat))

log.debug('approot:       ' + process.env.APPROOT)
log.debug('dist:          ' + process.env.DIST)
log.debug('dist_electron: ' + process.env.DIST_NODE)
log.debug('dist_client:   ' + process.env.DIST_RENDERER)
log.debug('assets:        ' + process.env.ASSETS)
log.debug('data:          ' + process.env.DATA)
log.debug('public:        ' + process.env.PUBLIC)
log.debug('appdata:       ' + process.env.APPDATA)
log.debug('plugins:       ' + process.env.PLUGINS)
log.debug('cues:          ' + process.env.CUES)
log.debug('temp:          ' + process.env.TEMP)

if (store.has(storeKeys.UuidNamespace) === false) {
  const namespace = uuidv4()
  store.set(storeKeys.UuidNamespace, namespace)
}
process.env.NAMESPACE = store.get(storeKeys.UuidNamespace) as string

setLogLevel('none')
setPortAuthorityLogLevel('none')

// connects the IPC API handers in three fell swoops

function attachHandlers(api: any, handler: any) {
  for (const event in api) {
    ipcMain.handle(api[event], (ev, data) => {
      return handler[event](data)
    })
  }
}
// for (const caller in ctrlIpcApi.call) {
//   ipcMain.handle(ctrlIpcApi.call[caller], (ev, data) => {
//     return ipcMainCallHandler[caller](data)
//   })
// }

// for (const getter in ctrlIpcApi.get) {
//   ipcMain.handle(ctrlIpcApi.get[getter], (ev, data) => {
//     return ipcMainGetHandler[getter](data)
//   })
// }

// for (const setter in ctrlIpcApi.set) {
//   ipcMain.handle(ctrlIpcApi.set[setter], (ev, data) => {
//     return ipcMainSetHandler[setter](data)
//   })
// }

log.debug(`ctrlIpcApi.call: ${nspect(ctrlIpcApi.call, 1)}`)
log.debug(`ctrlIpcApi.get: ${nspect(ctrlIpcApi.get, 1)}`)
log.debug(`ctrlIpcApi.set: ${nspect(ctrlIpcApi.set, 1)}`)


// Load non-conflicting resources
const preloadBarrier = []
// preloadBarrier.push(initPlugins())
preloadBarrier.push(initBlockly())
preloadBarrier.push(initCues())

// Open splash
app.whenReady()
  .then(createSplashWindow)
  .then(async () => {
    // Load resources with preload requirements
    const loadingBarrier = []
    await Promise.all(preloadBarrier)
    await initLayouts()
    log.debug('Loaded Cues:')
    cues.forEach((val, key) => {
      log.debug(`${key}: ${nspect(val, 1)}`)
    })
    // loadingBarrier.push(loadLayouts())
    loadingBarrier.push(attachCueWatchers())

    PortAuthority.on(PortAuthorityEvents.port.opened, addKnownDevice)
    PortAuthority.on(PortAuthorityEvents.port.closed, removeKnownDevice)

    log.debug('Starting Port Authority')
    startAutoScan()
    log.debug('Awaiting loading barrier')

    // Start application when loading finishes
    await Promise.all(loadingBarrier)
    log.debug('Loading finished')
    splashWindow.map(sw => {
      sw.hide()
      sw.close()
    })
    createMainWindow()
  })



ipcMain.handle(Api.test, async (ev, workspace) => {
  log.debug(`testerino`)
  // const cueName = workspace.blocks.blocks[0].fields['CUE_NAME']
  // log.debug(`cueName: ${cueName}`)
  // const jsCode = await generateCodeFromWorkspace(workspace)
  // const cue = generateCueFromRelativePath(cueName + '.cue.js')
  // log.debug(`jsCode: ${jsCode}`)
  // log.debug(`cue: ${nspct2(cue)}`)
  // saveSerialWorkspace(cue, workspace)
  // saveCueFile({
  //   cueId: cue.id,
  //   contents: jsCode,
  // })
})



// Handle app close
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    PortAuthority.removeAllListeners()
    app.quit()
  }
})

/**
 * IPC Call API
 * 
 * UI interactions with side effects - opening folders, running cues directly
 */
const ipcMainCallHandler = {
  openCueFolder: async () => shell.showItemInFolder(process.env.CUES),
  runCue: async (cueId) => {
    log.debug(`Running cue ${cueId}`)
    try {
      await importCueModule(cues.get(cueId))
      loadedCueModules[cueId].run({
        state: true,
        event: 'test',
      })
    } catch (e) {
      log.error(`Cue ${cueId} could not be run.`)
      log.error(e)
    }
  },
  fetchBlocklyToolbox: async () => {
    syncGroupsWithToolbox()
  },
  fetchBlocklyBlocks: async () => {
    sendBlocks()
  },
  fetchBlocklyDefaultWorkspace: async () => {
    sendDefaultWorkspace()
  }
}

/**
 * IPC Get API
 * 
 * Gets state data in various formats
 */
const ipcMainGetHandler = {
  connectedDevices: async () => getPortFingerPrintSnapShot(),
  deviceEvents: async (): Promise<MakeShiftDeviceEvents> => DeviceEvents,
  serialEvents: async (): Promise<MakeShiftSerialEvents> => SerialEvents,
  hardwareDescriptors: async () => HardwareDescriptors,
  eventsAsList: async () => DeviceEventsFlat,
  logRank: async () => logRank,
  allCues: async () => cues,
  cuesAttachedToEvent: async (event: string): Promise<CueId | undefined> => {
    log.debug(`cuesAttachedToEvent: ${event}`)
    log.debug(`layout: ${nspct2(Array.from(layout.layers[currentLayer].keys()))}`)
    log.debug(`cue: ${nspct2(layout.layers[currentLayer].get(event))}`)
    const maybeCue = layout.layers[currentLayer].get(event)

    if (maybeCue !== undefined) {
      return maybeCue.id
    }
    return undefined
  },
  cueById: async (id) => cues.get(id),
  cueByFolder: async (folder) => {
    const cuesInFolder: CueMap = new Map()
    cues.forEach((val, key) => {
      if (val.folder === folder) {
        cuesInFolder.set(key, val)
      }
    })
    return cuesInFolder
  },
  clientSize: async (): Promise<Size> => {
    const sizeArray = mainWindow
      .map(mw => mw.getContentSize())
      .orDefault([0, 0])
    return { width: sizeArray[0], height: sizeArray[1] }
  },
  blocklyToolbox: async (): Promise<any> => {
    return 'toaster'
  },
  allBlocklySerialWorkspaceNames: async (): Promise<string[]> => {
    return Object.keys(workspaceList)
  },
  blocklySerialWorkspace: async (workspaceKey): Promise<any> => {
    log.debug(`blocklySerialWorkspace: ${workspaceKey}`)
    log.debug(`workspaceList: ${nspct2(workspaceList[workspaceKey])}`)
    return workspaceList[workspaceKey]
  },
  blockGenerator: async (block: Block): Promise<any> => {
    return 'toaster'
  },
  storedObjectKeys: async () => {
    return ['test', 'test2']
  },
  defaultTheme: async (): Promise<Theme> => DefaultTheme,
  themeFromPath: async (path: string): Promise<Theme> => {
    const loadResult = await loadTheme(path)
    if (loadResult.error) {
      log.error(`Theme load error: ${loadResult.error}`)
      return DefaultTheme
    } else {
      return loadResult.theme

    }
  },
}

/**
 * IPC Set API
 * 
 * modifies state
 */
const ipcMainSetHandler = {
  serialWorkspaceAsCue: async (serialWorkspace) => {
    // Code generation works as a pseudo type checker
    return (await generateCodeFromWorkspace(serialWorkspace)).mapOrDefault(jsCode => {
      const cueName = serialWorkspace.blocks.blocks[0].fields['CUE_NAME']
      log.debug(`cueName: ${cueName}`)
      const cue = generateCueFromRelativePath(cueName + '.cue.js')

      log.debug(`cue: ${nspct2(cue)}`)
      // This line saves the blocks that the user created
      saveSerialWorkspace(cue, serialWorkspace)

      log.debug(`jsCode: ${jsCode}`)
      // This line saves the cue generated from the blocks
      saveCueFile({
        cueId: cue.id,
        contents: jsCode,
      })
      return cue
    }, undefined)
  },
  cueFile: saveCueFile,
  blocklyWorkspaceForEvent: async (data: {
    workspaceName: string,
    event: string,
  }) => {
    const { workspaceName, event } = data;
    (await generateCodeFromWorkspace(workspaceList[workspaceName])).mapOrDefault(jsCode => {
      const cueName = workspaceList[workspaceName].blocks.blocks[0].fields['CUE_NAME']
      log.debug(`cueName: ${cueName}`)
      const cue = generateCueFromRelativePath(cueName + '.cue.js')
      log.debug(`cue: ${nspct2(cue)}`)
      saveSerialWorkspace(cue, workspaceList[workspaceName])
      log.debug(`jsCode: ${jsCode}`)
      saveCueFile({
        cueId: cue.id,
        contents: jsCode,
      })
      attachCueToEvent({
        layerName: 'base',
        cueId: cue.id,
        event: event,
      })
      return cue
    }, undefined)
  },
  cueForEvent: async (data: {
    cueId: string,
    event: string,
    contents?: Uint8Array,
  }) => {
    log.debug(`cueForEvent: ${nspct2(data)}`)
    log.debug(`cues: ${nspct2(cues.get(data.cueId))}`)
    if (data.contents !== undefined) {
      const fullPath = await saveCueFile({
        cueId: data.cueId,
        contents: data.contents,
      })
      return fullPath
    } else if (cues.get(data.cueId) !== undefined) {
      await attachCueToEvent({
        layerName: 'base',
        cueId: data.cueId,
        event: data.event,
      })

      return cues.get(data.cueId).fullPath
    }

    return undefined
  },
}

const ipcMainDeleteHandler = {
  workspace: async (workspaceName: string) => {
    deleteSerialWorkspace(workspaceName)
    log.info(`Deleting workspace: ${workspaceName}`)
    log.debug(cues.get(workspaceName))
    for (const key of cues.keys()) {
      log.debug(`key: ${key}`)
    }

    if (cues.get(workspaceName) !== undefined) {
      Fileio.unlink(join(process.env.CUES, workspaceName))
    }
  },
}

attachHandlers(ctrlIpcApi.call, ipcMainCallHandler)
attachHandlers(ctrlIpcApi.get, ipcMainGetHandler)
attachHandlers(ctrlIpcApi.set, ipcMainSetHandler)
attachHandlers(ctrlIpcApi.delete, ipcMainDeleteHandler)

/**
 * Window Creation functions
 */

async function createSplashWindow() {
  log.info('App ready, creating splash window...')

  const splash = new BrowserWindow({
    show: false,
    frame: false,
    width: 350,
    height: 350,
    transparent: true,
    icon: join(process.env.ASSETS, 'icon/makeshiftctrl_bright.png'),
  })

  splashWindow = Just(splash)

  if (app.isPackaged) {
    splash.loadURL(loaderEntry)
  } else {
    splash.loadURL(devUrl + '/loader.html')
    // Open devTool if the app is not packaged
  }
  splash.show()
  // splashWindow.webContents.openDevTools()
}

async function createMainWindow() {
  let windowPos = {
    x: 50,
    y: 50,
    width: 1000,
    height: 800,
  } as any

  if (store.has(storeKeys.MainWindowState)) {
    windowPos = store.get(storeKeys.MainWindowState)
  }

  const mw = new BrowserWindow({
    show: false,
    title: 'makeshift-ctrl',
    minWidth: 300,
    minHeight: 300,
    x: windowPos.x,
    y: windowPos.y,
    width: windowPos.width,
    height: windowPos.height,
    icon: join(process.env.ASSETS, 'icon/makeshiftctrl_bright.png'),
    webPreferences: {
      preload: preloadScriptPath,
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow = Just(mw)

  // This loads the index and chains into src/main.ts
  if (app.isPackaged) {
    mw.loadFile(mainHtmlEntry)
  } else {
    mw.loadURL(devUrl)
    // Open devTool if the app is not packaged
    mw.webContents.openDevTools()
  }

  // attach PA listeners
  PortAuthority.on(PortAuthorityEvents.port.opened, portAuthorityEventHandler.opened)
  PortAuthority.on(PortAuthorityEvents.port.closed, portAuthorityEventHandler.closed)

  mw.on('ready-to-show', mw.show)
  mw.on('close', () => {
    const size = mw.getSize()
    const pos = mw.getPosition()
    const newPosition = {
      x: pos[0],
      y: pos[1],
      height: size[1],
      width: size[0],
    }


    store.set(storeKeys.MainWindowState, newPosition)
    log.debug(nspct2(newPosition))

    // detach listeners from PortAuth
    PortAuthority.removeAllListeners()

    // detach listeners from Ports
    for (const fp of attachedDeviceFingerprints) {
      for (const lv in SerialEvents.Log) {
        Ports[fp.deviceSerial].removeAllListeners()
      }
    }
  })

  // mainWindow.on('move', () => {
  //   log.info(mainWindow.getSize())
  //   log.info(mainWindow.getPosition())
  // })

  // Make all links open with the browser, not with the application
  mw.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

}

// these more or less handle logging, 
// user written code is attached directly in the main process
const portAuthorityEventHandler = {
  opened: async function (fp: MakeShiftPortFingerprint) {
    mainWindow.ifJust(mw => {
      mw.webContents.send(Api.onEv.device.connected, fp)
      for (const lv in SerialEvents.Log) {
        Ports[fp.deviceSerial].on(
          SerialEvents.Log[lv as MsgLevel],
          serialLogToMainWindow
        )
      }
      attachedDeviceFingerprints.push[fp.deviceSerial]
    })
  },
  closed: async function (fp: MakeShiftPortFingerprint) {
    mainWindow.ifJust(mw => {
      mw.webContents.send(Api.onEv.device.disconnected, fp)
      attachedDeviceFingerprints = attachedDeviceFingerprints.filter((attached) => {
        return (attached.deviceSerial !== fp.deviceSerial)
      })
    })
  }
}

async function serialLogToMainWindow(data: LogMessage) {
  mainWindow.ifJust(mw => {
    try {
      mw.webContents.send(Api.onEv.terminal.data, data)
    } catch (e) {
      log.error(`Could not send serial log to mainWindow\n\tIssue: ${e}`)
    }
  })
}


/**
 * Cue section
 */

function runCue(eventData) {
  log.debug(`running cue attached to event: ${nspct2(eventData)}`)
  const targetCue = layout.layers[currentLayer].get(eventData.event)
  if (typeof targetCue !== 'undefined') {
    log.debug(`found attached cue with id: ${targetCue.id}`)
    log.debug(`cue fullPath: ${targetCue.fullPath}`)
    try {
      loadedCueModules[targetCue.id].run(eventData)
    } catch (err) {
      log.error(err)
    }
  } else {
    log.debug(`no cue attached to event: ${eventData.event}`)
  }
}


export async function detachCueFromEvent({ layerName, event, cueId }:
  {
    layerName: string,
    event: MakeShiftEvent,
    cueId: CueId
  }
): Promise<void> {
  if (Object.keys(Ports).length > 0) {
    const deviceId = knownDeviceFingerprints[0].deviceSerial;

    let targetLayer = layout.layerLabels.findIndex(label => label.name === layerName)
    if (targetLayer === -1) { targetLayer = 0 }
    if (layout.layers[targetLayer].has(event)) {
      log.debug(`Attempting to unload existing event: ${event}`)
      // find and remove the existing event
      const mappedCue = layout.layers[targetLayer].get(event)
      log.debug(`existing cue: ${nspct2(mappedCue)}`)
      layout.layers[targetLayer].delete(event)
    }
  }
}

export async function attachCueToEvent({ layerName, event, cueId }:
  {
    layerName: string,
    event: MakeShiftEvent,
    cueId: CueId
  }
): Promise<void> {

  if (Object.keys(Ports).length <= 0) {
    log.error('No MakeShift device found, cue not attached')
    return
  }

  const deviceId = knownDeviceFingerprints[0].deviceSerial;

  let targetLayer = layout.layerLabels.findIndex(label => label.name === layerName)
  if (targetLayer === -1) { targetLayer = 0 }

  // TODO: set up layouts by default
  if (layout.layers[targetLayer].has(event)) {
    log.debug(`Attempting to unload existing event: ${event}`)
    // find and remove the existing event
    const mappedCue = layout.layers[targetLayer].get(event)
    log.debug(`existing cue: ${nspct2(mappedCue)}`)
  }

  log.debug(`Attaching cue ${cueId} to ${event}`)
  try { //actually load and attach cue after error checks pass
    const importedCue = await importCueModule(cues.get(cueId))
    cues.set(cueId, importedCue)

    const layerCue = cues.get(cueId)
    layout.layers[targetLayer].set(event, layerCue)

    if (typeof loadedCueModules[cueId].runTriggers[deviceId] === 'undefined') {
      log.debug(`Creating run trigger record for device: ${deviceId}`)
      loadedCueModules[cueId].runTriggers[deviceId] = { events: [] }
    }

    loadedCueModules[cueId].runTriggers[deviceId].events.push(event)

    saveLayouts()

    log.info(`Cue ${cueId} set to run for event: ${event}`)
  } catch (e) {
    log.error(`Cue ${cueId} could not be assigned to ${event}\n\t Issue: ${e}`)
  }
}

async function attachCueWatchers() {
  cueWatcher.on('ready', () => { log.info('Now watching Cue directory') })
  cueWatcher.on('add', path => cueWatcherHandler.add(path))
  cueWatcher.on('change', path => cueWatcherHandler.add(path))
  cueWatcher.on('unlink', path => cueWatcherHandler.unlink(path))
  cueWatcher.on('addDir', path => log.debug(`Added directory to watch list: ${path}`))
  cueWatcher.on('unlinkDir', path => log.debug(`Removing directory from watch list: ${path}`))
  cueWatcher.on('error', err => log.debug(`err ${err}`))
}

export const cueWatcherHandler = {
  add: async function (path) {
    let newCue
    try {
      newCue = generateCueFromRelativePath(path)
      cues.set(newCue.id, newCue)
      newCue.contents = await readFile(newCue.fullPath)
      cues.set(newCue.id, newCue)
      // log.debug(nspct2(newCue))
      log.debug(`Created new cue from ${path}`)
    } catch (e) {
      log.debug(`Checked ${path}\n\t${e}`)
    }
    mainWindow.ifJust(mw => {
      mw.webContents.send(Api.onEv.cue.added, newCue)
    })
  },
  unlink: function (path) {
    try {
      const maybeCue = generateCueFromRelativePath(path)
      mainWindow.ifJust(mw => {
        mw.webContents.send(Api.onEv.cue.removed, cues.get(maybeCue.id))
      })
      cues.delete(maybeCue.id)
    } catch (e) {
      log.debug(`Unabled to remove cue, might not be a cue? path: ${path} => ${e}`)
      return
    }
  },
  addDir: function (path) { },
  unlinkDir: function (path) { },
  error: function (path) { },
}


/**
 * Layout section
 */

async function initLayouts() {
  await loadLayouts()
}

async function saveLayouts() {
  log.debug('Saving Layouts:')
  log.debug(nspct2(layout))
  let serializedLayout = {
    layers: [],
    layerLabels: layout.layerLabels,
  }

  layout.layers.forEach((layer) => {
    log.debug(layer)
    const serialLayer = new Map()
    layer.forEach((cue, event) => {
      serialLayer.set(event, cue.id)
    })
    serializedLayout.layers.push(Array.from(serialLayer.entries()))
  })

  log.debug(nspect(serializedLayout, 4))
  store.set(storeKeys.DeviceLayout, serializedLayout)
}

async function loadLayouts() {
  let savedLayout = store.get(storeKeys.DeviceLayout, null) as any
  currentLayer = 0;
  log.debug('Loading Layouts...')
  if (savedLayout === null) { return }
  if (typeof savedLayout.layerLabels === 'undefined') { return }
  let tempLayout: Layout = {
    layerLabels: savedLayout.layerLabels,
    layers: []
  }
  savedLayout.layers.forEach(async (layerArray) => {
    // log.debug(`layerArray: ${nspct2(layerArray)}`)
    const existsArray = []
    for (const pair of layerArray) {
      log.debug(`Found event mapping: ${nspct2(pair)}`)
      const cueId = pair[1]
      if (cueExists(pair[1])) {
        try {
          await cueWatcherHandler.add(cueId)

          importCueModule(cues.get(cueId))
          pair[1] = cues.get(cueId)
          existsArray.push(pair)
          // log.debug(`array pair pt 2 ${nspct2(pair)}`)
        } catch (e) { }
      }
    }

    // log.debug(`existsArray: ${nspct2(existsArray)}`)
    const layerMap = new Map(existsArray) as EventCueMap
    // log.debug(`layerMap: ${nspct2(layerMap)}`)
    tempLayout.layers.push(layerMap)
  })

  layout.layers = tempLayout.layers
  layout.layerLabels = tempLayout.layerLabels

  // log.debug(nspect(savedLayout, 4))
  // log.debug(nspct2(tempLayout))
  log.debug(`Loaded Layouts: ${nspct2(layout)}`)
}

// Handler function, declared here
async function addKnownDevice(fp: MakeShiftPortFingerprint) {
  knownDeviceFingerprints.push(fp)
  DeviceEvents.BUTTON.forEach((evObj) => {
    Ports[fp.deviceSerial].on(evObj.PRESSED, runCue)
    Ports[fp.deviceSerial].on(evObj.RELEASED, runCue)
  })
  DeviceEvents.DIAL.forEach((evObj) => {
    Ports[fp.deviceSerial].on(evObj.INCREMENT, runCue)
    Ports[fp.deviceSerial].on(evObj.DECREMENT, runCue)
  })
}

async function removeKnownDevice(fp: MakeShiftPortFingerprint) {
  knownDeviceFingerprints = knownDeviceFingerprints.filter(knownFingerprint => fp.deviceSerial !== knownFingerprint.deviceSerial)
}

/**
 * Exports
 */

export type IpcMainCallHandler = typeof ipcMainCallHandler
export type IpcMainGetHandler = typeof ipcMainGetHandler
export type IpcMainSetHandler = typeof ipcMainSetHandler
export type ipcMainDeleteHandler = typeof ipcMainDeleteHandler
