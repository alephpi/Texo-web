// composables/useTranslation.ts
import { ref } from 'vue'
import { loadTranslationModel, getModelStatus, translate } from '~/workers/translate'

export function useTranslation(modelRepo: string) {
  const status = ref<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const error = ref<Error | null>(null)

  const loadModel = async () => {
    try {
      status.value = 'loading'
      error.value = null
      await loadTranslationModel(modelRepo)
      status.value = 'loaded'
    } catch (e) {
      error.value = e as Error
      status.value = 'error'
      throw e
    }
  }

  const translateText = async (
    input: string,
    srcLang: string,
    tgtLang: string
  ) => {
    if (status.value !== 'loaded') {
      throw new Error('Model not loaded')
    }
    return await translate(input, modelRepo, srcLang, tgtLang)
  }

  // 初始化时检查状态
  const checkStatus = () => {
    const modelStatus = getModelStatus(modelRepo)
    status.value = modelStatus.status
  }

  return {
    status,
    error,
    loadModel,
    translateText,
    checkStatus
  }
}
