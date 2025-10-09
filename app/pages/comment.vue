<template>
  <div>
    <p align="center">
      {{ t('comment_welcome') }}
    </p>
    <p align="center">
      <ULink
        to="https://github.com/alephpi/Texo-web/issues/new/choose"
      >
        {{ t('report_issue') }}
      </ULink>
    </p>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
