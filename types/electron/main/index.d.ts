/// <reference types="node" />
import { BrowserWindow } from 'electron';
import { MakeShiftPortFingerprint } from '@eos-makeshift/serial';
export declare let mainWindow: BrowserWindow | null;
export declare type CueMap = Map<string, Cue>;
export declare type DeviceId = string;
export declare type MakeShiftEvent = string;
export declare type DeviceLayout = Map<MakeShiftEvent, Cue>;
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
            Log: import("@eos-makeshift/serial").MsgLvStringMap;
        };
    };
    logRank: () => {
        all: number;
        debug: number;
        info: number;
        deviceEvent: number;
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
    cueFile: (data: {
        cueId: string;
        contents: Uint8Array;
    }) => Promise<string>;
};
export declare type IpcMainGetHandler = typeof ipcMainGetHandler;
export declare type IpcMainSetHandler = typeof ipcMainSetHandler;
declare type IModule = typeof Electron.CrossProcessExports;
export interface CueModule extends IModule {
    requiredPlugins?: string[];
    plugins?: any;
    setup: Function;
    run: () => void;
    runTriggers?: {
        deviceId: string;
        events: string[];
    }[];
    moduleId: string;
}
declare type CueId = string;
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
