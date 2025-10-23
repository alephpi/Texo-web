<script setup lang="ts">
import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { SelectItem } from '@nuxt/ui'
import type { ModelConfig } from '../workers/ocr'

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

const imageArray = ref<Float32Array | undefined>(undefined)

// async function loadModel(modelName: string) {
//   const ocrSingleton = OCRModelManager.getInstance()
//   currentModel.value = await ocrSingleton.loadModel(modelName)
//   console.log(currentModel.value)
// }

async function onFileChange(newFile: File | null | undefined) {
  if (newFile) {
    const { image, array } = await preprocessImg(newFile)
    imageArray.value = array
  }
}

const use_ms_hub = ref(false)

async function runOCR(imageArray: Float32Array, use_ms_hub: boolean) {
  const model_config: ModelConfig = {
    modelName: '../../models/model'
  }
  // let model_config: ModelConfig = {
  //   modelName: 'alephpi/FormulaNet',
  //   env_config: {
  //     remoteHost: 'https://huggingface.co/',
  //     remotePathTemplate: '{model}/resolve/{revision}'
  //   }
  // }
  // if (use_ms_hub) {
  //   model_config = {
  //     modelName: 'alephpi98/FormulaNet',
  //     env_config: {
  //       remoteHost: 'https://modelscope.cn/api/v1/models/',
  //       remotePathTemplate: '{model}/repo?Revision=master&FilePath=.' // the trailing dot should not be missed as the transformers.js would append a slash during url resolving.
  //     }
  //   }
  // }
  console.log(model_config)
  // console.log(await fetch('https://www.modelscope.cn/api/v1/models/alephpi98/FormulaNet/repo?Revision=master&FilePath=onnx/generation_config.json'))
  const ocrModelName = await loadModel(model_config)
  latexCode.value = await ocr(imageArray, ocrModelName) || ''
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
                <!-- <UButton
                :label="t('load_test_image')"
                @click="loadTestImage"
              /> -->
                <!-- <UCheckbox
                  v-model="use_ms_hub"
                  :label="t('use_ms_hub')"
                  :description="t('is_cn_mainland')"
                /> -->
                <UButton
                  :disabled="!imageArray"
                  :label="t('recognize')"
                  @click="runOCR(imageArray, use_ms_hub)"
                />
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
