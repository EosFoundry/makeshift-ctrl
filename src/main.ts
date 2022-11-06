import './styles/colors.css'
import './styles/fonts.css'

import { createApp, Ref, ref } from 'vue'
import App from './App.vue'
import { v4 as uuidv4 } from 'uuid'
// import { Events } from '@eos-makeshift/serial'

import { resolve, dirname, join } from 'pathe'
import { LogLevel, MakeShiftPortFingerprint } from '@eos-makeshift/serial'


(async () => {
  const state = {
    makeShift: window.makeshift,
    logLevel: ref('info') as Ref<LogLevel>,
    connectedDevices: ref([]) as Ref<MakeShiftPortFingerprint[]>,
    Events: await window.makeshift.get.events(),
    initialDevices: await window.makeshift.get.connectedDevices(),
    logRank: await window.makeshift.get.logRank(),
  }

  state.connectedDevices.value = state.initialDevices


  window.makeshift.onEv.device.connected((garb: any, newfp: MakeShiftPortFingerprint) => {
    state.connectedDevices.value.push(newfp)
  })

  window.makeshift.onEv.device.disconnected((garb: any, newfp: MakeShiftPortFingerprint) => {
    state.connectedDevices.value = state.connectedDevices.value.filter((currfp) => {
      return (currfp.portId !== newfp.portId || currfp.devicePath !== newfp.devicePath)
    })
  })
  console.log(state.initialDevices)

  return state
})().then((state) => {
  const app = createApp(App)
    .provide('logLevel', state.logLevel)
    .provide('makeshift', state.makeShift)
    .provide('makeshift-connected-devices', state.connectedDevices)
    .provide('makeshift-logRank', state.logRank)
    .provide('makeshift-events', state.Events)
    .mount('#app')
    .$nextTick(() => {
      postMessage({ payload: 'removeLoading' }, '*')
    })

})



// window.makeshift.onSerialStreamData((garbage:any, msg:SerialLogMessage) => {
//   console.log(msg.message)
// })

