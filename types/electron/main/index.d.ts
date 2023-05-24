import { BrowserWindow } from 'electron';
import { MakeShiftPortFingerprint } from '@eos-makeshift/serial';
import { saveCueFile, CueId, CueMap, Cue } from './cues';
export type DeviceId = string;
export type MakeShiftEvent = string;
export type EventCueMap = Map<MakeShiftEvent, Cue>;
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
export type CompactedLayout = {
    layers: Map<MakeShiftEvent, string>[];
    layerLabels: LayerLabel[];
};
export type Size = {
    width: number;
    height: number;
};
export declare function getMainWindow(): BrowserWindow;
/**
 * IPC Call API
 *
 * UI interactions with side effects - opening folders, running cues directly
 */
declare const ipcMainCallHandler: {
    openCueFolder: () => Promise<void>;
    runCue: (cueId: any) => Promise<void>;
};
/**
 * IPC Get API
 *
 * Gets state data in various formats
 */
declare const ipcMainGetHandler: {
    connectedDevices: () => Promise<MakeShiftPortFingerprint[]>;
    events: () => Promise<{
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
            CONNECTION_ERROR: string;
            DISCONNECTED: string;
            CONNECTED: string;
            STATE_UPDATE: string;
        };
        Terminal: {
            Log: import("@eos-makeshift/msg").MsgLvStringMap;
        };
    }>;
    eventsAsList: () => Promise<any[]>;
    logRank: () => Promise<{
        all: number;
        debug: number;
        deviceEvent: number;
        info: number;
        warn: number;
        error: number;
        fatal: number;
        none: number;
    }>;
    allCues: () => Promise<CueMap>;
    cueById: (id: any) => Promise<Cue>;
    cueByFolder: (folder: any) => Promise<CueMap>;
    clientSize: () => Promise<Size>;
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
export declare function attachWatchers(): Promise<void>;
export declare function detachCueFromEvent({ layerName, event, cueId }: {
    layerName: string;
    event: MakeShiftEvent;
    cueId: CueId;
}): Promise<void>;
export declare function attachCueToEvent({ layerName, event, cueId }: {
    layerName: string;
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
