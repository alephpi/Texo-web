import {
  PreTrainedTokenizer,
  Tensor,
  VisionEncoderDecoderModel,
  cat,
  env,
  type ProgressInfo
} from '@huggingface/transformers'
import { preprocessImg } from './imageProcessor'
import {
  OCRAction,
  type OCRInputEvent,
  type ModelConfig,
  WorkerStatus
} from '../types'

env.allowLocalModels = false
env.backends.onnx.wasm!.proxy = true

let model: VisionEncoderDecoderModel
let tokenizer: PreTrainedTokenizer
let isInitialized = false

const init = async (
  model_config: ModelConfig,
  progress_callback: (data: ProgressInfo) => void
) => {
  if (isInitialized) {
    return
  }

  if (model_config.env_config) {
    env.remoteHost = model_config.env_config?.remoteHost
    env.remotePathTemplate = model_config.env_config?.remotePathTemplate
  }

  const modelName = model_config.modelName

  model = await VisionEncoderDecoderModel.from_pretrained(modelName, {
    dtype: 'fp32',
    progress_callback: progress_callback
  })

  tokenizer = await PreTrainedTokenizer.from_pretrained(modelName)

  isInitialized = true

  // 通知主线程初始化完成
  globalThis.postMessage({
    status: WorkerStatus.Ready
  })
}

const predict = async (imageFile: File) => {
  if (!isInitialized) {
    throw new Error('Model not initialized. Please call init first.')
  }

  const { image, array } = await preprocessImg(imageFile)
  const tensor = new Tensor('float32', array, [1, 1, 384, 384])
  const pixel_values = cat([tensor, tensor, tensor], 1)
  const outputs = await model.generate({ inputs: pixel_values })
  const text = tokenizer.batch_decode(outputs, { skip_special_tokens: true })[0]

  return text
}

// 监听来自主线程的消息
self.onmessage = async (event: MessageEvent<OCRInputEvent>) => {
  if (event.data.action === OCRAction.Init) {
    try {
      await init(event.data.model_config, globalThis.postMessage)
    } catch (error) {
      globalThis.postMessage({
        status: WorkerStatus.Error,
        error,
        key: ''
      })
    }
  }

  if (event.data.action === OCRAction.Predict) {
    try {
      const output = await predict(event.data.image)
      globalThis.postMessage({
        status: WorkerStatus.Result,
        output,
        key: event.data.key
      })
    } catch (error) {
      globalThis.postMessage({
        status: WorkerStatus.Error,
        error,
        key: event.data.key
      })
    }
  }
}
