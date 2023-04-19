<script setup lang="ts" >
import { MakeShiftDeviceEvents } from '@eos-makeshift/serial';
import { inject, onMounted, ref } from 'vue';

const events = inject('makeshift-events') as MakeShiftDeviceEvents
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
  <div class="pane-border">
    <div class="pane-rounded-inner device-panel">
      <select name="event-selector" v-model="selectedEvent">
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