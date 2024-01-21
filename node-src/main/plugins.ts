// import * as chokidar from 'chokidar'
import { dialog } from 'electron'
import { pathToFileURL } from 'node:url'
import { existsSync, lstatSync, readdirSync, readFileSync, rmSync } from 'original-fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join } from 'pathe'
import { Worker } from 'node:worker_threads'

import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'

import { Msg } from '@eos-makeshift/msg'

import { ctrlIpcApi, storeKeys } from '../ipcApi'
import { RpcRequestHeap, RequestMessage, RpcRequest, WorkerAPI, WorkerNotification } from '../pluginTypes'

export type Plugin = {
  name: string,
  path: string,
  manifest: any,
  id: string,
  worker: PluginWorker,
}

export const plugins = new Map<string, Plugin>()

const msgen = new Msg({
  host: 'Plugins',
  showTime: false,
  logLevel: 'info',
})

const log = msgen.getLevelLoggers()


const fakePluginNamesList = [
  'plugin1',
  'plugin2',
  'plugin3',
]


export async function initPlugins() {
  log.info(process.env.APPROOT)
  log.info('Initializing plugins...')
  fakePluginNamesList.forEach((pluginName) => {
    plugins[pluginName] = new PluginWorker(
      join(process.env.DIST_PLUGIN, 'worker.js'),
      {
        env: { PLUGIN_NAME: pluginName }
      }).on('exit', (code) => {
        log.debug('plugin exited with code', code)
      }).on('error', (err) => {
        log.error(err)
      }).on('message', (msg) => {
        log.debug(msg)
      })

    plugins[pluginName].postMessage({
      method: 'echo',
      params: ['hello from pluginHost', pluginName],
    })
  })
}


async function startPlugin(pluginRoot) {

  const manifestPath = join(pluginRoot, 'manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
  const name = manifest.name
  const pluginPath = join(pluginRoot, (name + '.mkshftpb.js'))
  const plugPathUrl = pathToFileURL(pluginPath)
  lstatSync(pluginPath).isFile()
  isAbsolute(pluginPath)
  plugins[pluginRoot] = new PluginWorker(
    join(process.env.DIST_PLUGIN, 'worker.js'),
    {
      env: {
        PWD: pluginRoot
           }
      }).on('exit', (code) => {
        log.debug('plugin exited with code', code)
      }).on('error', (err) => {
        log.error(err)
      }).on('message', (msg) => {
        log.debug(msg)
      })

    plugins[pluginRoot].postMessage({
      method: 'echo',
      params: ['hello from pluginHost', pluginRoot],
    })

}

export function killPluginHost() {
  fakePluginNamesList.forEach((pluginName) => {
    plugins[pluginName].postMessage({
      method: 'stop'
    })
  })
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



class PluginWorker extends Worker {
  private pluginRequestHeap: RpcRequestHeap<string | WorkerAPI> = {}
  private msgen: Msg

  constructor(filename: string, options?: any) {
    super(filename, options)
    this.msgen = new Msg({
      host: `[plg]${filename}`,
      showTime: false,
      logLevel: 'info',
    })

    this.on('message', (msg: WorkerNotification) => {
      log.debug(msg)
    })
  }

  public postMessage<T extends string | WorkerAPI>(message: RequestMessage<T>, transferList?: any[]) {
    const request:RpcRequest<T> = {
      id: nanoid(),
      ...message,
    }
    this.pluginRequestHeap[request.id] = request
    if (transferList) {
      super.postMessage(request, transferList)
    } else {
      super.postMessage(request)
    }

  }
}
