import { ICueAPI } from "./types/cue"

export interface testAPI { // calling it ElectronAPI could contaminate the electron namespace
  onMPM: (callback: Function) => void,

}

export interface IMakeShiftAPI {

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
