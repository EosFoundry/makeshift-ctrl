import { ICueAPI } from "types/cue"

export interface testAPI { // calling it ElectronAPI could contaminate the electron namespace
  onMPM: (callback:function) => void,
  
}
  
export interface IMakeShiftDeviceAPI {

}

export interface IPluginAPI {
  
}


declare global {
  interface Window {
    electronAPI: testAPI
    makeshift: IMakeShiftDeviceAPI
    plugin: IPluginAPI
    cue: ICueAPI
  }
}
