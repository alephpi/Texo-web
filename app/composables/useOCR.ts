import { ref } from 'vue'
import { OCR } from './OCR'
import { type WorkerProgressEvent, WorkerStatus, type ModelConfig } from './types'

// global singleton
let OCRModel: OCR

const useOCR = () => {
  if (!OCRModel) {
    OCRModel = new OCR()
  }

  const progress = ref<Record<string, Record<string, number>>>({})
  const onProgress = (data: WorkerProgressEvent) => {
    // console.log(data)
    progress.value[data.file] = { loaded: data.loaded, total: data.total }
  }
  // ready
  const isReady = ref(OCRModel.ready)
  OCRModel.on(WorkerStatus.Ready, {
    handler: () => {
      isReady.value = true
    }
  })

  const init = (model_config: ModelConfig) => {
    if (isReady.value) {
      return Promise.resolve()
    }
    const promise = OCRModel.init(model_config, { onProgress })
    return promise
  }

  const predict = (image: File) => {
    const result = OCRModel.predict(image, { onProgress })
    return result
  }

  return { init, predict, isReady, progress }
}

export { useOCR }
