import type { PreTrainedModel, Tensor } from '@huggingface/transformers'
import { env, PreTrainedTokenizer, VisionEncoderDecoderModel } from '@huggingface/transformers'

env.backends.onnx.wasm!.numThreads = 1
// 禁用本地模型
env.allowLocalModels = false

type OCRModel = {
  model: VisionEncoderDecoderModel
  tokenizer: PreTrainedTokenizer
}

class OCRSingleton {
  private static instance: OCRSingleton
  private modelCache: Map<string, OCRModel> = new Map()

  private constructor() {}

  public static getInstance(): OCRSingleton {
    if (!OCRSingleton.instance) {
      OCRSingleton.instance = new OCRSingleton()
    }
    return OCRSingleton.instance
  }

  public async loadModel(modelName: string) {
    if (!this.modelCache.has(modelName)) {
      const model = await VisionEncoderDecoderModel.from_pretrained(modelName, { dtype: 'fp32' })
      const tokenizer = await PreTrainedTokenizer.from_pretrained(modelName)

      this.modelCache.set(modelName, { model, tokenizer })
    }
    return this.modelCache.get(modelName)!
  }

  public getLoadedModel(modelName: string) {
    return this.modelCache.get(modelName) || null
  }
}

/**
 * 加载翻译模型
 * @param modelName 模型名称，默认为 'alephpi/FormulaNet'
 * @returns OCR PreTrainedModel
 */
export async function loadModel(
  modelName: string = 'alephpi/FormulaNet'
) {
  const singleton = OCRSingleton.getInstance()
  return await singleton.loadModel(modelName)
}

/**
 * @param pixel_values
 * @param options
 * @returns text
 */
export async function ocr(
  pixel_values: Tensor,
  options: {
    modelName?: string
  } = {}
) {
  const {
    modelName = 'alephpi/FormulaNet'
  } = options

  const singleton = OCRSingleton.getInstance()
  const { model, tokenizer } = await singleton.loadModel(modelName)

  const outputs = await model.generate({ inputs: pixel_values })
  const text = tokenizer.batch_decode(outputs, { skip_special_tokens: true })[0]

  return text
}
