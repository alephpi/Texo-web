<template>
  <div
    id="vue_mathfield_container"
    ref="vue_mathfield_container"
  />
</template>

<script setup lang="ts">
import type { VirtualKeyboardPolicy } from 'mathlive'
import { MathfieldElement } from 'mathlive'
import 'mathlive/fonts.css'

interface MathfieldElementProps {
  modelValue: string
  disabled?: boolean
  defaultMode?: 'inline-math' | 'math' | 'text'
  letterShapeStyle?: 'auto' | 'tex' | 'iso' | 'french' | 'upright'
  minFontScale?: number
  maxMatrixCols?: number
  popoverPolicy?: 'auto' | 'off'
  mathModeSpace?: string
  readOnly?: boolean
  removeExtraneousParentheses?: boolean
  smartFence?: boolean
  smartMode?: boolean
  smartSuperscript?: boolean
  inlineShortcutTimeout?: number
  scriptDepth?: number
  mathVirtualKeyboardPolicy?: VirtualKeyboardPolicy
}

const props = withDefaults(defineProps<MathfieldElementProps>(), {
  disabled: false,
  defaultMode: 'math',
  letterShapeStyle: 'auto',
  minFontScale: 0,
  maxMatrixCols: 10,
  popoverPolicy: 'auto',
  mathModeSpace: '',
  removeExtraneousParentheses: true,
  smartFence: true,
  smartMode: false,
  smartSuperscript: false,
  inlineShortcutTimeout: 0,
  scriptDepth: 5,
  mathVirtualKeyboardPolicy: 'auto'
})

const emit = defineEmits(['update:modelValue', 'change'])

const vue_mathfield_container = ref<HTMLDivElement | null>(null)
let mfe: MathfieldElement | null = null
onMounted(() => {
  // 创建 MathfieldElement 实例
  mfe = new MathfieldElement()

  // 设置初始值
  if (props.modelValue) {
    mfe.value = props.modelValue
  }

  // 监听输入变化
  mfe.addEventListener('input', () => {
    if (mfe) {
      emit('update:modelValue', mfe.value)
      emit('change', mfe.value)
    }
  })

  // css styles
  mfe.className = 'w-full h-full flex justify-center block align-center m-auto min-h-10'
  mfe.setAttribute('style', 'display:block')
  const style = document.createElement('style')
  style.textContent = `
    @media not (pointer: coarse) {
        :host::part(virtual-keyboard-toggle) {
            display: none;
    }}

    :host::part(menu-toggle) {
        display: none;
    }
  `
  mfe.shadowRoot!.appendChild(style)
  // 将元素添加到容器中
  vue_mathfield_container.value?.appendChild(mfe)
})

// 监听 modelValue 变化,更新 mathfield
watch(() => props.modelValue, (newValue) => {
  if (mfe && mfe.value !== newValue) {
    mfe.value = newValue
  }
})

onBeforeUnmount(() => {
  // 清理事件监听器
  if (mfe) {
    mfe.remove()
    mfe = null
  }
})

// 暴露 mathfield 实例供父组件访问
defineExpose({
  getMathfield: () => mfe
})
</script>
