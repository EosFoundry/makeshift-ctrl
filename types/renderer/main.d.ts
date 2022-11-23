import { Cue } from '../types/electron/main/index';
export declare type Folder = {
    name: string;
    subFolders: Folder[];
    files: Cue[];
};
