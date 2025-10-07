<script setup lang="ts">
import katex, { render } from 'katex'
import 'katex/dist/katex.min.css'

const createObjectUrl = (file) => {
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file
}
const { t } = useI18n()

const latexCode = ref('')

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
                  <UButton
                    icon="i-lucide-copy"
                    size="sm"
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

                  <!-- 下拉菜单选择标准化格式 -->
                  <UDropdownMenu
                    v-slot="{ open }"
                    :modal="false"
                    :items="[{
                      label: '无包围',
                      to: 'https://starter-template.nuxt.dev/',
                      color: 'primary',
                      checked: true,
                      type: 'checkbox'
                    }, {
                      label: '$...$',
                      to: 'https://docs-template.nuxt.dev/'
                    }, {
                      label: '$$...$$',
                      to: 'https://saas-template.nuxt.dev/'
                    }, {
                      label: '\\\(...\\\)',
                      to: 'https://dashboard-template.nuxt.dev/'
                    }, {
                      label: '\\\[...\\\]',
                      to: 'https://landing-template.nuxt.dev/'
                    }, {
                      label: '\\begin{align}...\\end{align}',
                      to: 'https://portfolio-template.nuxt.dev/'
                    }, {
                      label: '\\begin{equation}...\\end{equation}',
                      to: 'https://chat-template.nuxt.dev/'
                    }]"
                    :content="{ align: 'start' }"
                    size="xs"
                  >
                    <UButton
                      label="无包围"
                      variant="subtle"
                      trailing-icon="i-lucide-chevron-down"
                      size="xs"
                      class="font-semibold truncate"
                      :class="[open]"
                      :ui="{
                        trailingIcon: ['transition-transform duration-200', open ? 'rotate-180' : undefined].filter(Boolean).join(' ')
                      }"
                    />
                  </UDropdownMenu>
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
