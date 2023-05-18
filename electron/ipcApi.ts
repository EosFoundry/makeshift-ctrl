export const ctrlIpcApi = {
  test: 'mkshft-test',
  call: {
    openCueFolder: 'shell-openCueFolder',
    runCue: 'mkshft-runCue'
  },
  get: {
    events: 'mkshft-get-events',
    eventsAsList: 'mkshft-get-events-list',
    connectedDevices: 'mkshft-get-connectedDevices',
    logRank: 'mkshft-get-logRank',
    clientSize: 'window-get-size',
    allCues: 'cue-get-all',
    cueById: 'cue-get-byId',
    cueByFolder: 'cue-get-byFolder',
  },
  set: {
    cueFile: 'mkshft-set-cueFile',
    cueForEvent: 'mkshft-set-cueForEvent',
  },
  onEv: {
    cue: {
      added: 'cue-added',
      changed: 'cue-changed',
      removed: 'cue-deleted',
    },
    device: {
      connected: 'mkshft-ev-device-connected',
      disconnected: 'mkshft-ev-device-disconnected',
    },
    terminal: {
      data: 'mkshft-ev-termi-data'
    },
  },
}


export const storeKeys = {
  UuidNamespace: 'uuidNamespace',
  MainWindowState: 'mainWindowState',
  DeviceLayout: 'deviceLayout'
}

export type CtrlIpcApi = typeof ctrlIpcApi
export type StoreKeys = typeof storeKeys