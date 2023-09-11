/// <unreference types="vite-electron-plugin/electron-env" />

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
    // VSCODE_DEBUG?: 'true'

    //---------- Folders
    RESOURCES: string
    APPROOT: string
    DIST: string
    DIST_NODE: string
    DIST_RENDERER: string
    ASSETS: string

    /** /dist/client (packaged) or /public (during dev) */
    PUBLIC: string
    DATA: string

    /** AppData */
    APPDATA: string
    PLUGINS: string
    CUES: string
    TEMP: string

    //---------- Constants
    NAMESPACE:string
    APP_VERSION:string
    
    //---------- Objects
    MakeShiftSerializedApi: string
  }
}
