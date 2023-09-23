// import * as chokidar from 'chokidar'
import { Msg } from '@eos-makeshift/msg'
import { dialog } from 'electron'
import { fork } from 'node:child_process'
import { readdir, mkdir } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from 'original-fs'
import { isAbsolute, join } from 'pathe'
import { ctrlIpcApi, storeKeys } from '../ipcApi'

export const plugins = {}
const msgen = new Msg({
  host: 'Plugins',
  showTime: false,
  logLevel: 'debug',
})

let pluginHost
const log = msgen.getLevelLoggers()

export async function initPlugins() {
  log.info(process.env.APPROOT)
  log.info('Initializing plugins...')
  // setTimeout(() => {
  //   pluginHost.kill()
  // }, 1000)
  startHost()
}

function startHost() {
  pluginHost = fork(join(process.env.DIST_NODE, 'plugin/host.js'))
  pluginHost.on('message', (msg) => {
    log.debug(msg)
  })
  pluginHost.on('error', (err) => {
    log.error('pluginHost error')
    log.error(err)
  })
  pluginHost.on('exit', (code, signal) => {
    log.debug('pluginHost exited')
    log.debug(code)
    log.debug(signal)
  })
  pluginHost.send({ msg: 'hello' })

}

export function reloadHost(){
  pluginHost.kill()
}

function getPluginFolders() {}

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
      'multiSelections'
    ]
  })

  if (openResult.canceled === false) {
    log.debug(openResult)
    log.debug(process.env.TEMP)
  }
}


async function load(pluginFolder: string) {
  const manifestPath = join(pluginFolder, 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  const name = manifest.name
  const pluginPath = join(pluginFolder, (name + '.mkshftpb.js'))
  const plugPathUrl = pathToFileURL(pluginPath)

  log.debug(manifest)
  log.debug(pluginPath)
  log.debug(isAbsolute(pluginPath))
  log.debug(plugPathUrl)
  log.debug(lstatSync(pluginPath).isFile())
  log.debug(plugins)
}

export class Plugin {
  constructor(pluginId: string) {
    log.info('Plugin class instantiated')
  }
}
