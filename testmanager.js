const { Worker } = require('node:worker_threads')

let worker
console.log('the fuck is this shit')

async function load() {
  const data = { butt: 'butthole' }
  worker = new Worker('./testmanager-worker.mjs', { workerData: data })
  worker.send({ hello:'world'})
}
process.on('message', (m) => {
  console.log('CHILD got message:', m);
});

// Causes the parent to print: PARENT got message: { foo: 'bar', baz: null }
process.send({ foo: 'bar', baz: NaN });

// process.parentPort.on('load', () => { load() })
