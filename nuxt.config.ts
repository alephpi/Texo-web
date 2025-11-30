// https://nuxt.com/docs/api/configuration/nuxt-config
import copyKatexFonts from './utils/copy-katex-font'
import replace from '@rollup/plugin-replace'
import { execSync } from 'child_process'

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

  css: ['~/assets/css/main.css', '~/assets/scss/katex.scss'],
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag === 'math-field'
    }
  },
  compatibilityDate: '2025-01-15',
  vite: {
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          __COMMIT__: execSync('git rev-parse HEAD').toString().trim(),
          __BUILD_DATE__: new Date().toLocaleString()
        }
      })
    ]
  },
  hooks: {
    ready: (nuxt) => {
      copyKatexFonts(nuxt.options.rootDir)
    }
  },
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
      name: 'Texo In-browser LaTeX OCR',
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
      globPatterns: ['**/*.{js,json,css,html,txt,svg,png,ico,webp,woff,woff2,ttf,eot,otf,wasm}'],
      maximumFileSizeToCacheInBytes: 25 * 1024 * 1024 // 25MB
      // 不添加 runtimeCaching，让 @huggingface/transformers 自己管理模型缓存
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 60 * 60 * 24 // per day
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  }
})
