export declare const ctrlIpcApi: {
    test: string;
    call: {
        openCueFolder: string;
        runCue: string;
    };
    get: {
        events: string;
        eventsAsList: string;
        connectedDevices: string;
        logRank: string;
        allCues: string;
        cueById: string;
        cueByFolder: string;
    };
    set: {
        cueFile: string;
        cueForEvent: string;
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
    UuidNamespace: string;
    MainWindowState: string;
    DeviceLayouts: string;
};
export type CtrlIpcApi = typeof ctrlIpcApi;
export type StoreKeys = typeof storeKeys;
