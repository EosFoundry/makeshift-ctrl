
<script lang="ts">
export default {
  name: 'TestInterface '
}
</script>

<script setup lang="ts">
import { MakeShiftDeviceEvents } from '@eos-makeshift/serial';
import { inject, ref, computed } from 'vue';




const makeshiftMap = inject('device-maps') as any
const DeviceEvents = inject('makeshift-events') as MakeShiftDeviceEvents
console.log(DeviceEvents)

const buttonSelector = ref(`
  w-12 h-12 
  mx-2 
  hover:mt-3 hover:mb-1
  rounded-lg 
  hover:shadow-test
  border-solid border-4 
  device-layout-button 
  `)

const dialSelector = ref(` 
  w-12 h-12
  mx-2 
  hover:mt-3 hover:mb-1
  rounded-full
  hover:shadow-test
  border-solid border-4 
  device-layout-button
  DIAL
  BUTTON 
  `)

const rowClass = ref(`flex flex-row flex-wrap`)

const colClass = ref(`flex flex-col`)
const selectedInputId = ref(0)
const selectedInput = computed(() => makeshiftMap.sensors[selectedInputId.value])
function toast(input: any) {
  selectedInputId.value = input.id
  console.log(input)
}
</script>

<template>
  <div class="md:container md:mx-auto">
    <div :class=rowClass>
      <div :class=colClass>
        <div :class=rowClass>
          <div v-for="num in [0, 1, 2, 3]"
            :class="[(num === selectedInputId ? 'active-input shadow-sharp mt-2 mb-2' : 'mt-1 mb-3 shadow-md'), dialSelector]"
            :key="num" @click="toast(makeshiftMap.sensors[num])">
            {{ num }}
          </div>
        </div>
        <div v-for="row in [4, 8, 12]" :class=rowClass :key="row">
          <div v-for="col in [1, 2, 3, 4]"
            :class="[(row + col === selectedInputId ? 'active-input shadow-sharp mt-2 mb-2' : 'mt-1 mb-3 shadow-md'), buttonSelector]"
            :key="col" @click="toast(makeshiftMap.sensors[row + col])">
            {{ row + col }}
          </div>
        </div>
      </div>
      <div :class="colClass + ` events-panel`">
        <div v-for="sensor in makeshiftMap.sensors[selectedInputId]" :key="sensor">
        </div>
        butt
        <div>
          {{ selectedInput }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.device-layout-button {
  background-color: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary2));
  color: rgb(var(--color-hl));
}

.events-panel {
  background-color: green;
}

.active-input {
  background-color: rgb(var(--color-secondary));
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-hl));
}
</style>