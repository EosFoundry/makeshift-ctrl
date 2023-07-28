import { BrowserWindow } from 'electron';
import { Block } from 'blockly';
import { MakeShiftPortFingerprint, MakeShiftDeviceEvents, MakeShiftSerialEvents } from '@eos-makeshift/serial';
import { Maybe } from 'purify-ts/Maybe';
import { saveCueFile, Cue, CueId, CueMap } from './cues';
import { Theme } from './themes';
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
export type Size = {
    width: number;
    height: number;
};
export declare function getMainWindow(): Maybe<BrowserWindow>;
/**
 * IPC Call API
 *
 * UI interactions with side effects - opening folders, running cues directly
 */
declare const ipcMainCallHandler: {
    openCueFolder: () => Promise<void>;
    runCue: (cueId: any) => Promise<void>;
    fetchBlocklyToolbox: () => Promise<void>;
    fetchBlocklyBlocks: () => Promise<void>;
    fetchBlocklyDefaultWorkspace: () => Promise<void>;
};
/**
 * IPC Get API
 *
 * Gets state data in various formats
 */
declare const ipcMainGetHandler: {
    connectedDevices: () => Promise<MakeShiftPortFingerprint[]>;
    deviceEvents: () => Promise<MakeShiftDeviceEvents>;
    serialEvents: () => Promise<MakeShiftSerialEvents>;
    hardwareDescriptors: () => Promise<{
        MakeShift: any;
        Sensors: any;
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
    cuesAttachedToEvent: (event: string) => Promise<CueId | undefined>;
    cueById: (id: any) => Promise<Cue>;
    cueByFolder: (folder: any) => Promise<CueMap>;
    clientSize: () => Promise<Size>;
    blocklyToolbox: () => Promise<any>;
    allBlocklySerialWorkspaceNames: () => Promise<string[]>;
    blocklySerialWorkspace: (workspaceKey: any) => Promise<any>;
    blockGenerator: (block: Block) => Promise<any>;
    storedObjectKeys: () => Promise<string[]>;
    defaultTheme: () => Promise<Theme>;
    themeFromPath: (path: string) => Promise<Theme>;
};
/**
 * IPC Set API
 *
 * modifies state
 */
declare const ipcMainSetHandler: {
    serialWorkspaceAsCue: (serialWorkspace: any) => Promise<Cue>;
    cueFile: typeof saveCueFile;
    blocklyWorkspaceForEvent: (data: {
        workspaceName: string;
        event: string;
    }) => Promise<void>;
    cueForEvent: (data: {
        cueId: string;
        event: string;
        contents?: Uint8Array;
    }) => Promise<string>;
};
declare const ipcMainDeleteHandler: {
    workspace: (workspaceName: string) => Promise<void>;
};
export declare function attachCueWatchers(): Promise<void>;
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
export type ipcMainDeleteHandler = typeof ipcMainDeleteHandler;
export {};
