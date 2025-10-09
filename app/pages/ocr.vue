<script setup lang="ts">
import katex from 'katex'
import 'katex/dist/katex.min.css'
import type { SelectItem } from '@nuxt/ui'

const createObjectUrl = (file: File) => {
  return URL.createObjectURL(file)
}
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

  // 查找所有 katex-error 节点
  const errorSpan = container.querySelector('.katex-error')

  // 提取 title 属性
  const errorMessage = errorSpan?.getAttribute('title')
  return { renderResult, errorMessage }
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
const wrapOption = ref<string | null>(null)

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
    const wrappedCode = wrapCode(latexCode.value)
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
function normalize() {
  if (!latexCode.value) return

  // 在 \begin{array}{...} 前后添加换行，但保持 {...} 与 \begin{array} 在同一行
  const processedCode = latexCode.value
    .replace(/\\begin\{array\}\s*(\{[^}]*\})/g, '\n\\begin{array}$1\n')
    .replace(/\\end\{array\}/g, '\n\\end{array}\n')

  // 按 \\ 分割行
  const rawLines = processedCode.split('\\\\')

  // 进一步按换行符分割，并过滤空行
  const allLines: string[] = []
  for (const line of rawLines) {
    const subLines = line.split('\n').map(l => l.trim()).filter(l => l)
    allLines.push(...subLines)
  }

  if (allLines.length === 0) return

  // 识别需要对齐的行（不包括 \begin 和 \end 行）
  const linesToAlign: number[] = []
  const lineSegments: string[][] = []

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i]!
    if (line.includes('\\begin{') || line.includes('\\end{')) {
      // 这些行不参与对齐
      lineSegments.push([line])
    } else if (line.includes('&')) {
      // 包含 & 的行需要对齐
      linesToAlign.push(i)
      const segments = line.split('&').map(seg => seg.trim())
      lineSegments.push(segments)
    } else {
      // 普通行
      lineSegments.push([line])
    }
  }

  // 如果有需要对齐的行，计算列宽
  if (linesToAlign.length > 0) {
    const maxCols = Math.max(...linesToAlign.map(i => lineSegments[i]!.length))
    const colWidths: number[] = []

    for (let col = 0; col < maxCols - 1; col++) {
      let maxWidth = 0
      for (const idx of linesToAlign) {
        const segments = lineSegments[idx]!
        if (segments[col]) {
          maxWidth = Math.max(maxWidth, segments[col]!.length)
        }
      }
      colWidths.push(maxWidth)
    }

    // 对齐包含 & 的行
    for (const idx of linesToAlign) {
      const segments = lineSegments[idx]!
      const paddedSegments = segments.map((seg, segIdx) => {
        if (segIdx < segments.length - 1) {
          return seg.padEnd(colWidths[segIdx] || 0)
        }
        return seg
      })
      lineSegments[idx] = [paddedSegments.join(' & ')]
    }
  }

  // 重新组合，只在需要对齐的行之间添加 \\
  const result: string[] = []
  for (let i = 0; i < lineSegments.length; i++) {
    const lineContent = lineSegments[i]![0] || lineSegments[i]!.join(' & ')

    // 判断是否需要在行尾添加 \\
    if (i < lineSegments.length - 1) {
      // const currentLine = allLines[i]
      const nextLine = allLines[i + 1]
      const isCurrentAlignLine = linesToAlign.includes(i)
      const isNextAlignLine = linesToAlign.includes(i + 1)

      // 如果当前行和下一行都是对齐行，添加 \\
      if (isCurrentAlignLine && isNextAlignLine) {
        result.push(lineContent + ' \\\\')
      } else if (isCurrentAlignLine && !nextLine!.includes('\\end{')) {
        result.push(lineContent + ' \\\\')
      } else {
        result.push(lineContent)
      }
    } else {
      result.push(lineContent)
    }
  }

  // 去掉空行
  latexCode.value = result.filter(line => line.trim()).join('\n')
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
                {{ t('load_model') }}
              </h2>
            </template>
            <div />
          </UCard>
          <UCard>
            <template #header>
              <h2 class="text-xl font-semibold">
                {{ t('upload_image') }}
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
                v-html="renderedLatex['renderResult']"
              />
              <p
                v-else
                class="text-gray-400"
              >
                {{ t('preview_render_placeholder') }}
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
              <h2 class="text-xl font-semibold">
                {{ t('edit_code') }}
              </h2>
            </template>
            <UTextarea
              v-model="latexCode"
              :rows="8"
              :placeholder="t('edit_code_placeholder')"
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
                    icon="i-lucide-copy"
                    size="sm"
                    :ui="{ base: 'disabled:bg-gray-400 disabled:opacity-100 aria-disabled:opacity-100' }"
                    @click="copy"
                  >
                    {{ t('copy') }}
                  </UButton>

                  <!-- 标准化按钮 -->
                  <UButton
                    icon="i-lucide-edit"
                    size="sm"
                    @click="normalize"
                  >
                    {{ t('normalize') }}
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
