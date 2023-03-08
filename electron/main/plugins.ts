// import * as chokidar from 'chokidar'
import { Msg } from '@eos-makeshift/msg'
import { dialog } from 'electron'
import { readdir, mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from 'original-fs'
import { isAbsolute, join } from 'pathe'
import { ctrlIpcApi, storeKeys } from '../ipcApi'
import { ctrlLogger } from './utils'

export const plugins = {}
const msgen = new Msg({
  host: 'Plugins',
  showTime: false,
  logLevel: 'info',
  logger: ctrlLogger
})

const log = msgen.getLevelLoggers()

export async function initPlugins() {
  try {
    const dir = await readdir(process.env.PLUGINS)
    log.debug(dir)
    dir.forEach(async (path) => {
      const plugPath = join(process.env.PLUGINS, path)
      const toast = await readdir(plugPath)
      log.debug(toast)
      const manifest = join(plugPath, 'manifest.json')
      if (lstatSync(manifest).isFile()) {
        if (lstatSync(plugPath).isDirectory()) {
          load(plugPath)
        }
        // } else {
        //   // nuke the directory if it does not contain a plugin
        //   rmSync(process.env.TEMP, {
        //     recursive: true,
        //   })
      }
    })
  } catch (err) {
    log.error(err)
  }
}

export async function installPlugin() {
  const openResult = await dialog.showOpenDialog({
    filters: [
      {
        name: '.zip',
        extensions: ['zip']
      },
      {
        name: 'All Files',
        extensions: ['*'],
      },
    ],
    properties: [
      'openFile',
      'multiSelections']
  })

  if (openResult.canceled === false) {
    log.info(openResult)
    log.info(process.env.TEMP)
  }
}

async function load(pluginFolder: string) {
  const manifestPath = join(pluginFolder, 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  const name = manifest.name
  const pluginPath = join(pluginFolder, (name + '.mkshftpb.js'))
  const plugPathUrl = pathToFileURL(pluginPath)

  // log.info(manifest)
  // log.info(pluginPath)
  // log.info(isAbsolute(pluginPath))
  // log.info(plugPathUrl)
  // log.info(lstatSync(pluginPath).isFile())
  plugins[name] = await import(plugPathUrl.href)
  // log.info(plugins)
}
