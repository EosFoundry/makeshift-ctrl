import stylelint from 'stylelint';
export declare const DefaultTheme: {
    cssClass: string;
    isLight: boolean;
    cssRaw: string;
};
export type Theme = {
    cssClass: string;
    isLight: boolean;
    cssRaw: string;
};
/**
 *
 *
 * @param path relative path to css file
 * @returns {css: string, linterResult: stylelint.LinterResult, error: boolean, errorObj: any}
 */
export declare function loadTheme(path: string): Promise<{
    theme: Theme;
    linterResult: stylelint.LinterResult;
    error: boolean;
    errorObj: any;
}>;
export declare function getThemeName(themeCss: string): Promise<string>;
export declare function checkThemeBrightness(themeCss: string): Promise<boolean>;
