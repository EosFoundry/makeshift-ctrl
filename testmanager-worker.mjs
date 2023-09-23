import { Worker, isMainThread, parentPort } from 'node:worker_threads'

if (isMainThread) {
  process.exit(1)
}

parentPort.on('message', (message) => {
  console.log('message to worker from parent', message)
})

parentPort.postMessage({yo:'dawg'})
