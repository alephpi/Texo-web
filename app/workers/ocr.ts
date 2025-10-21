import type { PreTrainedModel, Tensor } from '@huggingface/transformers'
import { env, AutoTokenizer, VisionEncoderDecoderModel } from '@huggingface/transformers'

env.backends.onnx.wasm!.numThreads = 1
// 禁用本地模型
env.allowLocalModels = false

class OCRSingleton {
  private static instance: OCRSingleton
  private modelCache: Map<string, Promise<PreTrainedModel>> = new Map()

  private constructor() {}

  public static getInstance(): OCRSingleton {
    if (!OCRSingleton.instance) {
      OCRSingleton.instance = new OCRSingleton()
    }
    return OCRSingleton.instance
  }

  public async loadModel(modelName: string): Promise<PreTrainedModel> {
    if (!this.modelCache.has(modelName)) {
      const preTrainedModelPromise = VisionEncoderDecoderModel.from_pretrained(
        modelName,
        { dtype: 'fp32' }
      ) as Promise<PreTrainedModel>
      this.modelCache.set(modelName, preTrainedModelPromise)
    }
    return this.modelCache.get(modelName)!
  }

  public getLoadedModel(modelName: string): Promise<PreTrainedModel> | null {
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
): Promise<PreTrainedModel> {
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
  const model = await singleton.loadModel(modelName)

  const outputs = await model.generate({ inputs: pixel_values })

  return outputs
}
