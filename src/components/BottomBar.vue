<script setup lang="ts">
import { inject, onMounted, Ref } from 'vue';
import { MakeShiftDeviceEvents, MakeShiftPortFingerprint } from '@eos-makeshift/serial'
import { LogLevel } from '@eos-makeshift/msg';
import { rndrCtrlAPI } from '../renderer';

const Events = inject('makeshift-events') as MakeShiftDeviceEvents
const logLevel = inject('logLevel') as Ref<LogLevel>
const makeshift = inject('makeshift') as rndrCtrlAPI
const connectedDevices = inject('makeshift-connected-devices') as Ref<MakeShiftPortFingerprint[]>
const currentDevice = inject('current-device') as Ref<MakeShiftPortFingerprint>
const selectedEvent = inject('selected-event') as Ref<string>

// console.log(logLevel.value);

const LogLevels = Object.keys(Events.Terminal.Log)

function needful() {
  makeshift.test()
}

onMounted(() => {
  if (typeof currentDevice.value.portId === 'undefined' && connectedDevices.value.length > 0) {
    currentDevice.value = connectedDevices.value[0]
  }
})
</script>

<template>
  <div id="toolbar-wrapper">
    <div class="status-text">
      Connected Device(s):
    </div>
    <div id="device-list">
      <form>
        <label class="device-status-blob" v-for="dev in connectedDevices" :for="dev.portId">
          <input type="radio" :id="dev.portId" :value="dev" v-model="currentDevice" />
          <code>
         <b>ID: {{ dev.portId.slice(0, 4) }} | PATH: {{ dev.devicePath }}</b>
        </code>
        </label>
      </form>
    </div>
    <div>
      Log Level:
    </div>
    <select name="log-level-selector" v-model="logLevel">
      <option v-for="lv in LogLevels">
        {{ lv }}
      </option>
    </select>
    <div>
    {{ selectedEvent }}
    </div>
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
  // height: 2.5rem;
  padding: 8px;
  padding-left: 0px;
}

#device-list {
  flex-grow: 100;
  text-align: left;
}

.status-text {
  width: fit-content;
  height: fit-content;
  margin-left: 8px;
  margin-right: 8px;

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