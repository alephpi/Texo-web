<script setup lang="ts">
import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { SelectItem } from '@nuxt/ui'
import type { ProgressInfo } from '@huggingface/transformers'
import type { ModelConfig } from '../composables/types'

const { t } = useI18n()

const latexCode = ref('')
const toast = useToast() // 用于显示复制成功提示

const renderedLatex = computed(() => {
  if (!latexCode.value) {
    return { renderResult: '', errorMessage: '' }
  }

  const renderResult = katex.renderToString(latexCode.value, {
    throwOnError: false,
    displayMode: true
  })
  // 创建临时 DOM 节点
  const container = document.createElement('div')
  container.innerHTML = renderResult

  // 查找 katex-error 节点
  const errorSpan = container.querySelector('.katex-error')

  // 提取 title 属性
  const errorMessage = errorSpan?.getAttribute('title')
  return { renderResult, errorMessage }
})

// 模型选项
const modelOption = ref('texo-transfer-32bit-80MB')
const modelOptions = ref<SelectItem[]> ([
  { label: 'texo-transfer-32bit-80MB', value: 'alephpi/FormulaNet' }
])

// 包裹格式选项
const wrapOptions = ref<SelectItem[]>([
  { label: 'none', value: 'none' },
  { label: '$', value: '$...$' },
  { label: '$$', value: '$$...$$' },
  { label: '\\( \\)', value: '\\(...\\)' },
  { label: '\\[ \\]', value: '\\[...\\]' },
  { label: 'align env', value: '\\begin{align}\n...\n\\end{align}' },
  { label: 'equation env', value: '\\begin{equation}\n...\n\\end{equation}' }
])
const wrapOption = ref<string | null>(null)

async function copy() {
  if (!latexCode.value) {
    toast?.add({
      title: '没有可复制的内容',
      color: 'warning',
      duration: 1000,
      progress: false
    })
    return
  }

  try {
    const wrappedCode = wrapCode(latexCode.value, wrapOption.value)
    await navigator.clipboard.writeText(wrappedCode)

    toast?.add({
      title: '复制成功',
      description: `已复制 ${wrapOption.value} 格式`,
      color: 'success',
      duration: 1000,
      progress: false
    })
  } catch {
    toast?.add({
      title: '复制失败',
      description: '请手动复制',
      color: 'error',
      duration: 1000,
      progress: false
    })
  }
}

// 标准化 LaTeX 代码(应用包裹到文本框)
function format() {
  latexCode.value = formatLatex(latexCode.value)
}

// async function loadTestImage() {
//   const urls = [
//     'assets/test_img/单行公式.png',
//     'assets/test_img/单行公式2.png',
//     'assets/test_img/多行公式.png',
//     'assets/test_img/多行公式2.jpg'
//   ]
//   const randomIndex = Math.floor(Math.random() * urls.length)
//   const response = await fetch(urls[randomIndex])
//   const blob = await response.blob()
//   imageFile.value = new File([blob], 'test-image.jpg', { type: blob.type })
//   console.log(imageFile.value)
// }

const imageFile = ref<File | null>(null)
const imgHolder = ref(null)

function createObjectURL(file: File) {
  return URL.createObjectURL(file)
}

async function onFileChange(newFile: File | null | undefined) {
  if (newFile) {
    imageFile.value = newFile
  }
}

const model_config: ModelConfig = {
  modelName: 'alephpi/FormulaNet',
  env_config: {
    remoteHost: 'https://huggingface.co/',
    remotePathTemplate: '{model}/resolve/{revision}'
  }
}

// 初始化模型

const { init, predict, progress, isReady } = useOCR()
console.log('isReady', isReady.value)

// const unifiedProgress = computed(() => {
//   let total = 0
//   let loaded = 1
//   for (const key in progress.value) {
//     const info = progress.value[key]!
//     total += info.total!
//     loaded += info.loaded!
//   }
//   const result = Math.round(loaded / total)
//   return result
// })
const unifiedProgress = ref({
  loaded: 0,
  total: 0,
  progress: 0
})

watch(progress, (record) => {
  // we have 4 model files (encoder, decoder, config, generation_config) to download, the progress bar should be counted when all files start to download
  let loaded = 0
  let total = 0
  if (Object.keys(record).length === 4) {
    for (const key in record) {
      console.log(key, record[key])
      const info = progress.value[key]!
      total += info.total!
      loaded += info.loaded!
    }
    unifiedProgress.value = { loaded, total, progress: Math.round(100 * loaded / total) }
  }
}, { deep: true })
// const ocr = new OCR()
const load = async (model_config: ModelConfig) => {
  console.log('init')
  await init(model_config)
  console.log('isReady', isReady.value)
}

// 预测
const runOCR = async (imageFile: File) => {
  console.log('predict')
  const result = await predict(imageFile)
  if (result.status === 'result') {
    latexCode.value = result.output || ''
  } else {
    toast.add({
      title: '识别失败',
      description: result.output || '未知错误',
      color: 'error',
      duration: 1000
    })
  }
}
</script>

<template>
  <UPage>
    <UPageBody class="p-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <!-- 左侧栏 -->
        <div class="space-y-4">
          <!-- <UCard>
            <template #header>
              <h2 class="text-xl font-semibold flex items-center gap-2">
                <Icon name="carbon:model" />
                {{ t('model_title') }}
              </h2>
            </template>
            <div class="p-4 flex items-center justify-center text-center rounded-lg">
              <USelect
                v-model="modelOption"
                value-key="value"
                :items="modelOptions"
                size="sm"
                class="w-50"
              />
            </div>
            <UCheckbox label="{{ t('use_web_gpu') }}" />
            <UCheckbox label="{{ t('local_cache') }}" />
            <UButton
              label="{{ t('load_model') }}"
              @click="loadModel(currentModelName)"
            />
            <UButton label="{{ t('remove_cache') }}" />
          </UCard> -->
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold flex items-center gap-2">
                <Icon name="lucide:upload" />
                {{ t('upload_title') }}
              </h2>
            </template>
            <div class="p-4 flex items-center justify-center text-center rounded-lg">
              <div
                id="image-uploader"
                class="w-96 h-96"
              >
                <UFileUpload
                  v-model="imageFile"
                  icon="i-lucide-image"
                  highlight
                  accept="image/*"
                  :label="t('uploader_label')"
                  :description="t('uploader_description')"
                  :ui="{ base: 'w-96 h-96 flex-auto' }"
                  @update:model-value="onFileChange"
                >
                  <template #file-leading="{ file }">
                    <UAvatar
                      id="image-holder"
                      ref="imgHolder"
                      :src="createObjectURL(file)"
                      :ui="{ image: 'object-contain' }"
                      class="size-full rounded-lg"
                    />
                  </template>
                </UFileUpload>
              </div>
            </div>
            <template #footer>
              <div class="flex justify-end">
                <!-- <UBadge
                  :color="hasCached ? 'success' : 'warning'"
                  variant="subtle"
                >
                  {{ hasCached ? '已缓存' : '未缓存' }}
                </UBadge> -->
                <!-- <UButton
                :label="t('load_test_image')"
                @click="loadTestImage"
              /> -->
                <!-- <UCheckbox
                  v-model="use_ms_hub"
                  :label="t('use_ms_hub')"
                  :description="t('is_cn_mainland')"
                /> -->

                <div
                  class="space-y-4 p-4"
                >
                  <div v-if="unifiedProgress.total !== 0">
                    <span> Loading model </span>
                    <UProgress
                      :model-value="unifiedProgress.progress"
                      status
                      size="sm"
                    />
                    <span class="text-sm text-gray-500">{{ (unifiedProgress.loaded / (1024 * 1024)).toFixed(2) }} M / {{ (unifiedProgress.total / (1024 * 1024)).toFixed(2) }} M</span>
                  </div>
                  <UButton
                    :label="t('load')"
                    @click="load(model_config)"
                  />
                  <UButton
                    :disabled="!imageFile"
                    :label="t('recognize')"
                    @click="runOCR(imageFile!)"
                  />
                </div>
              </div>
            </template>
          </UCard>
        </div>

        <!-- 右侧栏 -->
        <div class="space-y-4">
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold flex items-center gap-2">
                <Icon name="carbon:view" />
                {{ t('preview_title') }}
              </h2>
            </template>

            <div class="flex items-center justify-center min-h-[200px] p-6 bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
              <div
                v-if="latexCode"
                class="text-sm"
                v-html="renderedLatex['renderResult']"
              />
              <p
                v-else
                class="text-gray-400"
              >
                {{ t('preview_placeholder') }}
              </p>
            </div>

            <div
              v-if="renderedLatex['errorMessage']"
              class="mt-2 text-sm text-red-700"
              v-html="renderedLatex['errorMessage']"
            />
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold flex items-center gap-2">
                <Icon name="carbon:code" />
                {{ t('edit_title') }}
              </h2>
            </template>
            <UTextarea
              v-model="latexCode"
              :rows="8"
              :placeholder="t('edit_placeholder')"
              autoresize
              class="font-mono w-full"
            />
            <template #footer>
              <div class="flex justify-between items-center">
                <div class="flex gap-2">
                  <!-- 复制按钮 -->
                  <USelect
                    v-model="wrapOption"
                    value-key="value"
                    :placeholder="t('copy_with_format') "
                    :items="wrapOptions"
                    size="sm"
                    class="w-35"
                  />
                  <UButton
                    :disabled="!wrapOption"
                    icon="i-carbon-copy"
                    size="sm"
                    @click="copy"
                  >
                    {{ t('copy') }}
                  </UButton>

                  <!-- 标准化按钮 -->
                  <UButton
                    :disabled="!latexCode"
                    icon="i-carbon-edit"
                    size="sm"
                    @click="format"
                  >
                    {{ t('format') }}
                  </UButton>
                </div>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </UPageBody>
  </UPage>
</template>

<style scoped>
button:disabled {
  background-color: #9ca3af; /* gray-400 */
  opacity: 1;
}

button[aria-disabled="true"] {
  opacity: 1;
}
</style>
