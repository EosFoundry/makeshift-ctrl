<script setup lang="ts">
import { inject, Ref } from 'vue';
import { LogLevel, MakeShiftDeviceEvents } from '@eos-makeshift/serial'
import { IMakeShiftAPI } from 'src/renderer';

const Events = inject('makeshift-events') as MakeShiftDeviceEvents
const logLevel = inject('logLevel') as Ref<LogLevel>
const makeshift = inject('makeshift') as IMakeShiftAPI

// console.log(logLevel.value);

const LogLevels = Object.keys(Events.Terminal.Log)

function needful(){
  makeshift.test()
}

</script>
<template>
<div id="toolbar-wrapper">
  <span>
    <div>

    </div>
  </span>
  <span>
    <select name="log-level-selector" v-model="logLevel">
      <option v-for="lv in LogLevels">
        {{ lv }}
      </option>
    </select>
    logging
  </span>
  <span>
  <button @click="needful">
    Needful
  </button>
  </span>

</div>
</template>

<style lang="scss">

</style>