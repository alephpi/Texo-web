import type { TranslationPipeline } from '@huggingface/transformers'
import { env, pipeline } from '@huggingface/transformers'

env.backends.onnx.wasm!.numThreads = 1
// 禁用本地模型
env.allowLocalModels = false

class TranslationSingleton {
  private static instance: TranslationSingleton
  private pipelineCache: Map<string, Promise<TranslationPipeline>> = new Map()

  private constructor() {}

  public static getInstance(): TranslationSingleton {
    if (!TranslationSingleton.instance) {
      TranslationSingleton.instance = new TranslationSingleton()
    }
    return TranslationSingleton.instance
  }

  public async loadModel(modelName: string): Promise<TranslationPipeline> {
    if (!this.pipelineCache.has(modelName)) {
      const pipelinePromise = pipeline(
        'translation',
        modelName
      ) as Promise<TranslationPipeline>
      this.pipelineCache.set(modelName, pipelinePromise)
    }
    return this.pipelineCache.get(modelName)!
  }

  public getLoadedModel(modelName: string): Promise<TranslationPipeline> | null {
    return this.pipelineCache.get(modelName) || null
  }
}

/**
 * 加载翻译模型
 * @param modelName 模型名称，默认为 'Xenova/nllb-200-distilled-600M'
 * @returns 翻译模型 Pipeline
 */
export async function loadModel(
  modelName: string = 'Xenova/nllb-200-distilled-600M'
): Promise<TranslationPipeline> {
  const singleton = TranslationSingleton.getInstance()
  return await singleton.loadModel(modelName)
}

/**
 * 执行翻译
 * @param input 待翻译文本
 * @param options 翻译选项
 * @returns 翻译结果
 */
export async function translate(
  input: string,
  options: {
    modelName?: string
    src_lang?: string
    tgt_lang?: string
  } = {}
) {
  const {
    modelName = 'Xenova/nllb-200-distilled-600M',
    src_lang = 'eng_Latn',
    tgt_lang = 'spa_Latn'
  } = options

  const singleton = TranslationSingleton.getInstance()
  const translator = await singleton.loadModel(modelName)

  const translation = await translator(input, {
    src_lang,
    tgt_lang
  })

  return translation
}
