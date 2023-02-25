/// <reference types="node" />
import * as chokidar from 'chokidar';
export type IModule = typeof Electron.CrossProcessExports;
export interface Cue {
    id: CueId;
    file: string;
    fullPath: string;
    name: string;
    folder: string;
    contents?: Buffer;
    modulePath?: string;
}
export type CueId = string;
export type CueMap = Map<string, Cue>;
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
export declare let cueWatcher: chokidar.FSWatcher;
export declare const cues: CueMap;
export declare const loadedCues: {
    [key: string]: CueModule;
};
export declare function initCues(): Promise<void>;
export declare function newCueFromPath(path: any): Cue;
export declare function saveCueFile(data: {
    cueId: string;
    contents: Uint8Array;
}): Promise<string>;
export declare function importCueModule(cue: Cue): Promise<Cue>;
export declare function unloadCueModule(cue: Cue): Promise<void>;
export declare function loadCueDialog(): Promise<{
    name: string;
    path: string;
}>;
