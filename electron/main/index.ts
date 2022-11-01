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
import { Events, MakeShiftPort } from '@eos-makeshift/serial'
import { createWindow, restoreWindows } from './window.js'

import { app, Tray, BrowserWindow, shell, ipcMain } from 'electron'

// import { electron } from '../electron.js'
// const { app, BrowserWindow, shell, ipcMain } = electron

const workingDir = __dirname ? __dirname : dirname(fileURLToPath(import.meta.url))
const appDataPath = app.getPath('appData')

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
const url = process.env.VITE_DEV_SERVER_URL as string
const htmlEntry = join(process.env.DIST, './dist/index.html')


app.whenReady().then(async () => {
  console.log('app ready')

  process.env.DIST_ELECTRON = join(workingDir, '..')
  process.env.DIST = join(process.env.DIST_ELECTRON, '../client')
  process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../../public')

  const mainWindow = await restoreWindows()

  const makeShift:MakeShiftPort = new MakeShiftPort({
    logOptions: {
      level: 'info'
    }
  })

  console.log(appDataPath)
  makeShift.setLogToEmit()
  console.log(Events)
  // makeShift.on(Events.TERMINAL.DATA, (data) => {
  //   mainWindow.webContents.send(Events.TERMINAL.DATA, data)
  // })

  makeShift.on(Events.DEVICE.CONNECTED, () => {
    console.log('whoa butt')
  })

  makeShift.on(Events.BUTTON[1].PRESSED, (ev) => {
    console.log('whoa betsy')
    console.dir(ev)
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// app.on('second-instance', () => {
//   createWindow()
// })

