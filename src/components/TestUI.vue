
<script lang="ts">
export default {
  name: 'TestInterface'
}
</script>

<script setup lang="ts">
import { MakeShiftDeviceEvents } from '@eos-makeshift/serial';
import { inject, ref, computed } from 'vue';
import Icon from './Icon.vue'
import pressedIcon from '../assets/icon/bootstrap/layer-backward.svg?url'
import releasedIcon from '../assets/icon/bootstrap/layer-forward.svg?url'
import incrementIcon from '../assets/icon/bootstrap/arrow-clockwise.svg?url'
import decrementIcon from '../assets/icon/bootstrap/arrow-counterclockwise.svg?url'

const DeviceEvents = inject('makeshift-device-events') as MakeShiftDeviceEvents
const HardwareDescriptors = inject('hardware-descriptors') as any
let SelectedEvent = inject('selected-event') as string
const MakeshiftMap = HardwareDescriptors.MakeShift

console.log('0')
console.log(HardwareDescriptors)
console.log('1')
console.log(DeviceEvents)
console.log('2')
console.log(HardwareDescriptors)
console.log('3')
console.log(SelectedEvent)

const devicePanel = ref(`
  flex flex-row flex-wrap
  inline-flex
  p-3
  rounded-lg 
  shadow-md
  border-solid border-4 
  bg-bg
  border-hl
`)

const inputSelector = ref(`
  w-12 h-12 
  mx-2 
  hover:mt-3 hover:mb-1
  hover:shadow-hover
  border-solid border-4 
`)

const selected = ref(`
  color-hl
  bg-secondary1
  border-secondary
  shadow-selected
  mt-2
  mb-2
`)

const unselected = ref(`
  color-hl
  bg-primary
  border-primary2
  mt-1
  mb-3
  shadow-md
`)

const rowClass = ref(`flex flex-row flex-wrap`)
const colClass = ref(`flex flex-col`)


const selectedInputId = ref(0)
const eventListFromSelectedInputId = computed(() => {
  const eventMap = []
  for (const type of MakeshiftMap.sensors[selectedInputId.value].types) {
    console.log(type)
    for (const event of HardwareDescriptors.Sensors[type].events) {
      console.log(event)
      eventMap.push({
        type: type,
        event: event
      })
    }
  }

  console.log(eventMap)
  return eventMap
})

function selectInput(input: any) {
  selectedInputId.value = input.id
  console.log(input)
}


const selectedDeviceEvent = ref(
  {
    type: '',
    event: ''
  }
)

/**
 * TODO:
 * - use `inject()` to get the global variable `selectedEvent` into this component
 *   - The `selectedEvent` variable is declared in `src/main.ts`
 * - when handling the click event, update the global variable `selectedEvent`
 */

const selectedDeviceEventName = ref()
function updateSelectedEventName(inputType: any, inputEvent: any) {
  selectedDeviceEventName.value = DeviceEvents[inputType][selectedInputId.value][inputEvent.toUpperCase()]
  console.log(selectedDeviceEventName.value)
  SelectedEvent = selectedDeviceEventName.value
  console.log(SelectedEvent)
}

const eventIcons: any = {
  increment: incrementIcon,
  decrement: decrementIcon,
  pressed: pressedIcon,
  released: releasedIcon
}

</script>

<template>
  <div class="md:container md:mx-auto mb-4">
    <div :class=rowClass>
      <span :class=devicePanel>
        <div :class=colClass>
          <div :class=rowClass>
            <div
             v-for="sensorId in [0, 1, 2, 3]"
             :class="[
               inputSelector,
               'rounded-full',
               (sensorId === selectedInputId ? selected : unselected)
             ]"
             :key="sensorId"
             @click="selectInput(MakeshiftMap.sensors[sensorId])"
            >

              {{ sensorId }}

            </div>
          </div>

          <div
           v-for="row in [3, 7, 11]"
           :class=rowClass
           :key="row"
          >
            <div
             v-for="col in [1, 2, 3, 4]"
             :class="[
               inputSelector,
               'rounded-lg',
               (row + col === selectedInputId ? selected : unselected)
             ]"
             :key="row + col"
             @click="selectInput(MakeshiftMap.sensors[row + col])"
            >

              {{ row + col }}
            </div>
          </div>
        </div>
      </span>

      <div :class="colClass + ` events-panel`">
        <div
         v-for="eventMap in eventListFromSelectedInputId"
         :class="[
           inputSelector,
           'rounded-lg',
           (selectedDeviceEvent.type === eventMap.type && selectedDeviceEvent.event === eventMap.event ? selected : unselected),
         ]"
         :key="eventMap.event"
         @click="updateSelectedEventName(eventMap.type, eventMap.event)"
        >

          <div class="m-2">
            <icon
             :icon-url=eventIcons[eventMap.event]
             size="25px"
             color="var(--color-hl)"
            />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style></style>