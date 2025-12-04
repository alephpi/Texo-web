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
const features = [
  {
    key: 'fast',
    icon: '⚡',
    bgColor: 'bg-red-400'
  },
  {
    key: 'darkMode',
    icon: '🌙',
    bgColor: 'bg-gray-400'
  },
  {
    key: 'editor',
    icon: '✏️',
    bgColor: 'bg-blue-400'
  },
  {
    key: 'openSource',
    icon: '🤗️',
    bgColor: 'bg-green-400'
  }
]
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
      <template #default>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
          <UCard
            v-for="(feature, index) in features"
            :key="index"
            class="p-3"
          >
            <div class="flex flex-col gap-4">
              <!-- Icon -->
              <div :class="['w-16 h-16 rounded-lg flex items-center justify-center text-3xl', feature.bgColor]">
                {{ feature.icon }}
              </div>

              <!-- Title -->
              <h3 class="text-lg font-semibold">
                {{ t(`feature.${feature.key}.title`) }}
              </h3>

              <!-- Description -->
              <p class="text-sm">
                {{ t(`feature.${feature.key}.description`) }}
              </p>
            </div>
          </UCard>
        </div>
      </template>
    </UPageHero>
  </div>
</template>
