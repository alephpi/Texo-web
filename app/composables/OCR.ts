import {
  OCRAction,
  WorkerStatus,
  type WorkerOutputEvent,
  type WorkerProgressEvent,
  type WorkerReadyEvent,
  type OCRResult,
  type WorkerResultEvent,
  type ModelConfig
} from './types'
import { WorkerProxy } from './workerProxy'
import OCRWorker from './workers/ocr?worker'

export class OCR extends WorkerProxy<OCRResult> {
  private _initialized = false

  constructor() {
    super(new OCRWorker())
  }

  public async init(
    model_config: ModelConfig,
    config?: {
      onProgress?: (progress: WorkerProgressEvent) => void
      signal?: AbortSignal
    }
  ) {
    return new Promise<WorkerReadyEvent>((resolve) => {
      if (this.ready) {
        return resolve({
          status: WorkerStatus.Ready
        })
      }
      // add progress callback
      const progressCallback = {
        handler: (data?: WorkerOutputEvent<OCRResult>) => {
          if (data?.status === WorkerStatus.Progress) {
            config?.onProgress?.(data)
          }
        }
      }
      this.on(WorkerStatus.Progress, progressCallback)
      config?.signal?.addEventListener('abort', () => {
        this.off(WorkerStatus.Progress, progressCallback)
      })

      // add ready callback
      this.on(WorkerStatus.Ready, {
        handler: (data) => {
          if (data?.status === WorkerStatus.Ready) {
            resolve(data)
            this.off(WorkerStatus.Progress, progressCallback)
          }
        }
      })

      // send init request
      if (!this._initialized) {
        this.worker.postMessage({
          action: OCRAction.Init,
          model_config
        })
        this._initialized = true
      }
    })
  }

  public async predict(
    image: File,
    config?: {
      onProgress?: (progress: WorkerProgressEvent) => void
      signal?: AbortSignal
    }
  ) {
    return new Promise<WorkerResultEvent<OCRResult>>((resolve, reject) => {
      const key = crypto.randomUUID()

      // add result callback
      this.on(
        WorkerStatus.Result,
        {
          handler: (data) => {
            if (data?.status === WorkerStatus.Result) {
              resolve(data)
            }
          },
          key
        }
      )

      // add error callback
      this.on(
        WorkerStatus.Error,
        {
          handler: (data) => {
            if (data?.status === WorkerStatus.Error) {
              reject(data.error)
            }
          },
          key
        }
      )

      config?.signal?.addEventListener('abort', () => {
        this.off(WorkerStatus.Result, key)
        this.off(WorkerStatus.Error, key)
      })

      this.worker.postMessage({
        action: OCRAction.Predict,
        image,
        key
      })
    })
  }
}
