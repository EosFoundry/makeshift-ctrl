function init(block, thisBlock) {
  this.jsonInit(block)
  this.setDeletable(false)
  this.setMovable(false)
}

function generateCode(block, generator) {
  let cueName = block.getField('CUE_NAME')
  // console.log(`cueName: ${cueName}`)
  // console.log(block.workspace.typedBlocksDB)
  const pluginsString = generator.valueToCode(block, 'PLUGIN_NAMES', generator.ORDER_ATOMIC)
  const bracketedPluginsString = pluginsString.replaceAll('[', '').replaceAll(']', '')

  const nullFreePluginsString = bracketedPluginsString.replaceAll('null, ', '').replaceAll(', null', '').replaceAll('null', '')

  let setup = generator.statementToCode(block, 'SETUP_STATEMENTS')
  let run = generator.statementToCode(block, 'RUN_STATEMENTS')

  const code = `// Welcome to makesh*t-ctrl!

// add plugins you want to use here as a string
// makeshift-ctrl will look them up and attach them
// in the plugins object if they exist
const requiredPlugins = [${nullFreePluginsString}]

// makeshift-ctrl will load the plugins into this object
const plugins = {}
  
let keyboard = null
let mouse = null
let Key = null

// makeshift-ctrl will run this function once
// as soon as the cue is first loaded in
function setup() {
${setup}
}

// Put your main code in the run() function below 
// this is the code that runs every time a button is pressed
function run() {
${run}
}

// These are the only names that makeshift-ctrl looks for
// when it interacts with your cue
//
// NOTE: if you delete any of these, it's very likely something will break!
module.exports = {
	requiredPlugins,
	plugins,
	setup,
	run,
}
`
  return code
}

module.exports = {
  init,
  generateCode,
}