import { LogLevel, LogMessage, MakeShiftDeviceEvents, MakeShiftPortFingerprint, MsgLvStringMap } from "@eos-makeshift/serial"
import { ICueAPI } from "./types/cue"

export interface testAPI { // calling it ElectronAPI could contaminate the electron namespace
  onMPM: (callback: Function) => void,
  onCounterr: (callback: Function) => void,
}

export interface IMakeShiftAPI {
  test: () => void,
  call: {
    loadDevices: () => void,
  },
  get: {
    events: () => MakeShiftDeviceEvents,
    connectedDevices: () => MakeShiftPortFingerprint[],
    logRank: () => MsgLvStringMap,
  },
  onEv: {
    terminal: {
      log: (callback: (e: any, fp: LogMessage) => void) => void,
    },
    device: {
      connected: (callback: (e: any, fp: MakeShiftPortFingerprint) => void) => void,
      disconnected: (callback: (e: any, fp: MakeShiftPortFingerprint) => void) => void,
    }
  }
}

export interface IPluginAPI {

}

declare global {
  interface Window {
    buttAPI: testAPI
    makeshift: IMakeShiftDeviceAPI
    plugin: IPluginAPI
    cue: ICueAPI
  }
}
