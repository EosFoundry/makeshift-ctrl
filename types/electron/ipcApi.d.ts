export declare const ctrlIpcApi: {
    test: string;
    call: {
        openCueFolder: string;
        runCue: string;
        fetchBlocklyToolbox: string;
        fetchBlocklyBlocks: string;
        fetchBlocklyDefaultWorkspace: string;
    };
    get: {
        deviceEvents: string;
        serialEvents: string;
        hardwareDescriptors: string;
        eventsAsList: string;
        connectedDevices: string;
        logRank: string;
        clientSize: string;
        allCues: string;
        allBlocklySerialWorkspaceNames: string;
        blocklyToolbox: string;
        blocklySerialWorkspace: string;
        blockGenerator: string;
        cuesAttachedToEvent: string;
        cueById: string;
        cueByFolder: string;
        defaultTheme: string;
        themeFromPath: string;
    };
    set: {
        cueFile: string;
        cueForEvent: string;
        serialWorkspaceAsCue: string;
    };
    delete: {
        workspace: string;
    };
    onEv: {
        blockly: {
            toolboxUpdate: string;
            blocksUpdate: string;
            workspaceUpdate: string;
            workspaceListUpdate: string;
        };
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
    DeviceLayout: string;
};
export type CtrlIpcApi = typeof ctrlIpcApi;
export type StoreKeys = typeof storeKeys;
