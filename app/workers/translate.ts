// workers/translate.ts
import type { TranslationPipeline } from '@xenova/transformers'
import { pipeline } from '@xenova/transformers'

class ModelManager {
  private static instance: ModelManager
  private models: Map<string, Promise<TranslationPipeline>> = new Map()
  private loadingStatus: Map<string, 'idle' | 'loading' | 'loaded' | 'error'> = new Map()

  private constructor() {}

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager()
    }
    return ModelManager.instance
  }

  public getLoadingStatus(repo: string): 'idle' | 'loading' | 'loaded' | 'error' {
    return this.loadingStatus.get(repo) || 'idle'
  }

  public isModelLoaded(repo: string): boolean {
    return this.loadingStatus.get(repo) === 'loaded'
  }

  public async loadModel(repo: string): Promise<void> {
    if (this.models.has(repo)) {
      return
    }

    this.loadingStatus.set(repo, 'loading')
    console.log(`Loading model: ${repo}`)

    try {
      const modelPromise = pipeline('translation', repo) as Promise<TranslationPipeline>
      this.models.set(repo, modelPromise)
      await modelPromise
      this.loadingStatus.set(repo, 'loaded')
    } catch (error) {
      this.loadingStatus.set(repo, 'error')
      this.models.delete(repo)
      throw error
    }
  }

  public async getModel(repo: string): Promise<TranslationPipeline> {
    if (!this.models.has(repo)) {
      throw new Error(`Model ${repo} not loaded. Please call loadModel first.`)
    }
    return this.models.get(repo)!
  }
}

// 导出加载函数 - 绑定到加载按钮
export async function loadTranslationModel(repo: string) {
  const manager = ModelManager.getInstance()
  await manager.loadModel(repo)
}

// 导出状态检查函数
export function getModelStatus(repo: string) {
  const manager = ModelManager.getInstance()
  return {
    status: manager.getLoadingStatus(repo),
    isLoaded: manager.isModelLoaded(repo)
  }
}

// 导出翻译函数 - 要求模型已加载
export async function translate(
  input: string,
  repo: string,
  srcLang: string,
  tgtLang: string
) {
  const manager = ModelManager.getInstance()

  if (!manager.isModelLoaded(repo)) {
    throw new Error(`Model ${repo} is not loaded. Please load the model first.`)
  }

  const translator = await manager.getModel(repo)
  const translation = await translator(input, {
    src_lang: srcLang,
    tgt_lang: tgtLang
  })

  return translation
}
