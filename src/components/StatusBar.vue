<script setup lang="ts">
import { inject, onMounted, Ref, ref, watch } from 'vue';
import { LogLevel, MakeShiftDeviceEvents, MakeShiftPortFingerprint } from '@eos-makeshift/serial'

const Events = inject('makeshift-events') as Ref<MakeShiftDeviceEvents>
const initialLevel = inject('logLevel') as Ref<LogLevel>
const connectedDevices = inject('makeshift-connected-devices') as Ref<MakeShiftPortFingerprint[]>
const currentDevice = inject('current-device') as Ref<MakeShiftPortFingerprint>

onMounted(() => {

  if (typeof currentDevice.value.portId === 'undefined' && connectedDevices.value.length > 0){
    currentDevice.value = connectedDevices.value[0]
  }
})



</script>
<template>
  <div id="statusbar-wrapper">
    <div class="status-text">
      Connected:
    </div>
    <form class="asdf">
      <label class="device-status-blob" v-for="dev in connectedDevices" :for="dev.portId">
        <input type="radio" :id="dev.portId" :value="dev" v-model="currentDevice" />
        <b>ID: {{ dev.portId }} | PATH: {{ dev.devicePath }}</b>
      </label>
    </form>
  </div>
</template>

<style lang="scss">
input[type="radio"]+svg {
  -webkit-transition: all 0.2s;
  transition: all 0.2s;
}

#statusbar-wrapper {
  background-color: var(--color-hl);
  display: flex;
  align-items: center;
  height: fit-content;
  padding: 8px;
  padding-left: 0px;
}

.status-text {
  width: fit-content;
  height: fit-content;
  margin-left: 8px;
  margin-right: 8px;

}

.device-status-blob {
  font-family: 'iosevka-makeshift Web';
  font-size: 11pt;
  width: fit-content;
  height: fit-content;
  // margin: 8px;
  padding: 4px;
  padding-left: 8px;
  padding-right: 8px;
  color: var(--color-text);
  background-color: var(--color-bg);
  border-radius: 3px;
}
</style>