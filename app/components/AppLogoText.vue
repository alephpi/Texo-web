<template>
  <img 
    v-if="colorMode.value === 'dark'" 
    src="~/assets/svg/logo-text-dark.svg" 
    alt="Texo logo"
  >
  <img 
    v-else 
    src="~/assets/svg/logo-text.svg" 
    alt="Texo logo"
  >
</template>

<script setup>
const colorMode = useColorMode()
</script>
