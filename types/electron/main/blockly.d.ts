import * as chokidar from 'chokidar';
import '@blockly/field-grid-dropdown';
import { Maybe } from 'purify-ts/Maybe';
import { Cue } from './cues';
export type BlockGroup = {
    name: string;
    id: string;
    blockTuples: {
        block: any;
        init: Function;
        generateCode: Function;
    }[];
    toolboxCategory: any;
    flyoutCallback?: Function;
};
export declare let workspaceWatcher: chokidar.FSWatcher;
export declare const groups: BlockGroup[];
export declare const blocklist: {
    [key: string]: MakeShiftBlockTuple;
};
export declare const workspaceList: {
    [key: string]: any;
};
export declare const workspaceStore: import("electron-store")<Record<string, unknown>>;
export declare function mirrorWorkspace(serialWorkspace: Maybe<any>): Promise<void>;
export declare function generateCodeFromWorkspace(serialWorkspace: any): Promise<Maybe<any>>;
export declare function initBlockly(): Promise<void>;
export declare function loadBlockGroup(directoryPath: string): Promise<Maybe<BlockGroup>>;
export declare function getToolbox(): any;
export declare function loadBlockFromPath(blockPath: string): Promise<Maybe<MakeShiftBlockJSON>>;
export declare function syncGroupsWithToolbox(): Promise<void>;
export declare function sendBlocks(): Promise<void>;
export declare function sendDefaultWorkspace(): Promise<void>;
export declare function sendSerialWorkspace(serialWorkspace: any): Promise<void>;
export declare function loadSerialWorkspaceFromFile(cue: Cue): Promise<Maybe<any>>;
export declare function saveSerialWorkspace(cue: Cue, serialWorkspace: any): Promise<any>;
export declare function sendWorkspaceList(): Promise<void>;
export type BlocklyTypes = 'Number' | 'Boolean' | 'String' | 'Array' | 'Colour';
export type MakeShiftBlockFieldJSON = {
    type: string;
    name: string;
    text?: string;
    align?: "LEFT" | "CENTRE" | "RIGHT";
    check?: BlocklyTypes[];
    [key: string]: any;
};
export type MakeShiftBlockJSON = {
    type: string;
    [key: `message${number}`]: string;
    [key: `args${number}`]: MakeShiftBlockFieldJSON[];
    inputsInline: boolean;
    previousStatement?: null | "Action";
    nextStatement?: null | "Action";
    colour?: number;
    tooltip: string;
    helpUrl: string;
    hash: string | undefined;
};
export type MakeShiftBlockTuple = {
    block: MakeShiftBlockJSON;
    init: Function | undefined;
    generateCode: Function;
};
