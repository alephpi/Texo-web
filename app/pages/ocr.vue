<script setup lang="ts">
import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ModelConfig } from '../composables/types'

const { t } = useI18n()
const toast = useToast()

const latexCode = ref('')
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

// 包裹格式选项
const wrap_format_options = [
  '$...$',
  '$$...$$',
  '\\(...\\)',
  '\\[...\\]',
  '\\begin{align}\n...\n\\end{align}',
  '\\begin{equation}\n...\n\\end{equation}'
]

const wrap_format_menu: DropdownMenuItem[] = wrap_format_options.map(
  (option) => {
    return {
      label: option,
      onSelect: () => copy(option)
    }
  }
)

async function copy(wrap_format: string | null = null) {
  try {
    const wrappedCode = wrapCode(latexCode.value, wrap_format)
    await navigator.clipboard.writeText(wrappedCode)

    toast?.add({
      title: wrap_format ? t('copied_with_format') + ' ' + wrap_format : t('copied'),
      color: 'success',
      duration: 1500,
      progress: false
    })
  } catch {
    toast?.add({
      title: t('copy_failed'),
      color: 'error',
      duration: 1500,
      progress: false
    })
  }
}

// 格式化 LaTeX 代码
function format() {
  latexCode.value = formatLatex(latexCode.value)
}

function clear() {
  latexCode.value = ''
}

const imageFile = ref<File | null>(null)
const imgHolder = ref(null)

function createObjectURL(file: File) {
  return URL.createObjectURL(file)
}

async function onFileChange(newFile: File | null | undefined) {
  if (newFile) {
    imageFile.value = newFile
    runOCR(imageFile.value)
  }
}

const loadTestImage = (() => {
  let idx = 0
  const urls = [
    'assets/test_img/单行公式.png',
    'assets/test_img/单行公式2.png',
    'assets/test_img/多行公式.png',
    'assets/test_img/多行公式2.jpg'
  ]

  return async function () {
    const response = await fetch(urls[idx]!)
    const blob = await response.blob()
    imageFile.value = new File([blob], 'test-image.jpg', { type: blob.type })
    await onFileChange(imageFile.value)

    idx = (idx + 1) % urls.length
  }
})()

const { init, predict, progress, isReady } = useOCR()

const load = async (model_config: ModelConfig) => {
  console.log('init')
  await init(model_config)
  console.log('model is ready', isReady.value)
}

// 预测
const runOCR = async (imageFile: File) => {
  console.log('predict')
  toast.clear()
  toast.add({
    id: 'predict',
    title: t('recognizing'),
    color: 'info',
    duration: 0
  })

  const start = performance.now()
  const result = await predict(imageFile)
  const elapsedMs = performance.now() - start
  const timeStr = elapsedMs < 1000 ? `${Math.round(elapsedMs)} ms` : `${(elapsedMs / 1000).toFixed(2)} s`

  if (result.status === 'result') {
    latexCode.value = result.output || ''
    toast.update('predict', {
      title: t('recognize_success') + ' ' + timeStr,
      color: 'success',
      duration: 1500
    })
  } else {
    toast.update('predict', {
      title: t('recognition_failed') + ` ${result.output || t('unknown_error')} (${timeStr})`,
      color: 'error',
      duration: 0
    })
  }
}

// 处理全局粘贴事件
const handlePaste = async (event: ClipboardEvent) => {
  const target = event.target as HTMLElement
  if (
    target.tagName === 'TEXTAREA'
    || target.tagName === 'INPUT'
    || target.isContentEditable
  ) {
    return
  }

  console.log('paste event detected')
  const items = event.clipboardData?.items
  if (!items || items.length === 0) return

  const item = items[0]!
  if (item.type.indexOf('image') !== -1) {
    event.preventDefault() // 阻止默认粘贴行为

    const file = item.getAsFile()
    if (file) {
      const timestamp = new Date().getTime()
      const imageFileWithName = new File([file], `pasted-image-${timestamp}.png`, {
        type: file.type
      })
      await onFileChange(imageFileWithName)
    }
  }
}

// 监听全局粘贴事件
onMounted(() => {
  window.addEventListener('paste', handlePaste)
})

onBeforeUnmount(() => {
  window.removeEventListener('paste', handlePaste)
})

const model_config = await useSource()
useModelLoadingToast(t, model_config, progress, isReady)
await load(model_config)
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
                  :ui="{ base: 'w-96 h-96 flex-auto' }"
                  @update:model-value="onFileChange"
                >
                  <template #description>
                    <p
                      class="text-center"
                      style="white-space: pre-line;"
                    >
                      {{ t('uploader_description') }}
                    </p>
                  </template>
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
            <div class="flex justify-center items-center">
              <UButton
                :label="t('upload_example')"
                color="secondary"
                @click="loadTestImage()"
              />
            </div>
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
                  <UFieldGroup>
                    <UButton
                      :disabled="!latexCode"
                      icon="i-carbon-copy"
                      size="sm"
                      @click="copy()"
                    >
                      {{ t('copy') }}
                    </UButton>
                    <UDropdownMenu
                      :items="wrap_format_menu"
                      :content="{
                        align: 'end',
                        side: 'bottom',
                        sideOffset: 8
                      }"
                      :ui="{
                        content: 'w-auto'
                      }"
                    >
                      <UTooltip
                        :text="t('copy_with_format')"
                        :delay-duration="0"
                      >
                        <UButton
                          :disabled="!latexCode"
                          icon="i-lucide-chevron-down"
                          size="sm"
                        />
                      </UTooltip>
                    </UDropdownMenu>
                  </UFieldGroup>

                  <UButton
                    :disabled="!latexCode"
                    icon="i-carbon-edit"
                    size="sm"
                    @click="format"
                  >
                    {{ t('format') }}
                  </UButton>
                  <UButton
                    :disabled="!latexCode"
                    icon="i-carbon-erase"
                    size="sm"
                    @click="clear"
                  >
                    {{ t('clear') }}
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
