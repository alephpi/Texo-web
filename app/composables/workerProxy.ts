import {
  WorkerStatus,
  type WorkerOutputEvent
} from './types'

export class WorkerProxy<T = string> {
  private _ready = false
  private _worker: Worker
  private _callbacks = new Map<
    WorkerStatus,
    Set<{ handler: (data?: WorkerOutputEvent<T>) => void, key?: string }>
  >()

  constructor(worker: Worker) {
    this._worker = worker
    this._addEventListener()
  }

  public get ready() {
    return this._ready
  }

  public get worker() {
    return this._worker
  }

  private _addEventListener() {
    this._worker.addEventListener(
      'message',
      (event: MessageEvent<WorkerOutputEvent<T>>) => {
        if (event.data.status === WorkerStatus.Ready) {
          this._ready = true
        }
        const callbacks = this._callbacks.get(event.data.status)
        if (callbacks) {
          for (const callback of callbacks) {
            if (
              (WorkerStatus.Result === event.data.status
                || WorkerStatus.Error === event.data.status
                || WorkerStatus.Update === event.data.status)
              && event.data.key
              && callback.key !== event.data.key
            ) {
              continue
            }
            callback.handler(event.data)
            if (
              event.data.status === WorkerStatus.Ready
              || event.data.status === WorkerStatus.Error
              || event.data.status === WorkerStatus.Done
              || event.data.status === WorkerStatus.Result
            ) {
              callbacks.delete(callback)
            }
          }
        }
      }
    )
  }

  public on(
    status: WorkerStatus,
    callback: {
      handler: (data?: WorkerOutputEvent<T>) => void
      key?: string
    }
  ) {
    if (!this._callbacks.has(status)) {
      this._callbacks.set(status, new Set())
    }
    this._callbacks.get(status)?.add(callback)
  }

  public off(
    status: WorkerStatus,
    callback: {
      handler: (data?: WorkerOutputEvent<T>) => void
      key?: string
    } | string
  ) {
    if (!this._callbacks.has(status)) {
      return
    }
    if (typeof callback === 'string') {
      this._callbacks.get(status)?.forEach((item) => {
        if (item.key === callback) {
          this._callbacks.get(status)?.delete(item)
        }
      })
      return
    }
    this._callbacks.get(status)?.delete(callback)
  }

  public teminate() {
    this._worker.terminate()
    this._callbacks.clear()
  }
}
