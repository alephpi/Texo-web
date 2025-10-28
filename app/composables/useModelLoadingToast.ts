import type { ModelConfig } from './types'

export const useModelLoadingToast = (t, model_config: ModelConfig, progress: Ref<Record<string, Record<string, number>>>, isReady: Ref<boolean>) => {
  const toast = useToast()
  const unifiedProgress = ref({ loaded: 0, total: 0, progress: 0 })
  let toastId = 'model-loading'

  toast.add({
    id: toastId,
    title: t('load_model_from') + ' ' + model_config.env_config?.remoteHost,
    duration: 0
  })

  watch(progress, (record) => {
    let loaded = 0
    let total = 0

    if (Object.keys(record).length === 4) {
      for (const key in record) {
        const info = progress.value[key]
        if (info) {
          total += info.total!
          loaded += info.loaded!
        }
      }

      unifiedProgress.value = { loaded, total, progress: Math.round(100 * loaded / total) }

      if (!isReady.value && total > 0) {
        toastId = 'model-loading'
        toast.update(toastId, {
          title: t('load_model_from') + ' ' + model_config.env_config?.remoteHost,
          description: `${(loaded / (1024 * 1024)).toFixed(2)} MB / ${(total / (1024 * 1024)).toFixed(2)} MB (${unifiedProgress.value.progress}%)`,
          duration: 0
        })
      }
    }
  }, { deep: true })

  watch(isReady, (ready) => {
    if (ready) {
      toast.update(toastId, {
        title: t('model_loaded'),
        description: t('you_can_upload_image_now'),
        duration: 0
      })
    }
  })

  return { unifiedProgress }
}
