import { ICueAPI } from "./types/cue"

export interface testAPI { // calling it ElectronAPI could contaminate the electron namespace
  onMPM: (callback: Function) => void,
  onCounterr: (callback: Function) => void,
}

export interface IMakeShiftAPI {
  onSerialStreamData: (callback: Function) => void,
  getMakeShiftEvents: () => void,
  onConnect: (callback: Function) => void,
  onDisconnect: (callback: Function) => void,
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
