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

import { app, Tray, BrowserWindow, shell, ipcMain, Menu } from 'electron'
import { makeShiftIpcApi } from '../ipcApi'

type MakeShiftPortFingerprint = {
  time: number,
  devicePath: string,
  portId: string,
}

// import { electron } from '../electron.js'
// const { app, BrowserWindow, shell, ipcMain } = electron

const workingDir = __dirname ? __dirname : dirname(fileURLToPath(import.meta.url))
const appDataPath = app.getPath('appData')
const Api = makeShiftIpcApi

process.env.DIST_ELECTRON = join(workingDir, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../client')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../../public')
process.env.MakeShiftSerializedApi = JSON.stringify(makeShiftIpcApi)

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// Here, you can also use other preload
const preload = join(workingDir, '../preload/index.js')
const assetDir = join(workingDir, '../assets/')
const url = process.env.VITE_DEV_SERVER_URL as string
const htmlEntry = join(process.env.DIST, './dist/index.html')
let deviceList: MakeShiftPortFingerprint[] = []
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let menu: Menu | null = null

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
    x: 0,
    y: 0,
    height: 800,
    width: 600,
    icon: './assets/icon/iconbright.png',
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

  // setup Renderer -> Main handlers
  ipcMain.handle(Api.get.logRank, async () => { return logRank })
  ipcMain.handle(Api.get.connectedDevices, async () => {
    console.log(deviceList)
    return getPortFingerPrintSnapShot()
  })
  PortAuthority.on(PortAuthorityEvents.port.opened, (fp) => {
    mainWindow.webContents.send(Api.onEv.device.connected, fp)
    hookupDevice(fp.portId, mainWindow)
  })
  PortAuthority.on(PortAuthorityEvents.port.closed, (fp) => {
    mainWindow.webContents.send(Api.onEv.device.disconnected, fp)
  })


  function hookupDevice(id: string, window: BrowserWindow) {
    for (const lv in DeviceEvents.Terminal.Log) {
      console.log(lv)
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

