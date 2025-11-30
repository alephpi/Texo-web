<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const { t } = useI18n()
const links = computed<ButtonProps[]>(() => [
  {
    label: t('snip-and-recognize'),
    to: '/ocr',
    target: '_self',
    trailingIcon: 'i-lucide-arrow-right',
    size: 'xl'
  }, {
    label: t('star-me'),
    to: 'https://github.com/alephpi/Texo',
    target: '_blank',
    icon: 'i-simple-icons-github',
    trailingIcon: 'i-lucide-star',
    size: 'xl',
    color: 'neutral',
    variant: 'subtle'
  }, {
    label: 'Bilibili',
    to: 'https://www.bilibili.com/video/BV1qX1TBFEee/',
    target: '_blank',
    icon: 'i-simple-icons-bilibili',
    size: 'xl',
    class: 'bg-[#ff6699] hover:bg-[#ff8cb0]'
  }
])
</script>

<template>
  <div>
    <UPageHero
      title="Texo"
      :description="t('description')"
      :links="links"
    >
      <template #headline>
        <div class="flex items-center justify-center">
          <AppLogo class="w-auto h-24" />
        </div>
      </template>
    </UPageHero>
  </div>
</template>
