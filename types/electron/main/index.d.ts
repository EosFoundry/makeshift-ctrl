import { BrowserWindow } from 'electron';
import { MakeShiftPortFingerprint } from '@eos-makeshift/serial';
import { CueId, CueMap, saveCueFile } from './cues';
export declare let mainWindow: BrowserWindow | null;
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
    cueById: (id: any) => import("./cues").Cue;
    cueByFolder: (folder: any) => CueMap;
};
declare const ipcMainSetHandler: {
    cueFile: typeof saveCueFile;
    cueForEvent: (data: {
        cueId: string;
        event: string;
        contents: Uint8Array;
    }) => Promise<string>;
};
export type IpcMainCallHandler = typeof ipcMainCallHandler;
export type IpcMainGetHandler = typeof ipcMainGetHandler;
export type IpcMainSetHandler = typeof ipcMainSetHandler;
/**
 * Cue section
 */
export declare function attachWatchers(): Promise<void>;
export declare function attachCueToEvent({ event, cueId }: {
    event: MakeShiftEvent;
    cueId: CueId;
}): Promise<void>;
export {};
