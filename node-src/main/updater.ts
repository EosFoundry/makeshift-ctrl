import { autoUpdater } from "electron-updater"
import { Msg } from "@eos-makeshift/msg"
import { ctrlLogger } from "./utils"


// Create Loggers
const msgen = new Msg({ host: 'Updater', logLevel: 'debug' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()

export const updater = autoUpdater

// Set up autoUpdater
autoUpdater.logger = log as any

export async function initUpdater() {
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...')
  })

  autoUpdater.on('update-available', (info) => {
    log.info('Update available.')
    log.debug(JSON.stringify(info))
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater. ' + err)
  })

  autoUpdater.on('download-progress', (progressObj) => {
    log.debug('Download progress: ' + JSON.stringify(progressObj))
  })

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded')
    // autoUpdater.autoInstallOnAppQuit = true
  })
}