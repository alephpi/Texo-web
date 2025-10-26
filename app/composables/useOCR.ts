import { type Ref, computed, ref, unref, onBeforeUnmount, watch, onMounted } from 'vue'
import { OCR } from './OCR'
import { type WorkerProgressEvent, WorkerStatus, type ModelConfig } from './types'

let globalOCRModel: OCR
const ready = ref(false)

const useOCR = (config?: {
  global?: boolean
}) => {
  if (!globalOCRModel && config?.global) {
    globalOCRModel = new OCR()
  }

  // OCR instance
  const OCRModel = config?.global ? globalOCRModel : new OCR()

  // progress
  const progress = ref<Record<string, number>>({})
  const onProgress = (data: WorkerProgressEvent) => {
    if (data.progress === 100) {
      delete progress.value[data.file]
      return
    }
    progress.value[data.file] = data.progress
  }

  // ready
  const isReady = ref(OCRModel.ready)
  OCRModel.on(WorkerStatus.Ready, {
    handler: () => {
      isReady.value = true
    }
  })

  const init = (model_config: ModelConfig) => {
    if (ready.value) {
      return { progress, promise: Promise.resolve() }
    }
    const promise = OCRModel.init(model_config, { onProgress })
    return { progress, promise }
  }

  const predict = (
    file: Ref<File | undefined> | File | undefined,
    {
      immediate = true
    }: { immediate?: boolean } = {}
  ) => {
    const result = ref<string>()
    const isLoading = ref(false)
    const error = ref<Error>()
    const isError = computed(() => !!error.value)
    const promise = ref<Promise<string | void>>()

    let controller: AbortController | undefined
    const execute = (fileToProcess?: File) => {
      const source = fileToProcess ?? unref(file)
      error.value = undefined
      if (!source) {
        promise.value = Promise.resolve()
        result.value = undefined
        return promise.value
      }
      if (controller) {
        controller.abort()
      }
      controller = new AbortController()
      isLoading.value = true
      promise.value = OCRModel
        .predict(source, {
          onProgress,
          signal: controller.signal
        })
        .then((data) => {
          result.value = data.output
          return data.output
        })
        .catch((e) => {
          error.value = e
        })
        .finally(() => {
          isLoading.value = false
          controller = undefined
        })
      return promise.value
    }

    // watch file changes
    watch(() => unref(file), execute)

    if (immediate) {
      onMounted(() => {
        execute()
      })
    }

    onBeforeUnmount(() => {
      if (controller) {
        controller.abort()
      }
    })

    return { result, isLoading, error, isError, isReady, promise, progress, execute }
  }

  onBeforeUnmount(() => {
    if (!config?.global) {
      OCRModel.teminate()
    }
  })

  return { init, predict, ready, isReady, progress }
}

export { useOCR }
