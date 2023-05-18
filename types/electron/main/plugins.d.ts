export declare const plugins: {};
export declare function initPlugins(): Promise<void>;
export declare function installPlugin(): Promise<void>;
export declare class Plugin {
    constructor(pluginId: string);
}
