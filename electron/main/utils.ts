import { LogMessage } from "@eos-makeshift/serial"
import { LogLevel } from "@eos-makeshift/msg"
import { ctrlIpcApi } from "../ipcApi"
import { mainWindow } from "./index"

export function ctrlLogger(loggable: string, logLevel: LogLevel) {
  const data = {
    level: logLevel,
    message: loggable.toString(),
    buffer: Buffer.from(loggable.toString())
  } as LogMessage
  if (mainWindow !== null) {
    mainWindow.webContents.send(ctrlIpcApi.onEv.terminal.data, data)
  }
  console.log(loggable)
}