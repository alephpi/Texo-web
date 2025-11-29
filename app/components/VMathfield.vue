<template>
  <div
    id="vue_mathfield_container"
    ref="vue_mathfield_container"
  />
</template>

<script setup lang="ts">
import type { VirtualKeyboardPolicy } from 'mathlive'
import { MathfieldElement } from 'mathlive'

interface MathfieldElementProps {
  modelValue: string
  placeholder?: string
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
  placeholder: '\\text{Mathlive WYSIWYG LaTeX Editor}',
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
let mfe: MathfieldElement

onMounted(() => {
  // for ssr, create this when DOM is ready
  mfe = new MathfieldElement()
  MathfieldElement.fontsDirectory = '/fonts'
  if (props.modelValue) {
    mfe.value = props.modelValue
  }

  mfe.addEventListener('input', () => {
    emit('update:modelValue', mfe.value)
    emit('change', mfe.value)
  })

  // css styles
  mfe.className = 'w-full h-full flex justify-center block align-center m-auto min-h-10'
  mfe.setAttribute('style', 'display:block')
  //   const style = document.createElement('style')
  //   style.textContent = `
  //     @media not (pointer: coarse) {
  //         :host::part(virtual-keyboard-toggle) {
  //             display: none;
  //     }}

  //     :host::part(menu-toggle) {
  //         display: none;
  //     }
  //   `
  //   mfe.shadowRoot!.appendChild(style)
  vue_mathfield_container.value?.appendChild(mfe)

  watchEffect(() => {
    mfe.value = props.modelValue
  })
  watchEffect(() => {
    mfe.placeholder = props.placeholder
  })
  watchEffect(() => {
    if (props.modelValue === '') mfe.placeholder = props.placeholder
  })
  // update every keys
  const propKeys = Object.keys(props) as (keyof typeof props)[]
  propKeys.forEach((key) => {
    if (key !== 'modelValue' && key !== 'placeholder') {
      watchEffect(() => {
        // @ts-expect-error: suppress
        mfe[key] = props[key]
      })
    }
  })
})

// onBeforeUnmount(() => {
//   if (mfe) {
//     mfe.remove()
//     mfe = null
//   }
// })
</script>
