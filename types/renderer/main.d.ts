import { Cue } from '../types/electron/main/index';
export type Folder = {
    name: string;
    subFolders: Folder[];
    cueFiles: Cue[];
};
