<script setup lang="ts">
import { inject, ref, computed, onMounted, watch, Ref, onUnmounted, ComputedRef, nextTick } from 'vue'

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
import { rndrCtrlAPI } from '../renderer'
import { generateBlock } from '../assets/blockly/groups/makeshift/default_cue'


import { blockmap, importBlocklist } from '../blockly/index'
import { ctrlIpcApi } from '../../electron/ipcApi'
import { remToPx } from '../utilities/cssUnits'
import { SensorEventDetails } from '../main'
import { capitalizeFirstLetter, getEventDetails } from '../utilities/str'
import { Cue, CueId } from '../../types/electron/main/cues'
import { remove } from 'fs-extra'
// console.log(toast)
// console.log(storage)

const colorTheme = inject('color-theme') as Ref<string>
const MakeShiftApi = inject('makeshift') as rndrCtrlAPI
const selectedEvent = inject('selected-event') as Ref<string>
const selectedEventCues = inject('selected-event-cues') as Ref<CueId | undefined>

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

  MakeShiftApi.onEv.blockly.toolboxUpdate((toolbox) => {
    console.log('toolboxSync')
    console.log(toolbox)
    workspace.updateToolbox(toolbox)
  })

  MakeShiftApi.onEv.blockly.blocksUpdate((blocklist) => {
    console.log('blocksSync')
    console.log(blocklist)
    importBlocklist(blocklist)
  })

  MakeShiftApi.onEv.blockly.workspaceUpdate((state) => {
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


function refitWorkspace() {
  // Compute the absolute coordinates and dimensions of blocklyArea.
  let wrapperEl = document.getElementById('blockly-wrapper')!
  const divEl = document.getElementById('blockly-div')!
  // console.log('refitting')

  // console.log(wrapperEl, divEl)
  let x = 0
  let y = 0
  if (wrapperEl && wrapperEl !== null) {
    x += wrapperEl.offsetLeft + 2
    y += wrapperEl.offsetTop + 4 //+ remToPx(3.5)
    wrapperEl = wrapperEl.offsetParent as HTMLDivElement

    // Position blocklyDiv over blocklyArea.
    //@ts-ignore
    let dx = blocklyWrapper.value.offsetWidth - 8
    //@ts-ignore
    let dy = blocklyWrapper.value.offsetHeight - 8 - remToPx(toolbarHeightRem.value)
    divEl.style.left = x + 'px'
    divEl.style.top = y + remToPx(toolbarHeightRem.value) + 'px'
    divEl.style.width = dx + 'px'
    divEl.style.height = dy + 'px'

    // console.log(`blockly refit | dx: ${dx}, dy: ${dy}`)

    Blockly.svgResize(workspace)

  }
}

watch(
  () => props.panelHeight,
  (newHeight, oldHeight) => {
    // console.log(`panelHeight changed from ${oldHeight} to ${newHeight}`)
    nextTick(() => refitWorkspace())
  },
  { immediate: true }
)

async function saveWorkspace() {
  console.log('needful')
  // console.log(jsCode)
  const serialWorkspace = Blockly.serialization.workspaces.save(workspace)
  serialWorkspace.blocks.blocks.forEach((block: any) => {
    // console.log(block)
    block.hash = blockmap[block.type].hash
    // console.log(Blockly.Blocks[block.type])
  })
  console.log(serialWorkspace)
  const res = await MakeShiftApi.set.serialWorkspaceAsCue(serialWorkspace)
  console.log(res)
  if (res === undefined) {
    showSimplePopup({
      message: 'Failed to save cue',
      onOkay: () => { }
    })
    return false
  } else {
    workspaceId.value = res.id
    return true
  }
}

function loadWorkspace(newId: string) {
  console.log(`loading workspace ${newId}`)
  workspaceId.value = newId
  MakeShiftApi.get.blocklySerialWorkspace(newId).then((res) => {
    console.log(res)
    Blockly.serialization.workspaces.load(res, workspace)
  })
  // TODO: check workspace block hashes against loaded blocklist hashes and warn user if blocks are outdated or changed
}

let removeCueListener:any
async function runWorkspace() {
  console.log('Saving workspace')
  const success = await saveWorkspace()
  removeCueListener = MakeShiftApi.onEv.cue.added(runOnceSaved)
  console.log(removeCueListener)
}

function runOnceSaved(cue: Cue) {
  console.log(cue)
  if (cue.id === workspaceId.value) {
    console.log('cue is the one we want')
    MakeShiftApi.call.runCue(cue.id)
    removeCueListener()
  }
}

async function deployAsCue(workspaceId: string) {
  console.log(`deploying workspace ${workspaceId} as cue`)

  if (selectedEvent.value === 'none' || selectedEvent.value === '' || selectedEvent.value === undefined) {
    showSimplePopup({
      message: 'No event selected',
      onOkay: () => { }
    })
    return
  }

  console.log('saving workspace')
  const success = await saveWorkspace()

  if (success) {
    console.log('save successful, setting cue for event')
    await MakeShiftApi.set.cueForEvent({
      cueId: workspaceId,
      event: selectedEvent.value
    })
    selectedEventCues.value = workspaceId
  }
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
      // 'm-3',
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
        <button
          :class="[
          ]"
          @click="runWorkspace"
        >
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