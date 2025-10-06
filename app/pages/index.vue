<template>
  <div>
    <UPageHero
      title="Texo"
      description="In-browser LaTeX OCR"
      :links="[{
        label: 'Snip and Recognize',
        to: './ocr',
        target: '_blank',
        trailingIcon: 'i-lucide-arrow-right',
        size: 'xl'
      }, {
        label: 'Star me',
        to: 'https://github.com/alephpi/Texo',
        target: '_blank',
        icon: 'i-simple-icons-github',
        size: 'xl',
        color: 'neutral',
        variant: 'subtle'
      }]"
    />
  </div>
</template>
