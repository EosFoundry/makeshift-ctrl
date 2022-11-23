export const makeShiftIpcApi = {
  test: 'mkshft-test',
  get: {
    events: 'mkshft-get-events',
    connectedDevices: 'mkshft-get-connectedDevices',
    logRank: 'mkshft-get-logRank',
    allCues: 'cue-get-all',
    cueById: 'cue-get-byId',
    cueByFolder: 'cue-get-byFolder',
  },
  set: {
    cueFile: 'mkshft-set-cueFile',
  },
  onEv: {
    cue:{
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
  }
}


export const storeKeys = {
  MainWindowState: 'mainWindowState'
}

export type MakeShiftIpcApi = typeof makeShiftIpcApi
export type StoreKeys = typeof storeKeys