<script setup lang="ts">
const links = ref([
  {
    label: 'Snip and Recognize',
    to: './ocr',
    target: '_blank',
    trailingIcon: 'i-lucide-arrow-right',
    size: 'xl'
  }, {
    label: 'Star me',
    to: 'https://github.com/alephpi/Texo',
    target: '_blank',
    icon: 'i-simple-icons-github',
    size: 'xl',
    color: 'neutral',
    variant: 'subtle'
  }
])
</script>
<template>
  <div>
    <UPageHero
      title="Texo"
      description="In-browser LaTeX OCR"
      :links="links">
      <template #headline>
      <div class="flex items-center justify-center">
        <AppLogo class="w-auto h-24" />
      </div>
        </template>
    </UPageHero>
  </div>
</template>