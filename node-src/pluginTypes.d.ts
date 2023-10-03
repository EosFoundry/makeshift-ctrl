import { LogLevel } from "@eos-makeshift/msg"
export { WorkerAPI } from './plugin/worker'


export type RequestMessage<API> = {
  method: API,
  params?: any[]
}

export interface RpcRequest<API> extends RequestMessage<API> {
  id: string,
}



export interface RpcSuccessResponse {
  result: any,
  id: string,
}

export interface RpcErrorResponse {
  error: Error,
  data?: any,
  id: string,
}

export type RpcResponse = RpcSuccessResponse | RpcErrorResponse;

export interface WorkerNotification {
  logLevel: LogLevel,
  message: any
}

export type RpcRequestHeap<API> = {
  [index: string]: RpcRequest<API>
}

export type ResponseHeap = {
  [index: string]: RpcResponse
}
