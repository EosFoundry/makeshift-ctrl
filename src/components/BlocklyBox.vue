<script setup lang="ts">
import { inject, ref, computed, onMounted, watch } from 'vue';
import { MakeShiftDeviceEvents } from '@eos-makeshift/serial';
import Blockly from 'blockly';
const DarkTheme = require('@blockly/theme-dark');

const props = defineProps<{
  panelHeight?: number
}>()

const toolbox = {
  "kind": "flyoutToolbox",
  "contents": [
    {
      "kind": "block",
      "type": "controls_if"
    },
    {
      "kind": "block",
      "type": "controls_repeat_ext"
    },
    {
      "kind": "block",
      "type": "logic_compare"
    },
    {
      "kind": "block",
      "type": "math_number"
    },
    {
      "kind": "block",
      "type": "math_arithmetic"
    },
    {
      "kind": "block",
      "type": "text"
    },
    {
      "kind": "block",
      "type": "text_print"
    },
  ]
}
let workspace: any
let blocklyWrapper: HTMLDivElement
let blocklyDiv: HTMLDivElement

onMounted(() => {
  workspace = Blockly.inject('blockly-div', {
    theme: DarkTheme,
    toolbox: toolbox
  });
  blocklyWrapper = document.getElementById('blockly-wrapper') as HTMLDivElement
  blocklyDiv = document.getElementById('blockly-div') as HTMLDivElement
  console.log(workspace)
  refitBlockly(null)
  window.addEventListener('resize', refitBlockly)
})

function refitBlockly(e: any) {
  // Compute the absolute coordinates and dimensions of blocklyArea.
  let element = blocklyWrapper
  let x = 0
  let y = 0
  do {
    x += element.offsetLeft + 2
    y += element.offsetTop + 2
    element = element.offsetParent as HTMLDivElement
  } while (element && element !== null)
  // Position blocklyDiv over blocklyArea.
  let dx = blocklyWrapper.offsetWidth - 8
  let dy = blocklyWrapper.offsetHeight - 8
  blocklyDiv.style.left = x + 'px'
  blocklyDiv.style.top = y + 'px'
  blocklyDiv.style.width = dx + 'px'
  blocklyDiv.style.height = dy + 'px'
  Blockly.svgResize(workspace)
};


watch(
  () => props.panelHeight,
  (newHeight, oldHeight) => refitBlockly(null)
)

</script>

<template>
  <div
   id="blockly-wrapper"
   :class="['w-full', 'h-full', 'overflow-clip',
     'rounded-lg',
     'border-solid',
     'border-2',
     'box-border',
     'border-hl'
   ]"
  >
    <div
     id="blockly-div"
     :class="['absolute', 'overflow-clip']"
    >

    </div>
  </div>
</template>

<style>#blockly-wrapper {
  /* background-color: ; */
}</style>