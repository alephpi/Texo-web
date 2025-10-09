<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { en, zh_cn } from '@nuxt/ui/locale'

const { t, locale, setLocale } = useI18n()
const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [{
  label: t('ocr'),
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
        color="neutral"
        variant="ghost"
      />
    </template>
  </UHeader>
</template>
