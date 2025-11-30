<template>
  <UFieldGroup>
    <UBadge
      variant="soft"
      color="neutral"
    >
      Commit
    </UBadge>
    <UBadge
      variant="soft"
      color="info"
    >
      <a :href=" props.url + '/commit/' + props.commit ">
        {{ props.commit.slice(0, 7) }}
      </a>
    </UBadge>
  </UFieldGroup>
  <UFieldGroup>
    <UBadge
      variant="soft"
      color="neutral"
    >
      Build
    </UBadge>
    <UBadge
      variant="soft"
      color="info"
    >
      {{ date }}
    </UBadge>
  </UFieldGroup>
</template>

<script lang="ts" setup>
const props = defineProps<{
  url: string
  commit: string
  date: string
}>()
</script>
