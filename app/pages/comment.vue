<template>
  <UPage>
    <UContainer>
      <p class="text-center m-6">
        <ULink
          to="https://github.com/alephpi/Texo-web/issues/new/choose"
        >
          {{ t('report_issue') }}
        </ULink>
      </p>

      <p class="text-center m-4">
        {{ t('comment_welcome') }}
      </p>
      <div class="mt-10 mb-20">
        <Giscus
          repo="alephpi/Texo-web"
          repo-id="R_kgDOP9fzIA"
          category-id="DIC_kwDOP9fzIM4CxKyD"
          mapping="specific"
          term="Welcome to Texo-web"
          strict="0"
          reactions-enabled="1"
          emit-metadata="0"
          input-position="top"
          :theme="colorMode.value"
          :lang="locale"
          loading="lazy"
          crossorigin="anonymous"
          async
        />
      </div>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import Giscus from '@giscus/vue'

const { locale, t } = useI18n()
const colorMode = useColorMode()
</script>
