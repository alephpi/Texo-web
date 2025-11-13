// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt'
  ],
  ssr: true,
  components: true,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-01-15',
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      { code: 'zh-CN', name: '中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'no_prefix'
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Texo - LaTeX OCR',
      short_name: 'Texo',
      description: 'In-browser LaTeX formula OCR tool',
      theme_color: '#10B981',
      background_color: '#ffffff',
      display: 'standalone',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,wasm,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 25 * 1024 * 1024
      // 不添加 runtimeCaching，让 @huggingface/transformers 自己管理模型缓存
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600 // 每小时检查更新
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  }
})
