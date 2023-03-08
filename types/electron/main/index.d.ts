import { BrowserWindow } from 'electron';
import { MakeShiftPortFingerprint } from '@eos-makeshift/serial';
import { saveCueFile, CueId, CueMap } from './cues';
export type DeviceId = string;
export type MakeShiftEvent = string;
export type EventCueMap = Map<MakeShiftEvent, CueId>;
export type LayerLabel = {
    name: string;
    color: string;
    graphic?: string;
    audio?: any;
};
export type Layout = {
    layers: EventCueMap[];
    layerLabels: LayerLabel[];
};
export declare function getMainWindow(): BrowserWindow;
/**
 * IPC Call API
 *
 * UI interactions with side effects - opening folders, running cues directly
 */
declare const ipcMainCallHandler: {
    openCueFolder: () => void;
    runCue: (cueId: any) => Promise<void>;
};
/**
 * IPC Get API
 *
 * Gets state data in various formats
 */
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
/**
 * IPC Set API
 *
 * modifies state
 */
declare const ipcMainSetHandler: {
    cueFile: typeof saveCueFile;
    cueForEvent: (data: {
        cueId: string;
        event: string;
        contents: Uint8Array;
    }) => Promise<string>;
};
/**
 * Cue section
 */
export declare function attachWatchers(): Promise<void>;
export declare function attachCueToEvent({ event, cueId }: {
    event: MakeShiftEvent;
    cueId: CueId;
}): Promise<void>;
/**
 * Exports
 */
export type IpcMainCallHandler = typeof ipcMainCallHandler;
export type IpcMainGetHandler = typeof ipcMainGetHandler;
export type IpcMainSetHandler = typeof ipcMainSetHandler;
export {};
