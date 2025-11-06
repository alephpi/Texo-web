<script setup>
import avatar from '~/assets/svg/avatar.svg'
import avatarDark from '~/assets/svg/avatar-dark.svg'

const colorMode = useColorMode()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'google-site-verification', content: 'XkBVxrbdbp4Mzt-PclbWpD5ScP56_S2cs1QqLq4OhYM' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Texo'
const description = 'In-browser LaTeX OCR'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <AppHeader />
    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator :avatar="{ src: colorMode.value === 'dark' ? avatarDark :avatar }" />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Powered by Nuxt
        </p>
      </template>

      <template #default>
        <p class="text-sm text-muted">
          Sicheng Mao • © 2025 - present
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/alephpi/Texo-web"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>
