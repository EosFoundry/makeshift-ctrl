<script setup lang="ts">
import { inject, watch } from 'vue';
import { LogLevel, MakeShiftDeviceEvents, MakeShiftPortFingerprint } from '@eos-makeshift/serial'

const Events = inject('makeshift-events') as MakeShiftDeviceEvents
const initialLevel = inject('logLevel') as LogLevel
const connectedDevices = inject('makeshift-connected-devices') as MakeShiftPortFingerprint[]


// for 



</script>
<template>
  <div id="statusbar-wrapper">
    <div class="status-text">
      Connected:
    </div>
    <div class="device-status-blob" v-for="dev in connectedDevices">
      <b>ID: {{dev.portId }} | SN: {{ dev.deviceSerial.slice(0, 8) }} | PATH: {{ dev.devicePath }}</b>
    </div>

  </div>
</template>

<style lang="scss">
#statusbar-wrapper {
  background-color: var(--color-hl);
  display: flex;
  align-items: center;
  height: 50px;
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
  color: var(--color-hl);
  background-color: var(--color-primary);
  border-radius: 3px;
}
</style>