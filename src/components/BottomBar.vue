<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, Ref } from 'vue';
import { MakeShiftDeviceEvents, MakeShiftPortFingerprint, MakeShiftSerialEvents } from '@eos-makeshift/serial'
import { LogLevel } from '@eos-makeshift/msg';
import { rndrCtrlAPI, View, ViewList } from '../renderer';
import termOpenIcon from '../assets/icon/bootstrap/terminal.svg?url'
import termCloseIcon from '../assets/icon/bootstrap/terminal-fill.svg?url'
import codeViewIcon from '../assets/icon/bootstrap/code-square.svg?url'
import blocklyViewIcon from '../assets/icon/bootstrap/puzzle.svg?url'
import IconButton from './IconButton.vue';
import TextButton from './TextButton.vue';
import { set } from 'colorjs.io/fn';

const Events = inject('makeshift-serial-events') as MakeShiftSerialEvents
const logLevel = inject('logLevel') as Ref<LogLevel>
const makeshift = inject('makeshift') as rndrCtrlAPI
const connectedDevices = inject('makeshift-connected-devices') as Ref<MakeShiftPortFingerprint[]>
const currentDevice = inject('current-device') as Ref<MakeShiftPortFingerprint>
const selectedEvent = inject('selected-event') as Ref<string>
const terminalActive = inject('terminal-active') as Ref<boolean>
const selectedView = inject('selected-view') as Ref<View>

const viewIcons = {
  'blockly': blocklyViewIcon,
  'code': codeViewIcon,
}

const viewColor = ref({
  'blockly': 'var(--color-hl)',
  'code': 'var(--color-hl)',
})

viewColor.value[selectedView.value] = 'var(--color-text)'

watch(
  () => selectedView.value,
  (newVal, oldVal) => {
    viewColor.value[newVal] = 'var(--color-text)'
    viewColor.value[oldVal] = 'var(--color-hl)'
    console.log(`viewColornew: ${viewColor.value[newVal]}`)
    console.log(`viewColorold: ${viewColor.value[oldVal]}`)
    console.log(`selectedView changed from ${oldVal} to ${newVal}`)
  }
)

// console.log(logLevel.value);

const LogLevels = Object.keys(Events.Log)
const termIcon = computed(() => {
  return terminalActive.value ? termCloseIcon : termOpenIcon
})

function toggleTerm() {
  terminalActive.value = !terminalActive.value
}

onMounted(() => {
  if (typeof currentDevice.value.deviceSerial === 'undefined' && connectedDevices.value.length > 0) {
    currentDevice.value = connectedDevices.value[0]
  }
})


</script>

<template>
  <div
    id="toolbar-wrapper"
    :class="[
      'bg-hl',
      'absolute',
      'bottom-0',
      'left-0',
      'flex',
      'h-16',
      'w-full',
      'px-3',
      'gap-3',
    ]"
  >

    <!-- conncted-devices text div -->
    <div :class="[
      'w-fit',
      'h-fit',
      'mr-3'
    ]">
      Device(s):
    </div>

    <!-- Device list -->
    <div id="device-list">
      <form>
        <label
          class="device-status-blob"
          v-for="dev in connectedDevices"
          :for="dev.deviceSerial"
        >
          <input
            type="radio"
            :id="dev.deviceSerial"
            :value="dev"
            v-model="currentDevice"
          />
          <code> <b> ID: {{ dev.deviceSerial.slice(0, 4) }} | PATH: {{ dev.devicePath }} </b> </code>
        </label>
      </form>
    </div>

    <!-- Log level text -->
    <div>
      Log Level:

      <!-- Log level selector -->
      <!-- {{ logLevel }} -->
      <select
        name="log-level-selector"
        v-model="logLevel"
      >
        <option v-for="lv in LogLevels">
          {{ lv }}
        </option>
      </select>
    </div>


    <span :class="[
      'flex',
      'flex-row',
      'gap-2',
      'items-center',
    ]">
      view:
      <span :class="[
        'flex',
        'flex-row',
        'gap-2',
        'p-2.5',
        'rounded-md',
        'bg-dark',
        'items-center',
      ]">
        <IconButton
          v-for="view in ViewList"
          :icon-url="viewIcons[view]"
          @click="selectedView = view"
          :color="viewColor[view]"
          hover-color="var(--color-text)"
        />

      </span>
    </span>

    <TextButton
      :icon-url="termIcon"
      color="var(--color-bg)"
      hover-color="var(--color-text)"
      :class="[
        'ml-3'
      ]"
      @click="toggleTerm"
    >
      {{ terminalActive ? 'Close' : 'Open' }} Terminal
    </TextButton>
    <!-- Current Targeted Event status -->
    <!-- <div :class="['mr-3']">
    {{ selectedEvent }}
    </div> -->
  </div>
</template>

<style lang="scss">
input[type="radio"]+svg {
  -webkit-transition: all 0.2s;
  transition: all 0.2s;
}

#toolbar-wrapper {
  background-color: rgb(var(--color-hl));
  display: flex;
  align-items: center;
  color: rgb(var(--color-text));
  // padding: 8px;
  // padding-left: 0px;
  // padding-right: 0px;
}

#device-list {
  flex-grow: 100;
  text-align: left;
}


.device-status-blob {
  font-family: 'Iosevka Makeshift';
  font-size: 11pt;
  width: fit-content;
  height: fit-content;
  // margin: 8px;
  padding: 4px;
  padding-left: 8px;
  padding-right: 8px;
  color: rgb(var(--color-text));
  background-color: rgb(var(--color-bg));
  border-radius: 3px;
}
</style>