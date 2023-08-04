// import { contextBridge, ipcRenderer } from 'electron'
import { ctrlIpcApi, CtrlIpcApi } from '../ipcApi'
const election = require('electron')
// const MakeShiftApi: CtrlIpcApi = JSON.parse(process.env.MakeShiftSerializedApi)

const ipcRndr = election.ipcRenderer

let dryMakeShiftApi: any = {}
Object.assign(dryMakeShiftApi, ctrlIpcApi)

console.log(dryMakeShiftApi)

function hydrate(section, handler: Function): any {
  if (typeof section === 'string') {
    const evName = section
    section = handler(evName)
  } else {
    for (const subS in section) {
      section[subS] = hydrate(section[subS], handler)
    }
  }
  return section
}

const hydratedMakeShiftApi = {
  test: (ev) => ipcRndr.invoke(ctrlIpcApi.test, ev),
  call: hydrate(dryMakeShiftApi.call, (evName) => { return (val) => ipcRndr.invoke(evName, val) }),
  get: hydrate(dryMakeShiftApi.get, (evName) => { return (val) => ipcRndr.invoke(evName, val) }),
  set: hydrate(dryMakeShiftApi.set, (evName) => { return (val) => ipcRndr.invoke(evName, val) }),
  delete: hydrate(dryMakeShiftApi.delete, (evName) => { return (val) => ipcRndr.invoke(evName, val) }),
  onEv: hydrate(dryMakeShiftApi.onEv, (evName) => {
    return (cb: any) => {
      const listener = (e, ...args) => { cb(...args) }
      ipcRndr.on(evName, listener)
      return () => ipcRndr.removeListener(evName, listener)
    }
  }),
  removeListener: (evName, cb) => ipcRndr.removeListener(evName, cb),
}
// console.log(hydratedMakeShiftApi)


// const hydratedApi = {
//   test: () => ipcRndr.invoke(MakeShiftApi.test),
//   get: {
//     events: () => ipcRndr.invoke(MakeShiftApi.get.events),
//     connectedDevices: () => ipcRndr.invoke(MakeShiftApi.get.connectedDevices),
//     logRank: () => ipcRndr.invoke(MakeShiftApi.get.logRank),
//   },
//   set: {
//     cue: (cue) => ipcRndr.invoke(MakeShiftApi.set.cue),
//   },
//   onEv: {
//     terminal: {
//       log: (callback: any) => ipcRndr.on(MakeShiftApi.onEv.terminal.data, callback),
//     },
//     device: {
//       connected: (callback: any) => ipcRndr.on(MakeShiftApi.onEv.device.connected, callback),
//       disconnected: (callback: any) => ipcRndr.on(MakeShiftApi.onEv.device.disconnected, callback),
//     }
//   }
// }

election.contextBridge.exposeInMainWorld('MakeShiftCtrl', hydratedMakeShiftApi)

function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #333333;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = ev => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)
