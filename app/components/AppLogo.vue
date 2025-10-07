<template>
  <img
    v-if="colorMode.value === 'dark'"
    src="~/assets/svg/logo-dark.svg"
    alt="Texo logo"
  >
  <img
    v-else
    src="~/assets/svg/logo.svg"
    alt="Texo logo"
  >
</template>

<script setup>
const colorMode = useColorMode()
</script>
