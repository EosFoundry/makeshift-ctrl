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
import { fileURLToPath } from 'url'
import { dirname, join } from 'pathe'
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
import { loadPlugins } from './plugins'
import { makeShiftIpcApi, storeKeys } from '../ipcApi'

type MakeShiftPortFingerprint = {
  time: number,
  devicePath: string,
  portId: string,
}

// import { electron } from '../electron.js'
// const { app, BrowserWindow, shell, ipcMain } = electron

const workingDir = __dirname
const appDataPath = join(app.getPath('appData'), 'makeshift-ctrl')
const Api = makeShiftIpcApi
const store = new Store.default()
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
  process.env.ASSETS = join(process.env.PKGROOT, 'assets')
}

process.env.MakeShiftSerializedApi = JSON.stringify(makeShiftIpcApi)
const preload = join(process.env.DIST_ELECTRON, 'preload/index.js')
const htmlEntry = join(process.env.DIST_CLIENT, './index.html')

console.log(import.meta.url)
console.log(__dirname)
console.log(process.env.PKGROOT)
console.log(process.env.DIST)
console.log(process.env.DIST_ELECTRON)
console.log(process.env.DIST_CLIENT)
console.log(process.env.ASSETS)
console.log(process.env.PUBLIC)

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}



let deviceList: MakeShiftPortFingerprint[] = []
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let menu: Menu | null = null

loadPlugins(appDataPath)

let windowPos = {
  x: 50,
  y: 50,
  width: 600,
  height: 800,
} as any

if (store.has(storeKeys.MainWindowState)) {
  windowPos = store.get(storeKeys.MainWindowState)
}

setLogLevel('none')
setPortAuthorityLogLevel('none')

// const devices: MakeShiftPort[] = []

app.whenReady().then(async () => {
  console.log('App ready')

  ipcMain.handle(makeShiftIpcApi.get.events, async () => {
    return DeviceEvents
  })

  const mainWindow = new BrowserWindow({
    title: 'makeshift-ctrl',
    minWidth: 300,
    minHeight: 300,
    x: windowPos.x,
    y: windowPos.y,
    width: windowPos.width,
    height: windowPos.height,
    icon: './assets/icon/iconbright.png',
    webPreferences: {
      preload,
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

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
    // console.log(newPosition)
  })
  // mainWindow.on('move', () => {
  //   console.log(mainWindow.getSize())
  //   console.log(mainWindow.getPosition())
  // })

  // This loads the index and chains into src/main.ts
  if (app.isPackaged) {
    mainWindow.loadFile(htmlEntry)
  } else {
    mainWindow.loadURL(url)
    // Open devTool if the app is not packaged
    mainWindow.webContents.openDevTools()
  }

  // Make all links open with the browser, not with the application
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // @TODO open new  web view
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

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

  startAutoScan()

  deviceList.forEach(async (ms) => {
    const id = ms.portId
  })

  // dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }).then((aaa) => {
  //   console.log(aaa)
  // })

  // setup Renderer -> Main handlers
  ipcMain.on(Api.test, handleTest)
  ipcMain.handle(Api.get.logRank, async () => { return logRank })
  ipcMain.handle(Api.get.connectedDevices, async () => {
    // console.log(deviceList)
    return getPortFingerPrintSnapShot()
  })
  PortAuthority.on(PortAuthorityEvents.port.opened, (fp) => {
    mainWindow.webContents.send(Api.onEv.device.connected, fp)
    hookupDevice(fp.portId, mainWindow)
  })
  PortAuthority.on(PortAuthorityEvents.port.closed, (fp) => {
    mainWindow.webContents.send(Api.onEv.device.disconnected, fp)
  })

  //handlers - avoid using `this` when writing
  async function handleTest(event, data) {
    // console.dir(event)
    // console.dir(data)

  }
  function hookupDevice(id: string, window: BrowserWindow) {
    for (const lv in DeviceEvents.Terminal.Log) {
      Ports[id].on(DeviceEvents.Terminal.Log[lv as MsgLevel],
        async (data: LogMessage) => {
          // console.dir(data)
          // console.log(data.buffer.toString('utf-8'))
          window.webContents.send(Api.onEv.terminal.data, data)
        })
    }
    // connect device APIs
  }
}) //app.whenReady

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// app.on('second-instance', () => {
//   createWindow()
// })

