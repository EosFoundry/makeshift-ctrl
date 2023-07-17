import { LogLevel } from "@eos-makeshift/msg";
import { Maybe } from 'purify-ts/Maybe';
export declare function ctrlLogger(loggable: string, logLevel: LogLevel): void;
export declare function loadJsonFile(filePath: string): Promise<Maybe<any>>;
