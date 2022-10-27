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

import { release } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'pathe'
import { Events, MakeShiftPort } from '@eos-makeshift/serial'
import { createWindow, restoreWindows } from './window.js'
import { electron } from '../electron.js'

const { app, BrowserWindow, shell, ipcMain } = electron

const __dirname = dirname(fileURLToPath(import.meta.url))

const makeShift = new MakeShiftPort()

makeShift.on(Events.DEVICE.CONNECTED, () => {
  console.log('whoa butt')
})

makeShift.on(Events.BUTTON[1].PRESSED, (ev) => {
  console.log('whoa betsy')
  console.dir(ev)
})

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
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL as string
const htmlEntry = join(process.env.DIST, './dist/index.html')


app.whenReady().then(async () => {
  console.log('app ready')

  process.env.DIST_ELECTRON = join(__dirname, '..')
  process.env.DIST = join(process.env.DIST_ELECTRON, '../client')
  process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST_ELECTRON, '../../public')

  await restoreWindows()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  createWindow()
})

