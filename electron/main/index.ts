// The built directory structure
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
import { release } from 'node:os'
import { readdirSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, extname, join, resolve, basename, normalize, sep as pathSep } from 'node:path'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmdirSync, rmSync } from 'original-fs'
import {
  resolve as resolvePosix,
  normalize as normalizePosix,
} from 'pathe'
import { ensureDir, copyFile, ensureDirSync } from 'fs-extra'
import * as chokidar from 'chokidar'
import { pathToFileURL } from 'node:url'

// electron related imports
import { app, Tray, BrowserWindow, shell, ipcMain, Menu, SafeStorage, dialog } from 'electron'
import * as Store from 'electron-store'

// makeshift serial imports
import {
  // emitter apis
  DeviceEvents,
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

} from '@eos-makeshift/serial'

import { Msg, nspct2, LogLevel, MsgLevel, nspect, logRank } from '@eos-makeshift/msg'
import { plugins, initPlugins, installPlugin } from './plugins'
import { ctrlIpcApi, storeKeys } from '../ipcApi'
import { ctrlLogger } from './utils'
import { json } from 'stream/consumers'
import {
  v4 as uuidv4,
  v5 as uuidv5,
} from 'uuid'
import {
  // data structures
  cues, cueWatcher,
  // functions
  initCues, loadedCueModules, importCueModule, saveCueFile, newCueFromPath,
  // types
  CueId, CueMap, CueModule, Cue,
} from './cues'
import internal from 'node:stream'


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

// initializing all independent globals
let attachedDeviceIds: MakeShiftPortFingerprint[] = []
let knownDevices: MakeShiftPortFingerprint[] = [];
let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null
let tray: Tray | null = null
let menu: Menu | null = null

const nodePathNormalize = normalize
const store = new Store.default()
const textDecoder = new TextDecoder()



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
export function getMainWindow(): BrowserWindow { return mainWindow }

const layout: Layout = {
  layers: [new Map()],
  layerLabels: [{
    name: 'base',
    color: '#FFFFFF'
  }],
}
const cueMapLayers: EventCueMap[] = [
  new Map()
]
let currentLayer = 0

// Create Loggers
const msgen = new Msg({ host: 'Ctrl', logLevel: 'all' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()

// Set up app directories that are relative to install location
const workingDir = __dirname
const devUrl = process.env.VITE_DEV_SERVER_URL as string

process.env.DIST_ELECTRON = join(workingDir, '..')
process.env.APPROOT = join(process.env.DIST_ELECTRON, '../..')
process.env.DIST = join(process.env.APPROOT, 'dist')
process.env.DIST_CLIENT = join(process.env.DIST, 'client')

if (app.isPackaged) {
  msgen.logLevel = 'info'
  process.env.INSTALL_ROOT = join(process.env.APPROOT, '../..')
  process.env.PUBLIC = process.env.DIST_CLIENT
  process.env.ASSETS = join(process.env.DIST_CLIENT, 'assets')
} else {
  process.env.INSTALL_ROOT = process.env.APPROOT
  process.env.PUBLIC = join(process.env.APPROOT, 'public')
  process.env.ASSETS = join(process.env.APPROOT, 'src/assets')
}

// Set up data directories
process.env.APPDATA = join(app.getPath('appData'), 'makeshift-ctrl')
process.env.PLUGINS = join(process.env.APPDATA, 'plugins')
process.env.CUES = join(process.env.APPDATA, 'cues')
process.env.TEMP = join(app.getPath('temp'), 'makeshift-ctrl')
if (process.platform === 'darwin') {
  process.env.TEMP = join('/private', process.env.TEMP)
}

ensureDir(process.env.APPDATA)
ensureDir(process.env.PLUGINS)
ensureDir(process.env.CUES)
ensureDir(process.env.TEMP)

// always cleanup temp from last startup
if (existsSync(process.env.TEMP)) {
  rmSync(process.env.TEMP, {
    recursive: true,
  })
}
mkdirSync(process.env.TEMP)

// generate paths for html/js entry points
const preloadScriptPath = join(process.env.DIST_ELECTRON, 'preload/index.js')
const htmlEntry = join(process.env.DIST_CLIENT, './index.html')
const loaderEntry = join(process.env.DIST_CLIENT, './loader.html')

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

log.debug('pkgroot:       ' + process.env.APPROOT)
log.debug('dist:          ' + process.env.DIST)
log.debug('dist_electron: ' + process.env.DIST_ELECTRON)
log.debug('dist_client:   ' + process.env.DIST_CLIENT)
log.debug('assets:        ' + process.env.ASSETS)
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
for (const caller in ctrlIpcApi.call) {
  ipcMain.handle(ctrlIpcApi.call[caller], (ev, data) => {
    return ipcMainCallHandler[caller](data)
  })
}

for (const getter in ctrlIpcApi.get) {
  ipcMain.handle(ctrlIpcApi.get[getter], (ev, data) => {
    return ipcMainGetHandler[getter](data)
  })
}

for (const setter in ctrlIpcApi.set) {
  ipcMain.handle(ctrlIpcApi.set[setter], (ev, data) => {
    return ipcMainSetHandler[setter](data)
  })
}

log.debug(nspct2(ctrlIpcApi.call))
log.debug(nspct2(ctrlIpcApi.get))
log.debug(nspct2(ctrlIpcApi.set))

// Load non-conflicting resources
const preloadBarrier = []
preloadBarrier.push(initPlugins())
preloadBarrier.push(initCues())

// Open splash
app.whenReady().then(createSplashWindow)

// Load resources with preload requirements
const loadingBarrier = []
Promise.all(preloadBarrier).then(() => {
  initLayouts()
}).then(() => {
  log.debug('Loaded Cues:')
  cues.forEach((val, key) => {
    log.debug(`${key}: ${nspect(val, 1)}`)
  })
  // loadingBarrier.push(loadLayouts())
  loadingBarrier.push(attachWatchers())

  PortAuthority.addListener(PortAuthorityEvents.port.opened, addKnownDevice)
  startAutoScan()
}).then(() => {
  // Start application when loading finishes
  Promise.all(loadingBarrier).then(() => {
    splashWindow.hide()
    splashWindow.close()
    createMainWindow()
  })
})


ipcMain.handle(Api.test, () => {
  log.debug(`testerino`)
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
  openCueFolder: () => shell.showItemInFolder(process.env.CUES),
  runCue: async (cueId) => {
    log.debug(`Running cue ${cueId}`)
    try {
      await importCueModule(cues.get(cueId))
      loadedCueModules[cueId].run()
    } catch (e) {
      log.error(`Cue ${cueId} could not be run\n\tIssue: ${e}`)
    }
  }
}

/**
 * IPC Get API
 * 
 * Gets state data in various formats
 */
const ipcMainGetHandler = {
  connectedDevices: () => getPortFingerPrintSnapShot(),
  events: () => DeviceEvents,
  eventsAsList: () => DeviceEventsFlat,
  logRank: () => logRank,
  allCues: () => cues,
  cueById: (id) => {
    log.debug(`Getting cue with id: ${id}`)
    return cues.get(id)
  },
  cueByFolder: (folder) => {
    const cuesInFolder: CueMap = new Map()
    cues.forEach((val, key) => {
      if (val.folder === folder) {
        cuesInFolder.set(key, val)
      }
    })
    return cuesInFolder
  },
}

/**
 * IPC Set API
 * 
 * modifies state
 */
const ipcMainSetHandler = {
  cueFile: saveCueFile,
  cueForEvent: async (data: {
    cueId: string,
    event: string,
    contents: Uint8Array,
  }) => {
    const fullPath = await saveCueFile({
      cueId: data.cueId,
      contents: data.contents,
    })
    await attachCueToEvent({
      cueId: data.cueId,
      event: data.event,
    })

    return fullPath
  },
}

/**
 * Window Creation functions
 */

async function createSplashWindow() {
  log.info('App ready')

  splashWindow = new BrowserWindow({
    show: false,
    frame: false,
    width: 350,
    height: 350,
    transparent: true,
    icon: join(process.env.ASSETS, 'icon/makeshiftctrl_bright.png'),
  })

  if (app.isPackaged) {
    splashWindow.loadURL(loaderEntry)
  } else {
    splashWindow.loadURL(devUrl + '/loader.html')
    // Open devTool if the app is not packaged
  }
  splashWindow.show()
  // splashWindow.webContents.openDevTools()
}

async function createMainWindow() {
  let windowPos = {
    x: 50,
    y: 50,
    width: 700,
    height: 800,
  } as any

  if (store.has(storeKeys.MainWindowState)) {
    windowPos = store.get(storeKeys.MainWindowState)
  }

  mainWindow = new BrowserWindow({
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
  // This loads the index and chains into src/main.ts
  if (app.isPackaged) {
    mainWindow.loadFile(htmlEntry)
  } else {
    mainWindow.loadURL(devUrl)
    // Open devTool if the app is not packaged
    // mainWindow.webContents.openDevTools()
  }

  // attach PA listeners
  PortAuthority.on(PortAuthorityEvents.port.opened, mainWindowPortHandler.opened)
  PortAuthority.on(PortAuthorityEvents.port.closed, mainWindowPortHandler.closed)

  mainWindow.on('ready-to-show', mainWindow.show)
  mainWindow.on('close', () => {
    const size = mainWindow.getSize()
    const pos = mainWindow.getPosition()
    const newPosition = {
      x: pos[0],
      y: pos[1],
      height: size[1],
      width: size[0],
    }

    // detach listeners from Ports
    attachedDeviceIds.forEach((fp) => {
      for (const lv in DeviceEvents.Terminal.Log) {
        Ports[fp.portId].removeListener(
          DeviceEvents.Terminal.Log[lv as MsgLevel],
          serialLogToMainWindow
        )
      }
    })

    store.set(storeKeys.MainWindowState, newPosition)
    log.debug(nspct2(newPosition))

    // detach listeners from PortAuth
    PortAuthority.removeListener(PortAuthorityEvents.port.opened, mainWindowPortHandler.opened)
    PortAuthority.removeListener(PortAuthorityEvents.port.closed, mainWindowPortHandler.closed)

  })

  // mainWindow.on('move', () => {
  //   log.info(mainWindow.getSize())
  //   log.info(mainWindow.getPosition())
  // })

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

// these more or less handle logging, 
// user written code is attached directly in the main process
const mainWindowPortHandler = {
  opened: async function (fp: MakeShiftPortFingerprint) {
    mainWindow.webContents.send(Api.onEv.device.connected, fp)
    for (const lv in DeviceEvents.Terminal.Log) {
      Ports[fp.portId].on(
        DeviceEvents.Terminal.Log[lv as MsgLevel],
        serialLogToMainWindow
      )
    }
    attachedDeviceIds.push[fp.portId]
  },
  closed: async function (fp: MakeShiftPortFingerprint) {
    mainWindow.webContents.send(Api.onEv.device.disconnected, fp)
    attachedDeviceIds = attachedDeviceIds.filter((attached) => {
      return (attached.portId !== fp.portId)
    })
  }
}

async function serialLogToMainWindow(data: LogMessage) {
  mainWindow.webContents.send(Api.onEv.terminal.data, data)
}

// app.on('second-instance', () => {
//   createWindow()
// })

/**
 * Cue section
 */

export async function attachWatchers() {
  cueWatcher.on('ready', () => { log.info('Now watching Cue directory') })
  cueWatcher.on('add', path => cueHandler.add(path))
  cueWatcher.on('change', path => cueHandler.add(path))
  cueWatcher.on('unlink', path => cueHandler.unlink(path))
  cueWatcher.on('addDir', path => log.info(`Dir ${path} has been added`))
  cueWatcher.on('unlinkDir', path => log.info(`Dir ${path} has been unlinked`))
  cueWatcher.on('error', err => log.info(`err ${err}`))
}

export async function attachCueToEvent({ event, cueId }:
  {
    event: MakeShiftEvent;
    cueId: CueId
  }
): Promise<void> {
  if (Object.keys(Ports).length > 0) {
    const deviceId = knownDevices[0].portId;

    // TODO: set up layouts by default
    if (layout.layers[currentLayer].has(event)) {
      log.debug(`Attempting to unload existing event: ${event}`)
      // find and remove the existing event
      const mappedCue = layout.layers[currentLayer].get(event)
      log.debug(`existing cue: ${nspct2(mappedCue)}`)
      Ports[deviceId].removeListener(event, loadedCueModules[mappedCue.id].run)
    }
    log.debug(`Attaching cue ${cueId} to ${event}`)
    try {
      const importedCue = await importCueModule(cues.get(cueId))
      cues.set(cueId, importedCue)

      // clobbering all events is an option if the above is buggy
      // Ports[deviceId].removeAllListeners(event)

      Ports[deviceId].on(event, loadedCueModules[cueId].run as any)

      const layerCue = cues.get(cueId)
      layout.layers[currentLayer].set(event, layerCue)

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
  } else {
    log.error('No MakeShift device found, cue not attached')
  }
}

const cueHandler = {
  add: async function (path) {
    let newCue
    try {
      newCue = newCueFromPath(path)
      cues.set(newCue.id, newCue)
      newCue.contents = await readFile(newCue.fullPath)
      cues.set(newCue.id, newCue)
      log.debug(nspct2(newCue))
    } catch (e) {
      log.warn(`Checking cue: ${path} \n    ${e}`)
    }
    if (mainWindow !== null) {
      mainWindow.webContents.send(Api.onEv.cue.added, newCue)
    }
  },
  unlink: function (path) {
    try {
      const maybeCue = newCueFromPath(path)
      if (mainWindow !== null) {
        mainWindow.webContents.send(Api.onEv.cue.removed, cues.get(maybeCue.id))
      }
      cues.delete(maybeCue.id)
    } catch (e) {
      log.error(`Unabled to load cue from ${path} => ${e}`)
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
    serializedLayout.layers.push(Array.from(layer.entries()))
  })

  log.debug(nspect(serializedLayout, 4))
  store.set(storeKeys.DeviceLayout, serializedLayout)
}

async function loadLayouts() {
  let savedLayout = store.get(storeKeys.DeviceLayout, layout) as any
  currentLayer = 0;
  log.debug('Loading Layouts:')
  // layout.layerLabels = savedLayout.layerLabels
  // layout.layers = []
  // savedLayout.layers.forEach((layerArray) => {
  //   layout.layers.push(new Map(layerArray))
  // })
  log.debug(nspct2(savedLayout))
  log.debug(nspct2(layout))
}

// Handler function, declared here
async function addKnownDevice(fp: MakeShiftPortFingerprint) {
  knownDevices.push(fp)
}

/**
 * Exports
 */

export type IpcMainCallHandler = typeof ipcMainCallHandler
export type IpcMainGetHandler = typeof ipcMainGetHandler
export type IpcMainSetHandler = typeof ipcMainSetHandler