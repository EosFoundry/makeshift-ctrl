//@ts-nocheck
//@ts-ignore
import BlocklyDarkTheme from '@blockly/theme-dark'
//@ts-ignore
import BlocklyModernTheme from '@blockly/theme-modern'
import Blockly, { Block, WorkspaceSvg } from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

import { MakeShiftDeviceEvents } from '@eos-makeshift/serial'

import { usePopup } from '../composables/popup'
import * as basicToolbox from '../assets/blockly/toolbox.json'
import * as defaultCue from '../assets/blockly/groups/makeshift/default_cue.json'
import { block } from 'blockly/core/tooltip'
import { generateBlock } from '../assets/blockly/groups/makeshift/default_cue.js'
import { State } from 'blockly/core/utils/aria'
import '@blockly/field-grid-dropdown'
import { MakeShiftBlockJSON } from 'electron/main/blockly'



const MakeShiftBlocklyFontStyle = {
  'family': 'Encode Sans',
  'weight': 'normal',
  'size': 12
}

// const lightTheme = Blockly.Theme.defineTheme('makeshift-light', {
//   'base': BlocklyModernTheme,
//   'name': 'MakeShift Light',
//   'fontStyle': MakeShiftBlocklyFontStyle,
// })

// const darkTheme = Blockly.Theme.defineTheme('makeshift-dark', {
//   'base': BlocklyDarkTheme,
//   'name': 'MakeShift Dark',
//   'fontStyle': MakeShiftBlocklyFontStyle,
// })

export type BlockGroup = {
  name: string,
  id: string,
  blockTuples: {
    block: any,
    init: Function
  }[],
  toolboxCategory: any,
  flyoutCallback?: Function
}

export const toast = 'toast'

console.log(import.meta.env.BASE_URL)

export const storage = 'toast'
//= await import( /* @vite-ignore */ import.meta.env.BASE_URL + 'blockly/groups/storage/index.js')

// console.log(storage)

let blockGroups: {
  [key: string]: BlockGroup
} = {
  dummyGroup: {
    name: 'Dummy Group',
    id: 'dummyGroup',
    blockTuples: [{
      block: {
        type: 'dummyBlock',
        message0: 'Dummy Block %1',
        args0: [
          {
            type: 'field_input',
            name: 'dummyInput',
            text: 'dummyInput'
          }
        ],
        inputsInline: true,
        previousStatement: null,
        nextStatement: null,
        colour: 230,
        tooltip: '',
        helpUrl: ''
      },
      init: () => { }
    }],
    toolboxCategory: {
    },
  }
}

export const blockmap: {[key:string] : MakeShiftBlockJSON} = []

let customBlocksToolboxEntry: any = {}
const storageFlyoutBlockBaseList = [
  {
    kind: "label",
    text: "Stored variables will be saved and reloaded when makeshift-ctrl restarts.",
  },
  {
    kind: "button",
    text: "Create stored variable...",
    callbackKey: "createStoredVariable"
  },
]
const makeshiftFlyoutBlockList = [
  {
    kind: "block",
    type: "default_cue"
  }
]


function storageFlyoutCallback(workspace: WorkspaceSvg) {
  const blockList: any = [...storageFlyoutBlockBaseList]
  for (const blockType in StorageBlocks) {
    blockList.push({
      kind: "block",
      type: blockType
    })
  }

  return blockList
}

export function importBlocklist(newblocks: MakeShiftBlockJSON[]) {
  newblocks.forEach((block) => {
    customBlocksToolboxEntry[block.type] = {
      kind: 'block',
      type: block.type,
    }
    Blockly.Blocks[block.type] = {
      init: function () {
        this.jsonInit(block)
      }
    }
    blockmap[block.type] = block
  })
  console.log(blockmap)
}





function initWorkspace(workspace: WorkspaceSvg) {
  workspace.registerToolboxCategoryCallback('STORAGE', storageFlyoutCallback)
  // workspace.registerButtonCallback('createStoredVariable', function (button) {
  //   console.log('createStoredVariable')
  //   showPrompt({
  //     message: 'Enter a name for the variable',
  //     onOkay: (val: any) => {
  //       if (val === null) return
  //       if (val === '') {
  //         Blockly.dialog.alert('Variable name cannot be empty')
  //         return
  //       }
  //       if (!val.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
  //         Blockly.dialog.alert('Variable name must be a valid identifier')
  //         return
  //       }
  //       if (workspace.getVariable(val)) {
  //         Blockly.dialog.alert('Variable name already exists')
  //         return
  //       }
  //       workspace.createVariable(val)
  //     }
  //   })

  // })
}


// javascriptGenerator['set_stored_variable'] = function (block: Block) {
//   var dropdown_name = block.getFieldValue('NAME');
//   var value_name = javascriptGenerator.valueToCode(block, 'NAME', javascriptGenerator.ORDER_ATOMIC);
//   // TODO: Assemble javascript into code variable.
//   var code = 'asdfasdfas\n';
//   return code;
// }

// export function setBlocklist(newBlockList: any[]) {
//   blockmap
// }

function workspaceToCode(workspace: Blockly.WorkspaceSvg) {
  const jsCode = javascriptGenerator.workspaceToCode(workspace)
  console.log('needful')
  console.log(jsCode)
  const state = Blockly.serialization.workspaces.save(workspace)
  state.blocks.blocks.forEach((block: any) => {
    console.log(block)
    block.version = MakeShiftBlocks[block.type].version
    console.log(Blockly.Blocks[block.type])
  })
  console.log(state.blocks.blocks)
  Blockly.serialization.workspaces.load(state, workspace)
  // TODO: save block version data with the state by pulling it from the workspace
  // after serialization, then appending it to the state before saving
}

function saveWorkspace(workspace: Blockly.WorkspaceSvg) {
  const state = Blockly.serialization.workspaces.save(workspace)
  const stateString = JSON.stringify(state)
  console.log(stateString)
  localStorage.setItem('workspaceState', stateString)
}

function saveCode(code: string) {

}