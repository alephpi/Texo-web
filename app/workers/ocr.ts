import { cat, env, PreTrainedTokenizer, VisionEncoderDecoderModel, Tensor } from '@huggingface/transformers'

env.backends.onnx.wasm!.numThreads = 1
env.allowLocalModels = true

type OCRModel = {
  model: VisionEncoderDecoderModel
  tokenizer: PreTrainedTokenizer
}

export type ModelConfig = {
  modelName: string
  env_config?: {
    remoteHost: string
    remotePathTemplate: string
  }
}

export class OCRModelManager {
  private static instance: OCRModelManager
  private modelCache: Map<string, OCRModel> = new Map()

  private constructor() {}

  public static getInstance(): OCRModelManager {
    if (!OCRModelManager.instance) {
      OCRModelManager.instance = new OCRModelManager()
    }
    return OCRModelManager.instance
  }

  public async loadModel(modelName: string) {
    if (!this.modelCache.has(modelName)) {
      const model = await VisionEncoderDecoderModel.from_pretrained(modelName, { dtype: 'fp32' })
      const tokenizer = await PreTrainedTokenizer.from_pretrained(modelName)

      this.modelCache.set(modelName, { model, tokenizer })
    }
  }

  public async getModel(modelName: string): Promise<OCRModel> {
    return this.modelCache.get(modelName)!
  }
}

/**
 * 加载翻译模型
 * @param modelName 模型名称，默认为 'alephpi/FormulaNet'
 * @returns OCR PreTrainedModel
 */
export async function loadModel(
  model_config: ModelConfig
) {
  const manager = OCRModelManager.getInstance()
  const { modelName, env_config } = model_config
  if (env_config) {
    env.remoteHost = env_config.remoteHost
    env.remotePathTemplate = env_config.remotePathTemplate
  }
  console.log(modelName)
  await manager.loadModel(modelName)
  // cannot return a class instance from worker to main thread, return a string instead
  return modelName
}

/**
 * @param pixel_values
 * @param options
 * @returns text
 */
export async function ocr(
  imageArray: Float32Array,
  modelName: string
) {
  const ocrModel = await OCRModelManager.getInstance().getModel(modelName)
  const tensor = new Tensor('float32', imageArray, [1, 1, 384, 384])
  const pixel_values = cat([tensor, tensor, tensor], 1)
  const outputs = await ocrModel.model.generate({ inputs: pixel_values })
  const text = ocrModel.tokenizer.batch_decode(outputs, { skip_special_tokens: true })[0]
  return text
}
