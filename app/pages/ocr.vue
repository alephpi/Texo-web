<script setup lang="ts">
const createObjectUrl = (file) => {
  if (file instanceof File) {
    return URL.createObjectURL(file)
  }
  return file
}
const { t } = useI18n()
</script>

<template>
  <UPage>
    <UPageBody>
      <div id="image-uploader" class="w-96 h-96">
        <UFileUpload
          icon="i-lucide-image"
          highlight
          accept="image/*"
          :label="t('uploader_label')"
          :description="t('uploader_description')"
          :ui="{ base: 'w-96 h-96 flex-auto' }"
        >
          <template #file-leading="{ file }">
            <UAvatar
              :src="createObjectUrl(file)"
              :ui="{ image: 'object-contain' }"
              class="size-full rounded-lg"
            />
          </template>
        </UFileUpload>
      </div>
    </UPageBody>
  </UPage>
</template>
