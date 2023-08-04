//@ts-nocheck
//@ts-ignore
import BlocklyDarkTheme from '@blockly/theme-dark'
//@ts-ignore
import BlocklyModernTheme from '@blockly/theme-modern'
import Blockly, { Block, WorkspaceSvg } from 'blockly'
import { javascriptGenerator } from 'blockly/javascript'

import { MakeShiftDeviceEvents } from '@eos-makeshift/serial'

import { usePopup } from '../composables/popup'
import '@blockly/field-grid-dropdown'
import { MakeShiftBlockJSON } from 'electron/main/blockly'




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


export const blockmap: {[key:string] : MakeShiftBlockJSON} = []

let customBlocksToolboxEntry: any = {}

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