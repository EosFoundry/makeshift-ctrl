import { LogMessage, MakeShiftPortFingerprint } from "@eos-makeshift/serial"
import {
  IpcMainCallHandler,
  IpcMainGetHandler,
  IpcMainSetHandler
} from 'types/electron/main/index'
import { Cue } from 'types/electron/main/cues'

export interface rndrCtrlAPI {
  test: () => void,
  call: IpcMainCallHandler,
  get: IpcMainGetHandler,
  set: IpcMainSetHandler,
  onEv: {
    cue: {
      added: (callback: (e: any, cue: Cue) => void) => void,
      changed: (callback: (e: any, cue: Cue) => void) => void,
      removed: (callback: (e: any, cue: Cue) => void) => void,
    }
    device: {
      connected: (callback: (e: any, fp: MakeShiftPortFingerprint) => void) => void,
      disconnected: (callback: (e: any, fp: MakeShiftPortFingerprint) => void) => void,
    },
    terminal: {
      data: (callback: (e: any, fp: LogMessage) => void) => void,
    },
  }
}

export interface IPluginAPI {

}

declare global {
  interface Window {
    MakeShiftCtrl: rndrCtrlAPI
    plugin: IPluginAPI
    // cue: ICueAPI
  }
}
