import { LogMessage } from "@eos-makeshift/serial"
import { LogLevel } from "@eos-makeshift/msg"
import { ctrlIpcApi } from "../ipcApi"
import { getMainWindow } from "./index"
import { readFileSync } from "node:fs"
import { readFile } from 'node:fs/promises'
import { Maybe, Nothing } from 'purify-ts/Maybe'

export function ctrlLogger(loggable: string, logLevel: LogLevel) {
  const data = {
    level: logLevel,
    message: loggable.toString(),
    buffer: Buffer.from(loggable.toString())
  } as LogMessage
  const mainWindow = getMainWindow()
  mainWindow.map(mainWindow => {
    mainWindow.webContents.send(ctrlIpcApi.onEv.terminal.data, data)
  })
  console.log(loggable)
}

export async function loadJsonFile(filePath: string) {
  try {
    const fileContents = await readFile(filePath, 'utf8');
    return Maybe.fromNullable(JSON.parse(fileContents))
  } catch (e) {
    return Nothing
  }
}