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
    get: (key: keyof typeof dummy) => any;
    set: (key: string, value: any) => void;
};
export {};
