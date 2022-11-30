/// <reference types="vite-electron-plugin/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬ dist
     * │ ├─┬ electron
     * │ │ ├─┬ main
     * │ │ │ └── index.js
     * │ │ └─┬ preload
     * │ │   └── index.js
     * │ ├── index.html
     * │ ├── ...other-static-files-from-public
     * │
     * ```
     */
    VSCODE_DEBUG?: 'true'

    //---------- Folders
    INSTALL_ROOT: string
    APPROOT: string
    DIST: string
    DIST_ELECTRON: string
    DIST_CLIENT: string
    ASSETS: string
    /** /dist/client (packaged) or /public (during dev) */
    PUBLIC: string

    /** AppData */
    APPDATA: string
    PLUGINS: string
    CUES: string
    TEMP: string

    //---------- Constants
    NAMESPACE:string
    
    //---------- Objects
    MakeShiftSerializedApi: string
  }
}
