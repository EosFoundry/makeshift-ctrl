<script setup lang="ts">
import { inject, ref, computed, onMounted, watch, Ref, onUnmounted, ComputedRef } from 'vue'

// @ts-ignore
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
import { rndrCtrlAPI } from 'src/renderer'
import { generateBlock } from '../assets/blockly/groups/makeshift/default_cue'
import { State } from 'blockly/core/utils/aria'


import { blockmap, importBlocklist } from '../blockly/index'
import { ctrlIpcApi } from '../../electron/ipcApi'
import { workspaceCommentOption } from 'blockly/core/contextmenu'
import { remToPx } from '../utilities/cssUnits'
import { SensorEventDetails } from '../main'
import { capitalizeFirstLetter, getEventDetails } from '../utilities/str'
import { Cue } from 'electron/main/cues'
// console.log(toast)
// console.log(storage)

const colorTheme = inject('color-theme') as Ref<string>
const MakeShiftApi = inject('makeshift') as rndrCtrlAPI
const selectedEvent = inject('selected-event') as Ref<string>

const selectedEventDetails = ref(getEventDetails(selectedEvent.value)) as Ref<SensorEventDetails>

watch(
  () => selectedEvent.value,
  (newVal, oldVal) => {
    selectedEventDetails.value = getEventDetails(newVal)
  }
)
const props = defineProps<{
  panelHeight?: number
}>()


const MakeShiftBlocklyFontStyle = {
  'family': 'Encode Sans',
  'weight': 'normal',
  'size': 12
}

const lightTheme = Blockly.Theme.defineTheme('makeshift-light', {
  'base': BlocklyModernTheme,
  'name': 'MakeShift Light',
  'fontStyle': MakeShiftBlocklyFontStyle,
})

const darkTheme = Blockly.Theme.defineTheme('makeshift-dark', {
  'base': BlocklyDarkTheme,
  'name': 'MakeShift Dark',
  'fontStyle': MakeShiftBlocklyFontStyle,
})

const blocklyWrapper = ref<HTMLDivElement | null>(null)
const blocklyDiv = ref<HTMLDivElement | null>(null)
const toolbarHeightRem = ref(3.5)
const workspaceId = ref('')

let workspace: WorkspaceSvg = null as any

const {
  showPrompt,
  showConfirm,
  showSimplePopup
} = usePopup()

onMounted(() => {
  Blockly.dialog.setPrompt(function (message, defaultValue, callback) {
    // dialog.inputValue.value = ''
    console.log('Setting blockly to use makeshift prompt popup...')
    showPrompt({
      message: message,
      onOkay: (val: string[]) => {
        console.log(val)
        callback(val[0])
      },
      onCancel: (val) => {
        callback(null)
      }
    })
  })

  Blockly.dialog.setConfirm(function (message, callback) {
    console.log('Setting blockly to use makeshift confirm popup...')
    showConfirm({
      message: message,
      onOkay: () => {
        callback(true)
      },
      onCancel: () => {
        callback(false)
      }
    })
  })

  Blockly.dialog.setAlert(function (message, callback) {
    console.log('Setting blockly to use makeshift alert popup...')
    let okayCb = callback ?? (() => { })
    if (typeof callback === 'undefined') {
      callback = () => { }
    }
    showSimplePopup({
      message: message,
      onOkay: okayCb
    })
  })

  // console.log(blocklyWrapper, blocklyDiv, promptDiv)

  const bd = document.getElementById('blockly-div')!
  workspace = Blockly.inject(bd, {
    theme: darkTheme,
    toolbox: basicToolbox
  });
  // console.log(workspace)

  refitWorkspace()
  window.addEventListener('resize', refitWorkspace)
  window.addEventListener('loadWorkspace', (ev: any): void => {
    console.log(ev)
    loadWorkspace(ev.detail)
  })

  MakeShiftApi.onEv.blockly.toolboxUpdate((garb: any, toolbox) => {
    console.log('toolboxSync')
    console.log(toolbox)
    workspace.updateToolbox(toolbox)
  })

  MakeShiftApi.onEv.blockly.blocksUpdate((garb: any, blocklist) => {
    console.log('blocksSync')
    console.log(blocklist)
    importBlocklist(blocklist)
  })

  MakeShiftApi.onEv.blockly.workspaceUpdate((garb: any, state) => {
    console.log('workspaceSync')
    console.log(state)
    Blockly.serialization.workspaces.load(state, workspace)
  })

  MakeShiftApi.call.fetchBlocklyToolbox()
  MakeShiftApi.call.fetchBlocklyBlocks()
  MakeShiftApi.call.fetchBlocklyDefaultWorkspace()

})

onUnmounted(() => {
  window.removeEventListener('resize', refitWorkspace)
  // TODO: remove onEv listeners
  // ipcRenderer.removeAllListeners(ctrlIpcApi.onEv.blockly.toolboxUpdate)
})

function initWorkspace(workspace: WorkspaceSvg) {

}


function refitWorkspace() {
  // Compute the absolute coordinates and dimensions of blocklyArea.
  let wrapperEl = document.getElementById('blockly-wrapper')!
  const divEl = document.getElementById('blockly-div')!
  // console.log('refitting')

  // console.log(wrapperEl, divEl)
  let x = 0
  let y = 0
  do {
    x += wrapperEl.offsetLeft + 2
    y += wrapperEl.offsetTop + 2 //+ remToPx(3.5)
    wrapperEl = wrapperEl.offsetParent as HTMLDivElement
  } while (wrapperEl && wrapperEl !== null)

  // Position blocklyDiv over blocklyArea.
  //@ts-ignore
  let dx = blocklyWrapper.value.offsetWidth - 8
  //@ts-ignore
  let dy = blocklyWrapper.value.offsetHeight - 8 - remToPx(toolbarHeightRem.value)
  divEl.style.left = x + 'px'
  divEl.style.top = y + remToPx(toolbarHeightRem.value) + 'px'
  divEl.style.width = dx + 'px'
  divEl.style.height = dy + 'px'

  console.log(`blockly refit | dx: ${dx}, dy: ${dy}`)

  Blockly.svgResize(workspace)
}

watch(
  () => props.panelHeight,
  (newHeight, oldHeight) => { refitWorkspace() }
)

function saveWorkspace() {
  console.log('needful')
  // console.log(jsCode)
  const state = Blockly.serialization.workspaces.save(workspace)
  state.blocks.blocks.forEach((block: any) => {
    // console.log(block)
    block.hash = blockmap[block.type].hash
    // console.log(Blockly.Blocks[block.type])
  })
  console.log(state)
  MakeShiftApi.set.serialWorkspaceAsCue(state).then((res: Cue | undefined) => {
    console.log(res)
    if (res === undefined) {
      showSimplePopup({
        message: 'Failed to save cue',
        onOkay: () => { }
      })
      return
    }
    workspaceId.value = res.id
  })
  // TODO: save block version data with the state by pulling it from the workspace
  // after serialization, then appending it to the state before saving
}

function loadWorkspace(newId: string) {
  console.log(`loading workspace ${newId}`)
  workspaceId.value = newId
  MakeShiftApi.get.blocklySerialWorkspace(newId).then((res) => {
    console.log(res)
    Blockly.serialization.workspaces.load(res, workspace)
  })
}

function deployAsCue(workspaceId: string) {
  console.log(`deploying workspace ${workspaceId} as cue`)
  if (selectedEvent.value === 'none' || selectedEvent.value === '' || selectedEvent.value === undefined) {
    showSimplePopup({
      message: 'No event selected',
      onOkay: () => { }
    })
    return
  }
  MakeShiftApi.set.cueForEvent({ cueId: workspaceId, event: selectedEvent.value }).then((res) => {
    console.log(res)
  })

}


</script>

<template>
  <!-- 
    <button
    class="top-10 right-0"
    @click="loadWorkspace"
  >
    Load Cue Blocks</button> 
  -->
  <div
    id="blockly-wrapper"
    ref="blocklyWrapper"
    :class="['overflow-clip',
      'm-3',
      'z-50',
      'rounded-lg',
      'border-solid',
      'border-2',
      'box-border',
      'border-hl'
    ]"
    :style="{
      height: props.panelHeight + 'px'
    }"
  >
    <div
      id="blockly-toolbar"
      :class="[
        'h-14',
        'flex',
        'flex-row',
        'items-center',
        'justify-between',
        'bg-bg',
        'border-solid',
        'border-b-2',
        'border-hl',
        'rounded-t-lg',
        'shadow-md'
      ]"
    >
      <div :class="[
        'flex',
        'flex-row',
        'flex-wrap',
        'gap-x-2',
        'p-2',
      ]">
        <button
          :class="[
          ]"
          @click="saveWorkspace"
        >
          Save Workspace
        </button>
        <button>
          Run Workspace
        </button>
      </div>
      <div :class="[
        'flex',
        'flex-row',
        'items-end',
        'flex-wrap',
        'gap-x-2',
        'p-2',
      ]">
        <div :class="['h-fit', 'my-auto']">
          Target:
          {{ capitalizeFirstLetter(selectedEventDetails.sensorType) }}
          {{ selectedEventDetails.sensorId }},
          {{ capitalizeFirstLetter(selectedEventDetails.eventType) }}
        </div>
        <button
          :class="[
          ]"
          @click="deployAsCue(workspaceId)"
        >
          Deploy as Cue
        </button>
      </div>
    </div>
    <div
      id="blockly-div"
      :class="[
        'z-0',
        'absolute',
        'overflow-clip',
      ]"
    ></div>
  </div>
</template>

<style>
/**
 * hack to remove the border around the blockly workspace
 */
.blocklyMainBackground {
  stroke-width: 0px;
}

/**
 * stops the toolbar flyout scrollbar from remaining visible even after closing
 */
svg[display="none"] {
  display: none;
}
</style>