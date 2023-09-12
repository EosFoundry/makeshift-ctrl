export const ctrlIpcApi = {
  test: 'mkshft-test',
  call: {
    openCueFolder: 'shell-openCueFolder',
    runCue: 'mkshft-runCue',
    fetchBlocklyToolbox: 'blockly-fetch-toolbox',
    fetchBlocklyBlocks: 'blockly-fetch-blocks',
    fetchBlocklyDefaultWorkspace: 'blockly-fetch-defaultWorkspace',
  },
  get: {
    deviceEvents: 'mkshft-get-device-events',
    serialEvents: 'mkshft-get-serial-events',
    hardwareDescriptors: 'mkshft-get-hardware-descriptors',
    eventsAsList: 'mkshft-get-events-list',
    connectedDevices: 'mkshft-get-connectedDevices',
    logRank: 'mkshft-get-logRank',
    clientSize: 'window-get-size',
    allCues: 'cue-get-all',
    allBlocklySerialWorkspaceNames: 'blockly-get-all-serialWorkspace-names',
    blocklyToolbox: 'blockly-get-toolbox',
    blocklySerialWorkspace: 'blockly-get-serialWorkspace',
    blockGenerator: 'blockly-get-blockGenerator',
    cuesAttachedToEvent: 'cue-get-attachedToEvent',
    cueById: 'cue-get-byId',
    cueByFolder: 'cue-get-byFolder',
    defaultTheme: 'theme-get-default',
    themeFromPath: 'theme-get-fromPath',
  },
  set: {
    cueFile: 'mkshft-set-cueFile',
    cueForEvent: 'mkshft-set-cueForEvent',
    serialWorkspaceAsCue: 'mkshft-set-serialWorkspaceAsCue',
  },
  delete: {
    workspace: 'blockly-delete-workspace',
  },
  onEv: {
    app: {
      updateAvailable: 'mkshft-ev-app-updateAvailable',
    },
    blockly: {
      toolboxUpdate: 'blockly-toolbox-sync',
      blocksUpdate: 'blockly-blocks-sync',
      workspaceUpdate: 'blockly-workspace-sync',
      workspaceListUpdate: 'blockly-workspaceList-sync',
    },
    cue: {
      added: 'cue-added',
      changed: 'cue-changed',
      removed: 'cue-deleted',
    },
    device: {
      connected: 'mkshft-ev-device-connected',
      disconnected: 'mkshft-ev-device-disconnected',
    },
    terminal: {
      data: 'mkshft-ev-term-data'
    },
  },
}


export const storeKeys = {
  UuidNamespace: 'uuidNamespace',
  MainWindowState: 'mainWindowState',
  DeviceLayout: 'deviceLayout'
}

export type CtrlIpcApi = typeof ctrlIpcApi
export type StoreKeys = typeof storeKeys