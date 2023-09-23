
import { readdir, mkdir } from 'node:fs/promises'
import { Worker } from 'node:worker_threads'
import { isAbsolute, join } from 'pathe'
import { pathToFileURL } from 'node:url'
import { Msg } from '@eos-makeshift/msg'
import { v4 as uuidv4 } from 'uuid'
// import { nanoid } from 'nanoid'

const plugins = {}


const msgen = new Msg({
  host: 'PluginHost',
  showTime: false,
  logLevel: 'debug',
})
const log = msgen.getLevelLoggers()
let worker:Worker = undefined

export interface WorkerRequest {
  message: any,
  id: string,
}

export interface PluginRPC {
  call: string,
  args: any[],
}

export type RequestPile = {
  [index: string]: WorkerRequest
}

class PluginWorker extends Worker {
  private requestQueue: RequestPile = {}
  constructor(filename: string, options?: any) {
    super(filename, options)
    this.on('message', (msg) => {
      log.debug(msg)

    })
  }

  public postMessage(message: any, transferList?: any[]) {

    const reqId = uuidv4()
    this.requestQueue[reqId] = {
      message: message,
      id: reqId,
    }

    if (transferList) {
      super.postMessage(message, transferList)
    } else {
      super.postMessage(message)
    }
  }

}

async function load(pluginFolder?: string) {
  const data = { butt: 'butthole' }
  worker = new PluginWorker('./dist/node/plugin/worker.js', { pluginRoot: 'somedir' })
  setInterval(() => {
    worker.postMessage({ call: 'stat', args: [pluginFolder] })
  }, 2000)
  worker.on('message', (msg) => {
    log.debug(msg)
  })
  // const manifestPath = join(pluginFolder, 'manifest.json')
  // const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  // const name = manifest.name
  // const pluginPath = join(pluginFolder, (name + '.mkshftpb.js'))
  // const plugPathUrl = pathToFileURL(pluginPath)

  // log.debug(manifest)
  // log.debug(pluginPath)
  // log.debug(isAbsolute(pluginPath))
  // log.debug(plugPathUrl)
  // log.debug(lstatSync(pluginPath).isFile())
  // plugins[name] = new Worker(plugPathUrl.href)
  // log.debug(plugins)
}

async function stop() {
  return true
}

process.on('message', (m) => {
  console.log('CHILD got message:', m);
});
process.on('kill', (code) => {
  console.log('CHILD got kill:', code);
});

// Causes the parent to print: PARENT got message: { foo: 'bar', baz: null }
process.send({ foo: 'bar', baz: NaN });
// let toast
// if (toast) { //error code
//   log.debug('toast')
// }
load()
