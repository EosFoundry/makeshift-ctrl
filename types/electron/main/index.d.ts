/// <reference types="node" />
import { BrowserWindow } from 'electron';
import { MakeShiftPortFingerprint } from '@eos-makeshift/serial';
export declare let mainWindow: BrowserWindow | null;
export type CueMap = Map<string, Cue>;
export type DeviceId = string;
export type MakeShiftEvent = string;
export type EventToCueMap = Map<MakeShiftEvent, CueId>;
declare const ipcMainCallHandler: {
    openCueFolder: () => void;
    runCue: (cueId: any) => Promise<void>;
};
declare const ipcMainGetHandler: {
    connectedDevices: () => MakeShiftPortFingerprint[];
    events: () => {
        DIAL: {
            INCREMENT: string;
            DECREMENT: string;
            CHANGE: string;
        }[];
        BUTTON: {
            PRESSED: string;
            RELEASED: string;
            CHANGE: string;
        }[];
        DEVICE: {
            DISCONNECTED: string;
            CONNECTED: string;
            STATE_UPDATE: string;
        };
        Terminal: {
            Log: import("@eos-makeshift/msg").MsgLvStringMap;
        };
    };
    eventsAsList: () => any[];
    logRank: () => {
        all: number;
        debug: number;
        deviceEvent: number;
        info: number;
        warn: number;
        error: number;
        fatal: number;
        none: number;
    };
    allCues: () => CueMap;
    cueById: (id: any) => Cue;
    cueByFolder: (folder: any) => CueMap;
};
declare const ipcMainSetHandler: {
    cueFile: typeof saveCueFile;
    cueForEvent: (data: {
        cueId: string;
        event: string;
        contents: Uint8Array;
    }) => Promise<void>;
};
export type IpcMainCallHandler = typeof ipcMainCallHandler;
export type IpcMainGetHandler = typeof ipcMainGetHandler;
export type IpcMainSetHandler = typeof ipcMainSetHandler;
declare function saveCueFile(data: {
    cueId: string;
    contents: Uint8Array;
}): Promise<string>;
type IModule = typeof Electron.CrossProcessExports;
type CueId = string;
export interface CueModule extends IModule {
    requiredPlugins?: string[];
    plugins?: any;
    setup: Function;
    run: () => void;
    runTriggers: {
        deviceId: string;
        events: string[];
    }[];
    moduleId: string;
}
export interface Cue {
    id: CueId;
    file: string;
    fullPath: string;
    name: string;
    folder: string;
    contents?: Buffer;
    modulePath?: string;
}
export {};
