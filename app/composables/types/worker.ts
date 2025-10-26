export enum WorkerStatus {
  Initiate = 'initiate',
  Progress = 'progress',
  Done = 'done',
  Ready = 'ready',
  Result = 'result',
  Error = 'error',
  Update = 'update'
}

export type WorkerDoneEvent = {
  status: WorkerStatus.Done
}

export type WorkerReadyEvent = {
  status: WorkerStatus.Ready
}

export type WorkerProgressEvent = {
  status: WorkerStatus.Progress
  file: string
  name: string
  loaded: number
  progress: number
  total: number
  task: string
}

export type WorkerInitiateEvent = {
  status: WorkerStatus.Initiate
  file: string
  name: string
}

export type WorkerErrorEvent = {
  status: WorkerStatus.Error
  error: Error
  key: string
}

export type WorkerResultEvent<T = string> = {
  status: WorkerStatus.Result
  output: T
  key: string
}

export type WorkerUpdateEvent<T = string> = {
  status: WorkerStatus.Update
  output: T
  key: string
}

export type WorkerOutputEvent<T = string> = WorkerDoneEvent | WorkerReadyEvent | WorkerProgressEvent | WorkerInitiateEvent | WorkerErrorEvent | WorkerResultEvent<T> | WorkerUpdateEvent<T>
