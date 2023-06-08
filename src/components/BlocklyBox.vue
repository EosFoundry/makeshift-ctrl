<script setup lang="ts">
  import { inject, ref, computed, onMounted } from 'vue';
  import { MakeShiftDeviceEvents } from '@eos-makeshift/serial';
  import Blockly from 'blockly';
  
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
let workspace 

onMounted(() => {
  workspace = Blockly.inject('blockly-wrapper', {toolbox: toolbox});
  console.log(workspace)
})


</script>

<template>
  <div id="blockly-wrapper" :class="['absolute']"
  :style="{
    height: '480px',
    width: '480px',
  }">
  </div>
</template>