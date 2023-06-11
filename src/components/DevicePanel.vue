<script setup lang="ts" >
import { MakeShiftDeviceEvents } from '@eos-makeshift/serial';
import { inject, onMounted, ref } from 'vue';

const events = inject('makeshift-device-events') as MakeShiftDeviceEvents
const eventsList = inject('makeshift-events-flat') as string[]
const selectedEvent = inject('selected-event') as string
const t = [
  'Dial',
  'Button',
]

console.log(t)

onMounted(() => {

})

</script>

<template>
  <div :class="['box-border', 'flex', 'flex-col', 'overflow-hidden']">
    <div :class="[
      'box-border',
      'border-solid',
      'border-2',
      'rounded-lg',
      'border-hl',
      'overflow-hidden',
      'device-panel']">
      <select
       name="event-selector"
       v-model="selectedEvent"
      >
        <option v-for="event in eventsList">
          {{ event }}
        </option>
      </select>

    </div>
  </div>
</template>

<style>
.device-panel {
  background-color: rgb(var(--color-hl));
}
</style>