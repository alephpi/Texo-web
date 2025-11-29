<script setup lang="ts">
const latexCode = ref('')
</script>

<template>
  <UPage>
    <UPageCard>
      <VMathfield
        v-model="latexCode"
        placeholder="Mathlive editor"
        class="flex w-auto"
      />
    </UPageCard>
    <UPageCard>
      <UTextarea v-model="latexCode" />
    </UPageCard>
  </UPage>
</template>
