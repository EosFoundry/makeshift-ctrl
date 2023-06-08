
<script lang="ts">
export default {
  name: 'TestInterface'
}
</script>

<script setup lang="ts">
import { MakeShiftDeviceEvents } from '@eos-makeshift/serial';
import { inject, ref, computed } from 'vue';

const DeviceMap = inject('device-maps') as any
const DeviceEvents = inject('makeshift-events') as MakeShiftDeviceEvents
const HardwareDescriptors = inject('hardware-descriptors') as any
const MakeshiftMap = DeviceMap.value.makeshift

console.log('1')
console.log(DeviceMap)
console.log('2')
console.log(MakeshiftMap)
console.log('3')
console.log(DeviceEvents)
console.log('4')
console.log(HardwareDescriptors)

const devicePanel = ref(`
  flex flex-row flex-wrap
  inline-flex
  p-3
  rounded-lg 
  shadow-md
  border-solid border-4 
  device-panel
  `)

const buttonSelector = ref(`
  w-12 h-12 
  mx-2 
  hover:mt-3 hover:mb-1
  rounded-lg 
  hover:shadow-hover
  border-solid border-4 
  device-layout-button 
  `)

const dialSelector = ref(` 
  w-12 h-12
  mx-2 
  hover:mt-3 hover:mb-1
  rounded-full
  hover:shadow-hover
  border-solid border-4 
  device-layout-button
  DIAL
  BUTTON 
  `)

const rowClass = ref(`flex flex-row flex-wrap`)
const colClass = ref(`flex flex-col`)

const selectedInputId = ref(0)
const selectedInput = computed(() =>  MakeshiftMap.sensors[selectedInputId.value])

function selectInput(input: any) {
  selectedInputId.value = input.id
  console.log(input)
}

/**
 * TODO:
 * - Events panel should have a @click handler that calls this function below
 * - This function needs to store the given event based on the selected input type
 * - cross reference the DeviceEvents object and the HardwareDescriptors object to get the correct event that the user is targeting
 */
const selectedInputEvents = ref()
function handleEventsPanelEvent(inputType: any){
  for (const property in DeviceEvents){
      if (inputType === property) {
        for (let j=0; j<DeviceEvents[property].length; j++) {
          if (selectedInputId.value === j) {
            selectedInputEvents.value = DeviceEvents[property][j]
            console.log(selectedInputEvents.value)
          }
        }
      }
    }  
}

</script>

<template>
  <div class="md:container md:mx-auto mb-4">
    <div :class=rowClass>
      <span :class=devicePanel>
        <div :class=colClass>
          <div :class=rowClass>
            <div v-for="sensorId in [0, 1, 2, 3]"
              
              :class="[(sensorId === selectedInputId ? 'active-input shadow-selected mt-2 mb-2' : 'mt-1 mb-3 shadow-md'), dialSelector]"

              :key="sensorId" 

              @click="selectInput(MakeshiftMap.sensors[sensorId])">
              
              {{ sensorId }}

            </div>
          </div>

          <div v-for="row in [3, 7, 11]" :class=rowClass :key="row">
            <div v-for="col in [1, 2, 3, 4]"
              
              :class="[(row + col === selectedInputId ? 'active-input shadow-selected mt-2 mb-2' : 'mt-1 mb-3 shadow-md'), buttonSelector]"
              
              :key="row + col"

              @click="selectInput(MakeshiftMap.sensors[row + col])">

              {{ row + col }}
            </div>
          </div>
        </div>
      </span>

      <div :class="colClass + ` events-panel`">
        <div v-for="sensorType in selectedInput.types"
          
          :class="sensorType"
          
          :key="sensorType"
          
          @click="handleEventsPanelEvent(sensorType)">

          <div v-for="sensorEvent in HardwareDescriptors.Sensors[sensorType].events"

          :class="[buttonSelector]"

          :key="sensorEvent">

          {{ sensorEvent }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.device-panel {
  background-color: rgb(var(--color-bg));
  border-color: rgb(var(--color-primary2));
}

.device-layout-button {
  background-color: rgb(var(--color-primary));
  border-color: rgb(var(--color-primary2));
  color: rgb(var(--color-hl));
}

.events-panel {
  /* background-color: green; */
}

.active-input {
  background-color: rgb(var(--color-secondary));
  border-color: rgb(var(--color-primary));
  color: rgb(var(--color-hl));
}
</style>