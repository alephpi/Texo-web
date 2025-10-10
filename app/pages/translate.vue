<script setup lang="ts">
import { translate } from '../workers/translate'

const input = ref('Hello')
const message = ref()

async function runTranslate() {
  const res = await translate(input.value)
  message.value = res
}
</script>

<template>
  <div>
    <UTextarea
      v-model="input"
      :rows="8"
      autoresize
      class="font-mono w-full"
    />
    <UButton
      icon="i-carbon-edit"
      size="sm"
      @click="runTranslate"
    >
      Translate
    </UButton>
    {{ message }}
  </div>
</template>
