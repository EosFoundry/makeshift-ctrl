import './styles/colors.css'

import { createApp, Ref, ref } from 'vue'
import App from './App.vue'
import { v4 as uuidv4 } from 'uuid'
// import { Events } from '@eos-makeshift/serial'

import { resolve, dirname, join } from 'pathe'
import ace, { type Ace } from 'ace-builds'
import 'ace-builds' // this needs to be called for ace.define to exist
import { LogLevel, MakeShiftPortFingerprint } from '@eos-makeshift/serial'
// import acePath from '/ace-pkg/src-min-noconflict/ace.js?url'
const acePath = join(import.meta.env.BASE_URL + 'ace-pkg/src-min-noconflict')
ace.config.set("basePath", acePath)
ace.config.set("workerPath", acePath);
ace.config.set("loadWorkerFromBlob", false);

// console.log('acepath: ' + acePath)

const appGlobals = {
  makeShift: window.makeshift,
}

const logLevel: Ref<LogLevel> = ref('info')

const connectedDevices: Ref<MakeShiftPortFingerprint[]> = ref([])

const Events = await window.makeshift.get.events()

const initialDevices = await window.makeshift.get.connectedDevices()

const logRank = await window.makeshift.get.logRank()

initialDevices.forEach((fp: MakeShiftPortFingerprint) => {
  connectedDevices.value.push(fp)
})

window.makeshift.onEv.device.connected((garb: any, newfp: MakeShiftPortFingerprint) => {
  connectedDevices.value.push(newfp)
})

window.makeshift.onEv.device.disconnected((garb: any, newfp: MakeShiftPortFingerprint) => {
  connectedDevices.value = connectedDevices.value.filter((currfp) => {
    return (currfp.portId !== newfp.portId || currfp.devicePath !== newfp.devicePath)
  })
})

console.log(Events)


// window.makeshift.onSerialStreamData((garbage:any, msg:SerialLogMessage) => {
//   console.log(msg.message)
// })

const app = createApp(App)
  .provide('ace', ace)
  .provide('appGlobals', appGlobals)
  .provide('logLevel', logLevel)
  .provide('makeshift', appGlobals.makeShift)
  .provide('makeshift-connected-devices', connectedDevices)
  .provide('makeshift-logRank', logRank)
  .provide('makeshift-events', Events)
  .mount('#app')
  .$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
  })
