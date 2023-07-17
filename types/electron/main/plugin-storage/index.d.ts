import { Maybe } from 'purify-ts/Maybe';
declare const dummy: {
    string: string;
    array: (string | number)[];
    object: {
        dummy: string;
    };
    boolean: boolean;
    number: number;
    undefined: any;
};
export declare const Storage: {
    get: (key: keyof typeof dummy) => Maybe<string | number | boolean | object | any[]>;
    set: (key: string, value: any) => {
        key: string;
        value: any;
        error: Maybe<Error>;
    };
};
export declare function setStoredVariable(): void;
export {};
