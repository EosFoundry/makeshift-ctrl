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

import { release } from 'os'
import { readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { Stream } from 'node:stream'
import { dirname, join, resolve } from 'pathe'
import * as Store from 'electron-store'
import {
  DeviceEvents, //event api
  Ports, //device object
  setLogLevel, setPortAuthorityLogLevel, //functions
  getPortFingerPrintSnapShot,
  PortAuthority,
  MakeShiftPortAuthorityEvents,
  PortAuthorityEvents,
  logRank,
  LogLevel, LogMessage, MakeShiftPort, MsgLevel, startAutoScan, // types

} from '@eos-makeshift/serial'
// import { createWindow, restoreWindows } from './window.js'

import { app, Tray, BrowserWindow, shell, ipcMain, Menu, SafeStorage, dialog } from 'electron'
import { plugins, loadPlugins, installPlugin } from './plugins'
import { makeShiftIpcApi, storeKeys } from '../ipcApi'
import { existsSync, mkdirSync, ReadStream, rmdirSync, rmSync } from 'original-fs'
import { loadCue, unloadCue } from './cues'
import { initCustomFormatter } from 'vue'

// Disallow multiple instances due to makeshift-serial resource locking
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())
type MakeShiftPortFingerprint = {
  time: number,
  devicePath: string,
  portId: string,
}


// Set up app directories
const workingDir = __dirname
const url = process.env.VITE_DEV_SERVER_URL as string

process.env.DIST_ELECTRON = join(workingDir, '..')
process.env.PKGROOT = join(process.env.DIST_ELECTRON, '../..')
process.env.DIST = join(process.env.PKGROOT, 'dist')
process.env.DIST_CLIENT = join(process.env.DIST, 'client')
if (app.isPackaged) {
  process.env.PUBLIC = process.env.DIST_CLIENT
  process.env.ASSETS = join(process.env.DIST_CLIENT, 'assets')
} else {
  process.env.PUBLIC = join(process.env.PKGROOT, 'public')
  process.env.ASSETS = join(process.env.PKGROOT, 'src/assets')
}

process.env.APPDATA = join(app.getPath('appData'), 'makeshift-ctrl')
process.env.PLUGINS = join(process.env.APPDATA, 'plugins')
process.env.CUES = join(process.env.APPDATA, 'cues')
process.env.TEMP = join(process.env.APPDATA, 'temp')
ensureDir(process.env.APPDATA)
ensureDir(process.env.PLUGINS)
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


// console.log('pkgroot:       ' + process.env.PKGROOT)
// console.log('dist:          ' + process.env.DIST)
// console.log('dist_electron: ' + process.env.DIST_ELECTRON)
// console.log('dist_client:   ' + process.env.DIST_CLIENT)
// console.log('assets:        ' + process.env.ASSETS)
// console.log('public:        ' + process.env.PUBLIC)




let attachedDeviceIds: MakeShiftPortFingerprint[] = []
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let menu: Menu | null = null




const store = new Store.default()
// console.log('poop' + process.env.APPDATA)
// console.log('butt' + process.env.PLUGINS)
const windowTerm = {
  log: function (loggable: string) {
    const data = {
      level: 'info',
      message: loggable.toString(),
      buffer: Buffer.from(loggable.toString())
    } as LogMessage
    if (mainWindow !== null) {
      mainWindow.webContents.send(Api.onEv.terminal.data, data)
    }
    console.log(loggable)
  }
}

loadPlugins()
// loadPlugins(process.env.APPDATA)
unloadCue()


setLogLevel('none')
setPortAuthorityLogLevel('none')

ipcMain.handle(makeShiftIpcApi.get.events, async () => {
  return DeviceEvents
})
ipcMain.handle(Api.test, loadCue)

ipcMain.handle(Api.get.logRank, async () => { return logRank })
ipcMain.handle(Api.get.connectedDevices, async () => {
  // console.log(deviceList)
  return getPortFingerPrintSnapShot()
})


// const devices: MakeShiftPort[] = []


app.whenReady().then(async () => {
  console.log('App ready')

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

  console.log(join(process.env.ASSETS, 'icon/makeshiftctrl_bright.png'))
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
    console.log(newPosition)

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
  //   console.log(mainWindow.getSize())
  //   console.log(mainWindow.getPosition())
  // })


  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

}

function ensureDir(path) {
  if (existsSync(path) === false) {
    try {
      mkdirSync(path)
    } catch (err) {
      console.error(err);
      if (err.code = 'ENOENT') {
        console.error(err);
      }
    }
  }
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

async function save(data: string, path: string) {
  existsSync(path)

}

// app.on('second-instance', () => {
//   createWindow()
// })

