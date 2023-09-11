import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as lockfile from 'proper-lockfile'
import { Maybe, Nothing } from 'purify-ts'

import { Msg, LogLevel } from '@eos-makeshift/msg'
import { ctrlLogger } from './utils'
import { existsSync, PathLike } from 'fs'
import { ensureDir, ensureFile } from 'fs-extra'


// Create Loggers
const msgen = new Msg({ host: 'FileIO', logLevel: 'debug' })
msgen.logger = ctrlLogger
const log = msgen.getLevelLoggers()

/**
 * Reads the contents of the file at the specified path, assuming it contains a JSON object.
 * If the file is locked, returns Nothing and logs an error message.
 * @param filePath - The path to the file to read.
 * @returns A Promise that resolves to a Maybe containing the parsed JSON object, or Nothing if the file is locked or an error occurs.
 */
async function readJson(filePath: PathLike | fs.FileHandle): Promise<Maybe<any>> {
  const maybeContents = await readFile(filePath)
  return maybeContents.map(contents => JSON.parse(contents))
}

/**
 * Reads the contents of the file at the specified path, assuming it is a UTF-8 encoded text file.
 * If the file is locked, returns Nothing and logs an error message.
 * @param filePath - The path to the file to read.
 * @returns A Promise that resolves to a Maybe containing the contents of the file, or Nothing if the file is locked or an error occurs.
 */
async function readFile(filePath: PathLike | fs.FileHandle): Promise<Maybe<string>> {
  try {
    // const locked = await lockfile.check(filePath)
    // if (locked) {
    //   log.error(`File ${filePath} is locked while trying to read.`)
    //   return Nothing
    // }

    // const release = await lockfile.lock(filePath)
    const contents = await fs.readFile(filePath, 'utf-8')
    // await release()
    return Maybe.of(contents)
  } catch (e) {
    log.error(`Error reading file ${filePath}: ${e}`)
    return Nothing
  }
}

/**
 * Writes the given JSON object to the file at the specified path.
 * If the file is locked, returns false and logs an error message.
 * @param filePath - The path to the file to write to.
 * @param contents - The JSON object to write to the file.
 * @returns A Promise that resolves to true if the write was successful, or false otherwise.
 */
async function writeJson(filePath: PathLike, contents: object) {
  const pathContents = path.parse(filePath.toString())
  if (pathContents.ext === '.json') {
    return writeFile(filePath, JSON.stringify(contents))
  } else {
    log.error(`Error writing JSON to file ${filePath}: file extension is not .json.`)
    return false
  }
}

/**
 * Writes the given string contents to the file at the specified path.
 * If the file is locked, returns false and logs an error message.
 * @param filePath - The path to the file to write to.
 * @param contents - The contents to write to the file.
 * @returns A Promise that resolves to true if the write was successful, or false otherwise.
 */
async function writeFile(filePath: PathLike | fs.FileHandle, contents: string) {

  try {
    await ensureFile(filePath.toString())
    // const locked = await lockfile.check(filePath)
    // if (locked) {
    //   log.error(`File ${filePath} is locked while trying to write.`)
    //   return false
    // }
    // const release = await lockfile.lock(filePath)
    await fs.writeFile(filePath, contents)
    // await release()
    return true
  } catch (e) {
    log.error(`Error writing file ${filePath}: ${e}`)
    return false
  }
}

export async function unlink(path) {
  try {
    log.debug(`Unlinking ${path}`)
    await fs.unlink(path)
    return true
  } catch (e) {
    return false
  }
}

export const Fileio = {
  readFile,
  readJson,
  writeFile,
  writeJson,
  unlink,
}