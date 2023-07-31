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
}
export type CueId = string;
export type CueMap = Map<string, Cue>;
export interface CueModule extends IModule {
    suspicions: any;
    id: CueId;
    requiredPlugins?: string[];
    plugins?: any;
    setup: Function;
    run: (eventData?: any) => void;
    runTriggers: {
        [key: string]: {
            events: string[];
        };
    };
    modulePath: string;
    [key: string]: any;
}
export declare let cueWatcher: chokidar.FSWatcher;
export declare const cues: CueMap;
export declare const loadedCueModules: {
    [key: CueId]: CueModule;
};
export declare function initCues(): Promise<void>;
export declare function cueExists(cueId: CueId): boolean;
/**
 * Creates a new cue from a path relative to the default cue folder
 * i.e.  `{folders if any}/cuefile.cue.js` - the path does not need to exist.
 * @param path
 */
export declare function generateCueFromRelativePath(path: any): Cue;
export declare function saveCueFile(data: {
    cueId: CueId;
    contents: Uint8Array | string;
}): Promise<string>;
/**
 * Imports a cue module by generating a temporary file name and copying the cue file to it.
 * If the cue module has already been loaded, it will be unloaded before being reloaded.
 * @param cue The cue to import
 * @returns The imported cue
 */
export declare function importCueModule(cue: Cue): Promise<Cue>;
/**
 * Unloads a cue module from memory.
 * @param cue The cue to unload.
 */
export declare function unloadCueModule(cue: Cue): Promise<void>;
export declare function loadCueDialog(): Promise<{
    name: string;
    path: string;
}>;
