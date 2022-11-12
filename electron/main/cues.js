const electron = require('electron')
const url = require('node:url')
const pathe = require('pathe')

const dialog = electron.dialog
const pathToFileURL = url.pathToFileURL
const resolve = pathe.resolve

/** 
 * TODO: 
 * - watch /cues with chokidar
 * - keep cue-id data in cue-db.json
 * - reload changed cues
 *  */ 

const cues = {}

function attachCue(event, callback) {
  cues[event] = callback
}
function bruh(asdf) {
  console.log('bruh ' + asdf)
}

async function unloadCue() {
  console.log(process.env.CUES)
}
async function loadCue() {
  const openResult = await dialog.showOpenDialog({
    filters: [
      {
        name: 'Javascript',
        extensions: ['js', 'mjs',]
      },
      {
        name: 'All Files',
        extensions: ['*'],
      },
    ],
    properties: [
      'openFile',
    ]
  })
  console.log(openResult)
  if (openResult.canceled === false) {
    try {
      const pathUrl = pathToFileURL(resolve(openResult.filePaths[0]))
      console.log(pathUrl)
      const toast = require(openResult.filePaths[0])
      toast.terminal.log = bruh
      console.log(toast)
      toast.run()
    } catch (e) {
      console.log(e)
    }
  }
  // if (existsSync(path)) {
  //   if (lstatSync(path).isFile) {

  //     // if (extname(path) === '.js') {

  //     // }
  //     // if (extname(path) === '.mjs') {

  //     // }

  //   }
  // }
}

module.exports = {
  cues,
  loadCue,
  unloadCue,
}