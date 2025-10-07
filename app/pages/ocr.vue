<script setup lang="ts">
import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { SelectItem } from '@nuxt/ui'

const createObjectUrl = (file) => {
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file
}
const { t } = useI18n()

const latexCode = ref('')
const toast = useToast() // 用于显示复制成功提示

const renderedLatex = computed(() => {
  if (!latexCode.value) return ''

  const result = katex.renderToString(latexCode.value, {
    throwOnError: false,
    displayMode: true
  })
  // 创建临时 DOM 节点
  const container = document.createElement('div')
  container.innerHTML = result

  // 查找所有 katex-error 节点
  const errorSpans = container.querySelectorAll('.katex-error')

  // 提取 title 属性
  const errorMessages = Array.from(errorSpans)
    .map(el => el.getAttribute('title'))
    .filter(Boolean) as string[]
  return { result, errorMessages }
})

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
const wrapOption = ref(null)

function wrapCode(code: string): string {
  const cleanCode = code.trim()
  switch (wrapOption.value) {
    case null:
      return cleanCode
    case 'none':
      return cleanCode
    default:
      return wrapOption.value.replace('...', cleanCode)
  }
}

// 复制 LaTeX 代码到剪贴板(应用包裹但不改变文本框内容)
async function copyLatex() {
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
    const wrappedCode = wrapCode(latexCode.value)
    await navigator.clipboard.writeText(wrappedCode)

    toast?.add({
      title: '复制成功',
      description: `已复制 ${wrapOption.value} 格式`,
      color: 'success',
      duration: 1000,
      progress: false
    })
  } catch (err) {
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
function normalizeLatex() {

}
</script>

<template>
  <UPage>
    <UPageBody class="p-10">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <!-- 左侧栏 -->
        <div class="space-y-4">
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">
                上传公式图片
              </h2>
            </template>
            <div class="p-4 flex items-center justify-center text-center rounded-lg">
              <div
                id="image-uploader"
                class="w-96 h-96"
              >
                <UFileUpload
                  icon="i-lucide-image"
                  highlight
                  accept="image/*"
                  :label="t('uploader_label')"
                  :description="t('uploader_description')"
                  :ui="{ base: 'w-96 h-96 flex-auto' }"
                >
                  <template #file-leading="{ file }">
                    <UAvatar
                      :src="createObjectUrl(file)"
                      :ui="{ image: 'object-contain' }"
                      class="size-full rounded-lg"
                    />
                  </template>
                </UFileUpload>
              </div>
            </div>
          </UCard>
        </div>

        <!-- 右侧栏 -->
        <div class="space-y-4">
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">
                {{ t('preview_render') }}
              </h2>
            </template>

            <div class="flex items-center justify-center min-h-[200px] p-6 bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
              <div
                v-if="latexCode"
                class="text-sm"
                v-html="renderedLatex['result']"
              />
              <p
                v-else
                class="text-gray-400"
              >
                输入 LaTeX 代码查看预览
              </p>
            </div>
            <div
              v-if="renderedLatex['errorMessages']"
              class="mt-2 text-sm text-red-700"
              v-html="renderedLatex['errorMessages'].join('<br>')"
            />
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">
                {{ t('preview_code') }}
              </h2>
            </template>
            <UTextarea
              v-model="latexCode"
              :rows="8"
              placeholder="输入 LaTeX 代码"
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
                    placeholder="复制带包裹格式"
                    :items="wrapOptions"
                    size="sm"
                    class="w-35"
                  />
                  <UButton
                    :disabled="!wrapOption"
                    icon="i-lucide-copy"
                    size="sm"
                    :ui="{ base: 'disabled:bg-gray-400 disabled:opacity-100 aria-disabled:opacity-100' }"
                    @click="copyLatex"
                  >
                    复制
                  </UButton>

                  <!-- 标准化按钮 -->
                  <UButton
                    icon="i-lucide-edit"
                    size="sm"
                    @click="normalizeLatex"
                  >
                    标准化
                  </UButton>
                </div>
              </div>
            </template>
          </UCard>
        </div>

        <UCard />
      </div>
    </UPageBody>
  </UPage>
</template>
