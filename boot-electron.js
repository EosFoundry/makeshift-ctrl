(async () => {
  await import('./dist/electron/main/index.js').catch((e) => { console.dir(e)})
})()