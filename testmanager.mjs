import { Worker }  from 'node:worker_threads'

let worker
console.log('the fuck is this shift')

async function load() {
  const data = { butt: 'butthole' }
  worker = new Worker('./testmanager-worker.mjs', { workerData: data })
  worker.on('message', (message) => {
    console.log('worker sent message', message)
  })
}
process.on('message', (m) => {
  console.log('CHILD got message:', m);
});

// Causes the parent to print: PARENT got message: { foo: 'bar', baz: null }
process.send({ foo: 'bar', baz: NaN });
load()

// process.parentPort.on('load', () => { load() })
