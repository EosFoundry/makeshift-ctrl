/// <reference types="node" />
/// <reference types="node" />
import * as fs from 'node:fs/promises';
import { Maybe } from 'purify-ts';
import { PathLike } from 'fs';
/**
 * Reads the contents of the file at the specified path, assuming it contains a JSON object.
 * If the file is locked, returns Nothing and logs an error message.
 * @param filePath - The path to the file to read.
 * @returns A Promise that resolves to a Maybe containing the parsed JSON object, or Nothing if the file is locked or an error occurs.
 */
declare function readJson(filePath: PathLike | fs.FileHandle): Promise<Maybe<any>>;
/**
 * Reads the contents of the file at the specified path, assuming it is a UTF-8 encoded text file.
 * If the file is locked, returns Nothing and logs an error message.
 * @param filePath - The path to the file to read.
 * @returns A Promise that resolves to a Maybe containing the contents of the file, or Nothing if the file is locked or an error occurs.
 */
declare function readFile(filePath: PathLike | fs.FileHandle): Promise<Maybe<string>>;
/**
 * Writes the given JSON object to the file at the specified path.
 * If the file is locked, returns false and logs an error message.
 * @param filePath - The path to the file to write to.
 * @param contents - The JSON object to write to the file.
 * @returns A Promise that resolves to true if the write was successful, or false otherwise.
 */
declare function writeJson(filePath: PathLike, contents: object): Promise<boolean>;
/**
 * Writes the given string contents to the file at the specified path.
 * If the file is locked, returns false and logs an error message.
 * @param filePath - The path to the file to write to.
 * @param contents - The contents to write to the file.
 * @returns A Promise that resolves to true if the write was successful, or false otherwise.
 */
declare function writeFile(filePath: PathLike | fs.FileHandle, contents: string): Promise<boolean>;
export declare function unlink(path: any): Promise<boolean>;
export declare const Fileio: {
    readFile: typeof readFile;
    readJson: typeof readJson;
    writeFile: typeof writeFile;
    writeJson: typeof writeJson;
    unlink: typeof unlink;
};
export {};
