// @ts-nocheck
import { javascriptGenerator } from "blockly/javascript"
export function generateBlock(block) {
  const pluginsString = javascriptGenerator.valueToCode(block, 'PLUGIN_NAMES', javascriptGenerator.ORDER_ATOMIC)

  const nullFreePluginsString = pluginsString.replaceAll('null, ', '').replaceAll(', null', '').replaceAll('null', '')

  let setup = javascriptGenerator.statementToCode(block, 'SETUP_STATEMENTS')
  let run = javascriptGenerator.statementToCode(block, 'RUN_STATEMENTS')

  const code = `// Welcome to makesh*t-ctrl!

// add plugins you want to use here as a string
// makeshift-ctrl will look them up and attach them
// in the plugins object if they exist
const requiredPlugins = ${nullFreePluginsString}

// makeshift-ctrl will load the plugins into this object
const plugins = {};

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