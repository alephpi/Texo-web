<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { en, zh_cn } from '@nuxt/ui/locale'

const { t, locale, setLocale } = useI18n()
const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [{
  label: t('recognize'),
  to: '/ocr',
  active: route.path.startsWith('/ocr')
}, {
  label: t('comment'),
  to: '/comment',
  active: route.path.startsWith('/comment')
}
])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogoText class="w-auto h-6 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu :items="items" />

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
    </template>

    <template #right>
      <ULocaleSelect
        v-model="locale"
        :locales="[zh_cn, en]"
        @update:model-value="setLocale($event as 'en' | 'zh-CN')"
      />
      <UColorModeButton />
      <UButton
        to="https://github.com/alephpi/Texo"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="info"
        variant="ghost"
      />
      <UButton
        to="https://github.com/alephpi/Texo-web"
        target="_blank"
        icon="i-simple-icons-github"
        aria-label="GitHub"
        color="primary"
        variant="ghost"
      />
      <UButton
        to="https://www.bilibili.com/video/BV1qX1TBFEee/"
        target="_blank"
        icon="i-simple-icons-bilibili"
        aria-label="GitHub"
        class="text-[#ff6699] hover:text-[#ff8cb0] hover:bg-color-[#ff8cb0]"
        variant="ghost"
      />
      <img
        alt="GitHub Repo stars"
        src="https://img.shields.io/github/stars/alephpi/texo?style=plastic"
      >
    </template>
  </UHeader>
</template>
