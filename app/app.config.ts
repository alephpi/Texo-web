export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'slate'
    },
    button: {
      slots: {
        base: [
          'rounded-md font-medium inline-flex items-center disabled:cursor-not-allowed aria-disabled:cursor-not-allowed disabled:opacity-75 aria-disabled:opacity-75 disabled:!bg-gray-400 aria-disabled:!bg-gray-400',
          'transition-colors'
        ]
      }
    }
  }
})
