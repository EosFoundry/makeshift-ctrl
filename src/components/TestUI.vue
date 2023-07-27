
<script lang="ts">
export default {
  name: "TestInterface",
  components: { WorkspacePanel }
}
</script>

<script setup lang="ts">
import { MakeShiftDeviceEvents } from '@eos-makeshift/serial';
import { inject, ref, computed, watch, provide, ComputedRef, Ref, onMounted, onUnmounted } from 'vue';
import Icon from './Icon.vue'
import WorkspacePanel from './WorkspacePanel.vue';
import pressedIcon from '../assets/icon/bootstrap/layer-backward.svg?url'
import releasedIcon from '../assets/icon/bootstrap/layer-forward.svg?url'
import incrementIcon from '../assets/icon/bootstrap/arrow-clockwise.svg?url'
import decrementIcon from '../assets/icon/bootstrap/arrow-counterclockwise.svg?url'
import { SensorEventDetails } from '../main';
import { CueId } from '../../types/electron/main/cues';
import { getEventDetails } from '../utilities/str';

const DeviceEvents = inject('makeshift-device-events') as MakeShiftDeviceEvents
const HardwareDescriptors = inject('hardware-descriptors') as any
const selectedEvent = inject('selected-event') as Ref<string>
const selectedEventCues = inject('selected-event-cues') as Ref<CueId|undefined>
const initialEventDetails = getEventDetails(selectedEvent.value)
const selectedEventDetails = ref(initialEventDetails) as Ref<SensorEventDetails>


const MakeshiftMap = HardwareDescriptors.MakeShift

// console.log('0')
// console.log(HardwareDescriptors)
// console.log('1')
// console.log(DeviceEvents)
// console.log('2')
// console.log(HardwareDescriptors)
// console.log('3')
// console.log(SelectedEvent)

const devicePanel = ref(`
  flex flex-row flex-wrap
  inline-flex
  ml-3
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

const rowClass = ref(`flex flex-row`)
const colClass = ref(`flex flex-col`)


const selectedInputId = ref(0)
provide('selected-input-id', selectedInputId)
const eventListFromSelectedInputId = computed(() => {
  const eventMap = []
  for (const type of MakeshiftMap.sensors[selectedInputId.value].types) {
    console.log(type)
    for (const event of HardwareDescriptors.Sensors[type].events) {
      console.log(event)
      eventMap.push({
        sensorType: type,
        eventType: event
      })
    }
  }

  // console.log(eventMap)
  return eventMap
})

function selectInput(input: any) {
  selectedInputId.value = input.id
  console.log(input)
}

onMounted(() => {
  // console.log('mounted')
  // console.log(selectedEvent.value)
  // console.log(selectedEventDetails.value.eventType)
  // console.log(selectedInputId.value)
  // console.log(eventListFromSelectedInputId.value)
})

onUnmounted(() => {
  // console.log('unmounted')
})

/**
 * TODO:
 * - use `inject()` to get the global variable `selectedEvent` into this component
 *   - The `selectedEvent` variable is declared in `src/main.ts`
 * - when handling the click event, update the global variable `selectedEvent`
 */
const selectedDeviceEventName = ref()
function updateSelectedEventName(inputType: any, inputEvent: any) {
  // console.log('updateSelectedEventName')
  selectedEvent.value = DeviceEvents[inputType][selectedInputId.value][inputEvent.toUpperCase()]
  // console.log(inputType)
  // console.log(inputEvent)
  // console.log(selectedEventDetails.value)
  // console.log(selectedEvent)
}

// const attachedCues = ref('none')
// watch(selectedDeviceEventName, () => {
//   console.log('selectedDeviceEventName changed')
//   console.log(selectedDeviceEventName.value)
//   window.MakeShiftCtrl.get.cuesAttachedToEvent(selectedDeviceEventName.value)
//     .then((maybeCueId) => {
//       if (typeof maybeCueId === 'undefined') {
//         attachedCues.value = 'none'
//       } else {
//         attachedCues.value = maybeCueId
//       }
//     })
// })

watch(
  () => selectedEvent.value,
  (newVal, oldVal) => {
    selectedEventDetails.value = getEventDetails(newVal)
  })

const eventIcons: any = {
  increment: incrementIcon,
  decrement: decrementIcon,
  pressed: pressedIcon,
  released: releasedIcon
}

</script>

<template>
  <div
    :class="['w-full']"
    :style="{
      height: '288px',
    }"
  >
    <div :class="[rowClass, 'h-full', 'w-full', 'items-stretch', 'my-3', 'mb-4']">
      <div :class=devicePanel>
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
      </div>

      <div :class="[rowClass, 'w-full']">
        <div :class="[colClass]">
          <div
            v-for="eventMap in eventListFromSelectedInputId"
            :class="[
              inputSelector,
              'rounded-lg',
              (selectedEventDetails.sensorId === selectedInputId &&
                selectedEventDetails.sensorType === eventMap.sensorType &&
                selectedEventDetails.eventType.toLowerCase() === eventMap.eventType ?
                selected : unselected),
            ]"
            :key="eventMap.eventType"
            @click="updateSelectedEventName(eventMap.sensorType, eventMap.eventType)"
          >

            <div :class="` m-2`">
              <icon
                :icon-url=eventIcons[eventMap.eventType]
                size="25px"
                color="var(--color-hl)"
              />
            </div>

          </div>
        </div>
        <div :class="[colClass, `justify-items-start m-0 text-left`]">
          <p>
            Selected event: {{ selectedEvent }}
          </p>
          <p>
            Cues attached to event: {{ selectedEventCues }}
          </p>
        </div>
        <div>

        </div>

        <workspace-panel
          :class="['mr-3']"
          :style="{
            // width: '250px',
          }"
        />
      </div>
    </div>
  </div>
</template>

<style></style>