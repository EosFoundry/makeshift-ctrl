<script setup lang="ts">
import { inject, Ref } from 'vue';
import { LogLevel, MakeShiftDeviceEvents } from '@eos-makeshift/serial'

const Events = inject('makeshift-events') as MakeShiftDeviceEvents
const logLevel = inject('logLevel') as Ref<LogLevel>

console.log(logLevel.value);
// for 

const LogLevels = Object.keys(Events.Terminal.Log)

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
    asdf
  </span>

</div>
</template>