import './styles/colors.css'
import './styles/fonts.css'

import { createApp, Ref, ref, watch } from 'vue'
import App from './App.vue'
import { customAlphabet } from 'nanoid'

import { resolve, dirname, join } from 'pathe'
import { LogLevel, MakeShiftPortFingerprint } from '@eos-makeshift/serial'
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);
const dcDevice: MakeShiftPortFingerprint = {
  devicePath: '',
  portId: '',
  deviceSerial: ''
};


(async () => { // loading initial states before app runs
  const state = {
    makeShift: window.makeshift,
    connectedDevices: ref([]) as Ref<MakeShiftPortFingerprint[]>,
    currentDevice: ref(dcDevice) as Ref<MakeShiftPortFingerprint>,
    logLevel: ref('info') as Ref<LogLevel>,
    Events: await window.makeshift.get.events(),
    logRank: await window.makeshift.get.logRank(),
    initialDevices: await window.makeshift.get.connectedDevices(),
  }

  state.connectedDevices.value = state.initialDevices
  if (state.initialDevices.length > 0) {
    state.currentDevice.value = state.initialDevices[0]
  }
  watch(state.currentDevice, async (currDevice, prevDevice) => {

  })

  window.makeshift.onEv.device.connected((garb: any, newfp: MakeShiftPortFingerprint) => {
    if (state.connectedDevices.value.length === 0) {
      state.currentDevice.value = newfp
    }
    state.connectedDevices.value.push(newfp)
  })

  window.makeshift.onEv.device.disconnected((garb: any, dcfp: MakeShiftPortFingerprint) => {
    state.connectedDevices.value = state.connectedDevices.value.filter((currfp) => {
      return (currfp.portId !== dcfp.portId || currfp.devicePath !== dcfp.devicePath)
    })
    if (state.connectedDevices.value.length === 0) {
      state.currentDevice.value = dcDevice
    }
  })
  // console.log(state.initialDevices)
  // console.log(await state.makeShift.test())
  return state
})().then((state) => {
  const app = createApp(App)
    .provide('logLevel', state.logLevel)
    .provide('makeshift', state.makeShift)
    .provide('makeshift-connected-devices', state.connectedDevices)
    .provide('current-device', state.currentDevice)
    .provide('makeshift-logRank', state.logRank)
    .provide('makeshift-events', state.Events)
    .provide('nanoid', nanoid)
    .mount('#app')
    .$nextTick(() => {
      postMessage({ payload: 'removeLoading' }, '*')
    })

})



// window.makeshift.onSerialStreamData((garbage:any, msg:SerialLogMessage) => {
//   console.log(msg.message)
// })

