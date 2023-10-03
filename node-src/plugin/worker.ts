import { Worker, isMainThread, parentPort } from 'node:worker_threads'
import { join, isAbsolute } from 'pathe'
import { readFile, lstat } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { lstatSync } from 'original-fs'
import { EventEmitter } from 'node:events'
import { RpcRequest, RpcErrorResponse } from '../pluginTypes'

let plugin = {}
const RequestQueue: RpcRequest<string | WorkerAPI>[] = []
const RequestHandler = new EventEmitter()

export const call = {
  stat: (path: string) => {
    parentPort.postMessage({ reply: 'stat', args: [path] })
  },
  load: async (pluginRoot: string) => {
    parentPort.postMessage({ reply: 'load', args: [pluginRoot] })
    plugin = import(pluginRoot)
    try {
      const manifestPath = join(pluginRoot, 'manifest.json')
      const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'))
      const name = manifest.name
      const pluginPath = join(pluginRoot, (name + '.mkshftpb.js'))
      const plugPathUrl = pathToFileURL(pluginPath)
      lstatSync(pluginPath).isFile()
      isAbsolute(pluginPath)
    } catch (e) { sendError('load', e)}
  },
  echo: (msg: string) => {
    parentPort.postMessage({ reply: 'echo', args: [msg] })
  },
  stop: () => {
    if (RequestQueue.length > 0) {
      parentPort.postMessage({ reply: 'stopping' })
    }
    parentPort.postMessage({ reply: 'exiting' })
    process.exit(0)
  },
}

export type WorkerAPI = keyof typeof call

function sendError (reqId: string, err: Error, data?: any) {
  const resp: RpcErrorResponse = {
    error: err,
    id: reqId,
  }
  if (data) {
    resp.data = data
  }
  parentPort.postMessage(resp)
}

function sendNotification (msg: string) {
  parentPort.postMessage({ notification: msg })
}

if (isMainThread) {
  process.exit(1)
} else {
  console.log('worker thread started')
  console.log(process.env)
}

RequestHandler.on('new', (req: RpcRequest<string|WorkerAPI>) => {
  console.log('new request', req)
  RequestQueue.push(req)
  console.log('queue', RequestQueue)
  RequestHandler.emit('handle-next')
})


// handler for parent requests
parentPort.on('message', (req: RpcRequest<string|WorkerAPI>) => {
  console.log('message to worker from parent', req)
// RequestQueue.push(req)

  console.log(`request: `, req)
  RequestHandler.emit('new', req)
})

RequestHandler.on('handle-next', async () => {
  if (RequestQueue.length > 0) {
    const req = RequestQueue.shift()
    console.log('request', req)

    try {
      const res = await call[req.method](...req.params)
      RequestHandler.emit('request-complete', {request: req, response: res})
    } catch (err) {sendError(req.id, err)}

    RequestHandler.emit('handle-next')
 } else {
   RequestHandler.emit('queue-empty')
 }
})

RequestHandler.on('request-complete', ({request, response}) => {
  console.log('request complete: ', request, response)
  parentPort.postMessage({
    id: request.id,
    request: request,
    result: response,
  })
  RequestHandler.emit('handle-next')
})
