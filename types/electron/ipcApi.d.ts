export declare const makeShiftIpcApi: {
    test: string;
    get: {
        events: string;
        connectedDevices: string;
        logRank: string;
        allCues: string;
        cueById: string;
        cueByFolder: string;
    };
    set: {
        cueFile: string;
    };
    onEv: {
        cue: {
            added: string;
            changed: string;
            removed: string;
        };
        device: {
            connected: string;
            disconnected: string;
        };
        terminal: {
            data: string;
        };
    };
};
export declare const storeKeys: {
    MainWindowState: string;
};
export declare type MakeShiftIpcApi = typeof makeShiftIpcApi;
export declare type StoreKeys = typeof storeKeys;
