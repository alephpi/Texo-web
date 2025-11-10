export async function convertSvgToPng(svgFile: File) {
  const url = URL.createObjectURL(svgFile)
  const img = new window.Image()
  img.src = url
  await img.decode() // 等待图片解码完成

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  canvas.width = img.width
  canvas.height = img.height
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  URL.revokeObjectURL(url)

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  const pngFile = new File([blob], svgFile.name.replace('.svg', '.png'), {
    type: 'image/png'
  })

  return pngFile
}
