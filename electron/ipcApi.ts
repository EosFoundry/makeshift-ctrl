export const makeShiftIpcApi = {
  get: {
    events: 'mkshft-get-events',
    connectedDevices: 'mkshft-get-connectedDevices',
    logRank: 'mkshft-get-logRank',
  },
  call: {
    loadDevices: 'mkshft-call-loadDevices',
  },
  onEv: {
    device: {
      connected: 'mkshft-ev-device-connected',
      disconnected: 'mkshft-ev-device-disconnected',
    }, 
    terminal: {
      data: 'mkshft-ev-termi-data'
    }
  }
}
export type MakeShiftIpcApi = typeof makeShiftIpcApi