<template>
  <div class="syntax-textarea-wrapper">
    <!-- 高亮显示层 -->
    <div
      class="syntax-highlight-layer"
      :class="{ 'is-placeholder': !modelValue }"
      v-html="highlightedCode || placeholderHtml"
    />

    <!-- 可编辑文本框层 -->
    <textarea
      ref="textareaRef"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      class="syntax-textarea font-mono w-full"
      @input="onInput"
      @scroll="syncScroll"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  rows: 8
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const colorMode = useColorMode()
const textareaRef = ref<HTMLTextAreaElement>()
const highlightedCode = ref('')
const placeholderHtml = ref('')

// 根据主题获取花括号颜色
const braceColor = computed(() => {
  return colorMode.value === 'dark' ? '#6b7280' : '#9ca3af'
})

// 初始化
onMounted(() => {
  updatePlaceholder()
  highlightCode(props.modelValue)
})

// 更新占位符样式
const updatePlaceholder = () => {
  const color = colorMode.value === 'dark' ? '#9ca3af' : '#6b7280'
  placeholderHtml.value = `<span style="color: ${color};">${props.placeholder}</span>`
}

const highlightCode = (code: string) => {
  if (!code) {
    highlightedCode.value = ''
    return
  }

  // 将花括号用灰色 span 包裹
  const highlighted = code.replace(/([{}])/g, (match) => {
    return `<span style="color: ${braceColor.value};">${match}</span>`
  })
  //   console.log(highlighted)

  highlightedCode.value = highlighted
}

// 输入事件处理
const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value

  emit('update:modelValue', value)
  highlightCode(value)

  nextTick(() => {
    syncScroll()
  })
}

// 同步滚动位置
const syncScroll = () => {
  const textarea = textareaRef.value
  if (!textarea) return

  const highlightLayer = textarea.previousElementSibling as HTMLElement
  if (highlightLayer) {
    highlightLayer.scrollTop = textarea.scrollTop
    highlightLayer.scrollLeft = textarea.scrollLeft
  }
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  highlightCode(newValue)
})

// 监听 colorMode 变化
watch(() => colorMode.value, () => {
  updatePlaceholder()
  highlightCode(props.modelValue)
})
</script>

<style scoped>
.syntax-textarea-wrapper {
  position: relative;
  width: 100%;
}

.syntax-highlight-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0.5rem 0.75rem;
  margin: 0;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  overflow: auto;
  pointer-events: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: ui-monospace, monospace;
  line-height: 1.5;
  background: transparent;
}

/* 确保高亮层的内容可见 */
.syntax-highlight-layer :deep(span) {
  /* 让 syntax 生成的 inline styles 生效 */
}

.dark .syntax-highlight-layer {
  background: transparent;
}

.syntax-textarea {
  position: relative;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: transparent;
  caret-color: black;
  resize: vertical;
  outline: none;
  line-height: 1.5;
  overflow: auto;
}

.dark .syntax-textarea {
  border-color: #374151;
  caret-color: white;
}

.syntax-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dark .syntax-textarea:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

/* 滚动条样式 */
.syntax-textarea::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.syntax-textarea::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.dark .syntax-textarea::-webkit-scrollbar-thumb {
  background: #4b5563;
}

/* 隐藏高亮层的滚动条 */
.syntax-highlight-layer {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.syntax-highlight-layer::-webkit-scrollbar {
  display: none;
}
</style>
