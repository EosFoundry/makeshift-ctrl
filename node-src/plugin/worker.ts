import { Worker, isMainThread, parentPort } from 'node:worker_threads'
import { WorkerRequest } from './host'

let plugin = {}
const RequestQueue: WorkerRequest[] = []

const call = {
  stat: (path: string) => {
    parentPort.postMessage({ reply: 'stat', args: [path] })
  },
  load: (path: string) => {
    parentPort.postMessage({ reply: 'load', args: [path] })
    plugin = import(path)
  }
}

if (isMainThread) {
  process.exit(1)
}

// handler for parent requests
parentPort.on('message', (req: WorkerRequest ) => {
  console.log('message to worker from parent', req)
  // RequestQueue.push(req)

  console.log(`request: `, req)
})

parentPort.postMessage({yo:'dawg'})
