import type { TranslationPipeline } from '@huggingface/transformers'
import { env, pipeline } from '@huggingface/transformers'

env.backends.onnx.wasm.numThreads = 1
// 禁用本地模型
env.allowLocalModels = false

class TranslationSingleton {
  private static instance: TranslationSingleton
  private pipelinePromise: Promise<TranslationPipeline> | null = null

  private constructor() {}

  public static getInstance(): TranslationSingleton {
    if (!TranslationSingleton.instance) {
      TranslationSingleton.instance = new TranslationSingleton()
    }
    return TranslationSingleton.instance
  }

  public async getTranslator(): Promise<TranslationPipeline> {
    if (!this.pipelinePromise) {
      this.pipelinePromise = pipeline(
        'translation',
        'Xenova/nllb-200-distilled-600M'
      ) as Promise<TranslationPipeline>
    }
    return this.pipelinePromise
  }
}

export async function translate(input: string) {
  const singleton = TranslationSingleton.getInstance()
  const translator = await singleton.getTranslator()

  const translation = await translator(input, {
    tgt_lang: 'spa_Latn',
    src_lang: 'eng_Latn'
  })

  return translation
}
