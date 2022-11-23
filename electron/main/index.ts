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
  LogLevel,
  LogMessage,
  MakeShiftPort,
  MakeShiftPortFingerprint,
  MsgLevel,
  MakeShiftDeviceEvents,

} from '@eos-makeshift/serial'
import { Msg, nspct2, nspect, logRank } from '@eos-makeshift/msg'
import { plugins, loadPlugins, installPlugin } from './plugins'
import { makeShiftIpcApi, storeKeys } from '../ipcApi'
import { ctrlLogger } from './utils'


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
export let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let menu: Menu | null = null

const nodePathNormalize = normalize
const store = new Store.default()
const textDecoder = new TextDecoder()


export type CueMap = Map<string, Cue>

// TODO: Fix the API so these are real
export type DeviceId = string
export type MakeShiftEvent = string
export type DeviceLayout = Map<MakeShiftEvent, Cue>

const cues: CueMap = new Map()
const deviceLayouts: Map<DeviceId, DeviceLayout> = new Map()
const loadedCues: { [key: string]: CueModule } = {}
let cueWatcher: chokidar.FSWatcher

// Log Levelup
const msgen = new Msg({ host: 'Ctrl', logLevel: 'all' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()

// Set up app directories that are relative to install location
const workingDir = __dirname
const url = process.env.VITE_DEV_SERVER_URL as string

process.env.DIST_ELECTRON = join(workingDir, '..')
process.env.APPROOT = join(process.env.DIST_ELECTRON, '../..')
process.env.DIST = join(process.env.APPROOT, 'dist')
process.env.DIST_CLIENT = join(process.env.DIST, 'client')
if (app.isPackaged) {
  msgen.logLevel = 'info'
  process.env.INSTALLROOT = join(process.env.APPROOT, '../..')
  process.env.PUBLIC = process.env.DIST_CLIENT
  process.env.ASSETS = join(process.env.DIST_CLIENT, 'assets')
} else {
  process.env.INSTALLROOT = process.env.APPROOT
  process.env.PUBLIC = join(process.env.APPROOT, 'public')
  process.env.ASSETS = join(process.env.APPROOT, 'src/assets')
}

// Set up AppData directories
process.env.APPDATA = join(app.getPath('appData'), 'makeshift-ctrl')
process.env.PLUGINS = join(process.env.APPDATA, 'plugins')
process.env.CUES = join(process.env.APPDATA, 'cues')
process.env.TEMP = join(app.getPath('temp'), 'makeshift-ctrl')
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

const preload = join(process.env.DIST_ELECTRON, 'preload/index.js')
const htmlEntry = join(process.env.DIST_CLIENT, './index.html')


// Set up app constants
const Api = makeShiftIpcApi
process.env.MakeShiftSerializedApi = JSON.stringify(makeShiftIpcApi)


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


loadPlugins()
initCues()
// loadPlugins(process.env.APPDATA)


setLogLevel('none')
setPortAuthorityLogLevel('none')

const ipcMainGetHandler = {
  connectedDevices: () => getPortFingerPrintSnapShot(),
  events: () => DeviceEvents,
  logRank: () => logRank,
  allCues: () => cues,
  cueById: (id) => {
    log.info(`got request for cue with id: ${id}`)
    return cues.get(id)},
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
const ipcMainSetHandler = {
  cueFile: async (data: { cueId: string, contents: Uint8Array }) => {
    const { cueId, contents } = data
    // log.debug(nspct2(cueId))
    log.debug(nspct2(data))
    const contentString = textDecoder.decode(contents)
    const fullPath = join(process.env.CUES, cueId)

    try {
      await writeFile(fullPath, contentString)
      return fullPath
    } catch (e) {
      return ''
    }
  }
}
export type IpcMainGetHandler = typeof ipcMainGetHandler
export type IpcMainSetHandler = typeof ipcMainSetHandler

ipcMain.handle(Api.test, () => {
  loadCueDialog().then((cue) => {
    const normPath = nodePathNormalize(cue.path)

    return cue
  }).then((q) => {
    // loadedCues[q.id].run()

    // log.debug(nspct2(loadedCues[q.id]))
    // log.debug(q)
    // log.debug(Object.keys(require.cache).includes(q.modulePath))
  })
})

for (const getter in makeShiftIpcApi.get) {
  ipcMain.handle(makeShiftIpcApi.get[getter], (ev, data) => { return ipcMainGetHandler[getter](data) })
}

for (const setter in makeShiftIpcApi.set) {
  ipcMain.handle(makeShiftIpcApi.set[setter], (ev, data) => { return ipcMainSetHandler[setter](data) })
}
log.debug(nspct2(makeShiftIpcApi.get))


// const devices: MakeShiftPort[] = []


app.whenReady().then(async () => {
  log.info('App ready')

  createMainWindow()
  startAutoScan()


  // const menu = Menu.buildFromTemplate([
  //   {
  //     label: app.name,
  //     submenu: [
  //       {
  //         click: () => mainWindow.webContents.send('update-counter', 1),
  //         label: 'Increment',
  //       },
  //       {
  //         click: () => mainWindow.webContents.send('update-counter', -1),
  //         label: 'Decrement',
  //       }
  //     ]
  //   }
  // ])
  // Menu.setApplicationMenu(menu)

  // Scan only when app has loaded properly

}) //app.whenReady

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    PortAuthority.removeAllListeners()
    app.quit()
  }
})

async function createMainWindow() {
  let windowPos = {
    x: 50,
    y: 50,
    width: 600,
    height: 800,
  } as any

  if (store.has(storeKeys.MainWindowState)) {
    windowPos = store.get(storeKeys.MainWindowState)
  }

  mainWindow = new BrowserWindow({
    title: 'makeshift-ctrl',
    minWidth: 300,
    minHeight: 300,
    x: windowPos.x,
    y: windowPos.y,
    width: windowPos.width,
    height: windowPos.height,
    icon: join(process.env.ASSETS, 'icon/makeshiftctrl_bright.png'),
    webPreferences: {
      preload,
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
    },
  })
  // This loads the index and chains into src/main.ts
  if (app.isPackaged) {
    mainWindow.loadFile(htmlEntry)
  } else {
    mainWindow.loadURL(url)
    // Open devTool if the app is not packaged
    mainWindow.webContents.openDevTools()
  }

  // attach PA listeners
  PortAuthority.on(PortAuthorityEvents.port.opened, mainWindowPortHandler.opened)
  PortAuthority.on(PortAuthorityEvents.port.closed, mainWindowPortHandler.closed)

  mainWindow.on('close', () => {
    const size = mainWindow.getSize()
    const pos = mainWindow.getPosition()
    const newPosition = {
      x: pos[0],
      y: pos[1],
      height: size[1],
      width: size[0],
    }

    store.set(storeKeys.MainWindowState, newPosition)
    log.info(newPosition)

    // detach listeners from PortAuth
    PortAuthority.removeListener(PortAuthorityEvents.port.opened, mainWindowPortHandler.opened)
    PortAuthority.removeListener(PortAuthorityEvents.port.closed, mainWindowPortHandler.closed)

    // detach listeners from Ports
    attachedDeviceIds.forEach((fp) => {
      for (const lv in DeviceEvents.Terminal.Log) {
        Ports[fp.portId].removeListener(DeviceEvents.Terminal.Log[lv as MsgLevel], serialLogToMainWindow)
      }
    })
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
      Ports[fp.portId].on(DeviceEvents.Terminal.Log[lv as MsgLevel], serialLogToMainWindow)
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

async function saveCueFile(data: Buffer, path: string) {
  log.info(path)
}

// app.on('second-instance', () => {
//   createWindow()
// })


// Cues

function attachCue(deviceId: DeviceId, event: MakeShiftEvent, cueId: CueId) {
  // try clobbering events first
  const targetLayout = deviceLayouts.get(deviceId)
  // if (targetLayout.has(event)) {
  //   // find and remove the existing event
  //   const existingCue = targetLayout.get(event)
  //   Ports[deviceId].removeListener(event, loadedCues[existingCue.id].run)
  // }
  Ports[deviceId].removeAllListeners(event)
  Ports[deviceId].on(event, loadedCues[cueId].run as any)
  loadedCues[cueId].runTriggers.push({
    deviceId: deviceId,
    events: [event]
  })
}

async function unloadCueModule(cue: Cue) {
  // this deliberately does not detach any loaded cues
  // to avoid running errors if an event is still attached
  if (typeof loadedCues[cue.id] !== 'undefined') {
    const moduleId = loadedCues[cue.id].moduleId
    log.debug(`Unloading ${cue.id} loaded as ${moduleId}`)
    delete require.cache[moduleId]
  }
}
async function initCues() {
  if (existsSync(join(process.env.CUES, 'examples'))) {

  } else {
    // this should be on first run or if the user nukes 
    // the ../AppData/../makeshift-ctrl folder
    const dest = join(process.env.CUES, 'examples')
    const src = join(process.env.INSTALL_ROOT, 'examples')
    const examples = readdirSync(src)
    log.info(examples)
    examples.forEach((filePath) => {
      copyFileSync(join(src, filePath), join(dest, filePath))
    })
  }
  cueWatcher = chokidar.watch(process.env.CUES, {
    cwd: process.env.CUES
  })
  cueWatcher.on('ready', () => {
    log.info('cueWatcher ready')
  })
  cueWatcher.on('add', path => cueHandler.add(path))
  cueWatcher.on('change', path => cueHandler.add(path))
  cueWatcher.on('unlink', path => cueHandler.unlink(path))
  cueWatcher.on('addDir', path => log.info(`Dir ${path} has been added`))
  cueWatcher.on('unlinkDir', path => log.info(`Dir ${path} has been unlinked`))
  cueWatcher.on('error', err => log.info(`err ${err}`))
}

const cueHandler = {
  add: async function (path) {
    let newCue
    try {
      newCue = pathToCue(path)
      cues.set(newCue.id, newCue)
      newCue.contents = await readFile(newCue.fullPath)
      cues.set(newCue.id, newCue)
      newCue = await importCueModule(newCue)
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
      const maybeCue = pathToCue(path)
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

function pathToCue(path): Cue {
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

// TODO: create temp directory for 'attached' cues
async function importCueModule(cue: Cue) {
  log.debug(`loadedCues[${cue.id}] => ${typeof loadedCues[cue.id]}`)
  if (typeof loadedCues[cue.id] !== 'undefined') {
    // TODO: change to hash checking for better performance
    unloadCueModule(cue)
  }
  // the temporary cue file naming scheme:
  // [folder]-[name]_[id].cue.js
  // where all the path separators are replaced with '-'
  let moduleFile = cue.name + '_' + nanoid() + '.cue.js'
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
    loadedCues[id].setup()
    cue.modulePath = modulePath
    return cue
  } else {
    unloadCueModule(cue)
    delete loadedCues[id]
    throw 'Module missing required exports.'
  }
}

async function loadCueDialog() {
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
      log.info(e)
    }
  }
}

type IModule = typeof Electron.CrossProcessExports

export interface CueModule extends IModule {
  requiredPlugins?: string[],
  plugins?: any,
  setup: Function,
  run: () => void,
  runTriggers?: { deviceId: string, events: string[] }[],
  moduleId: string,
}

type CueId = string
export interface Cue {
  id: CueId,
  file: string,
  fullPath: string,
  name: string,
  folder: string,
  contents?: Buffer
  modulePath?: string
}