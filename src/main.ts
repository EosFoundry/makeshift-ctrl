import { createApp, Ref, ref, watch } from 'vue'
import { customAlphabet } from 'nanoid'
import { MakeShiftPortFingerprint } from '@eos-makeshift/serial'
import { LogLevel } from '@eos-makeshift/msg'
import { Cue, CueMap } from '../types/electron/main/index'
import App from './App.vue'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 21);
const dcDevice: MakeShiftPortFingerprint = {
  devicePath: '',
  portId: '',
  deviceSerial: ''
};
const cueRoot: Folder = {
  name: '.',
  subFolders: [],
  cueFiles: [],
};


(async () => { // loading initial states before app runs
  const state = {
    makeShift: window.MakeShiftCtrl,
    connectedDevices: ref([]) as Ref<MakeShiftPortFingerprint[]>,
    currentDevice: ref(dcDevice) as Ref<MakeShiftPortFingerprint>,
    cues: ref(await window.MakeShiftCtrl.get.allCues()) as Ref<CueMap>,
    cueDirectory: ref(cueRoot) as Ref<Folder>,
    logLevel: ref('info') as Ref<LogLevel>,
    Events: await window.MakeShiftCtrl.get.events(),
    EventsList: await window.MakeShiftCtrl.get.eventsAsList(),
    selectedEvent: ref('dial-01-increment'),
    logRank: await window.MakeShiftCtrl.get.logRank(),
    initialDevices: await window.MakeShiftCtrl.get.connectedDevices(),
  }

  state.connectedDevices.value = state.initialDevices
  if (state.initialDevices.length > 0) {
    state.currentDevice.value = state.initialDevices[0]
  }

  // watch(state.currentDevice, async (currDevice, prevDevice) => {

  // })

  window.MakeShiftCtrl.onEv.device.connected((garb: any, newfp: MakeShiftPortFingerprint) => {
    if (state.connectedDevices.value.length === 0) {
      state.currentDevice.value = newfp
    }
    state.connectedDevices.value.push(newfp)
  })

  window.MakeShiftCtrl.onEv.device.disconnected((garb: any, dcfp: MakeShiftPortFingerprint) => {
    state.connectedDevices.value = state.connectedDevices.value.filter((currfp) => {
      return (currfp.portId !== dcfp.portId || currfp.devicePath !== dcfp.devicePath)
    })
    if (state.connectedDevices.value.length === 0) {
      state.currentDevice.value = dcDevice
    }
  })

  state.cues.value.forEach((cue) => {
    // console.log(cue.id.split('/'))
    addCueToFolderList(cue)
  })

  window.MakeShiftCtrl.onEv.cue.added((garb: any, cue: Cue) => {
    state.cues.value.set(cue.id, cue)
    addCueToFolderList(cue)
  })
  window.MakeShiftCtrl.onEv.cue.changed((garb: any, cue: Cue) => {
    state.cues.value.set(cue.id, cue)
  })
  window.MakeShiftCtrl.onEv.cue.removed((garb: any, cue: Cue) => {
    state.cues.value.delete(cue.id)
    removeCueFromFolderList(cue)
  })

  function addCueToFolderList(cue: Cue) {
    emplaceCue(cue, state.cueDirectory.value, cue.id.split('/').slice(0, -1))
  }
  function removeCueFromFolderList(cue: Cue) {
    extractCue(state.cueDirectory.value, cue.id.split('/'))
  }


  // console.log(state.cues.value)
  // console.log(await state.makeShift.test())
  return state
})().then((state) => {
  const app = createApp(App)
    .provide('logLevel', state.logLevel)
    .provide('makeshift-logRank', state.logRank)
    .provide('makeshift-events', state.Events)
    .provide('makeshift-events-flat', state.EventsList)
    .provide('selected-event', state.selectedEvent)
    .provide('makeshift', state.makeShift)
    .provide('makeshift-connected-devices', state.connectedDevices)
    .provide('current-device', state.currentDevice)
    .provide('cues', state.cues)
    .provide('cue-directory', state.cueDirectory)
    .provide('nanoid', nanoid)
    .mount('#app')
    .$nextTick(() => {
      postMessage({ payload: 'removeLoading' }, '*')
    })

})

function emplaceCue(cue: Cue, currFolder: Folder, relativePath: string[]) {
  // console.log(currFolder)
  const topLevel = relativePath.shift()
  if (typeof topLevel === 'undefined') {
    const cueIdx = currFolder.cueFiles.findIndex((c) => { return c.id === cue.id })
    if (cueIdx === -1) {
      currFolder.cueFiles.push(cue)
    } else {
      currFolder.cueFiles[cueIdx] = cue
    }
  } else {
    // console.log(`tl: ${topLevel} | rp: ${relativePath}`)

    let folderIdx = currFolder.subFolders.findIndex((f) => {
      return f.name === topLevel
    })

    if (folderIdx === -1) {
      currFolder.subFolders.push({
        name: topLevel,
        subFolders: [],
        cueFiles: []
      })
      folderIdx = currFolder.subFolders.length - 1
    }
    emplaceCue(cue, currFolder.subFolders[folderIdx], relativePath)
  }
}
function extractCue(currFolder: Folder, relativePath: string[]) {
  const topLevel = relativePath.shift()
  if (relativePath.length === 0) {
    currFolder.cueFiles = currFolder.cueFiles.filter((f) => {
      return f.file !== topLevel
    })
  } else {
    let folderIdx = currFolder.subFolders.findIndex((f) => {
      return f.name === topLevel
    })
    if (folderIdx === -1) { return }
    else {
      extractCue(currFolder.subFolders[folderIdx], relativePath)
    }
  }
}


export type Folder = {
  name: string,
  subFolders: Folder[]
  cueFiles: Cue[],
}
