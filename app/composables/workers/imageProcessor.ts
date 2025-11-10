import { readImg, Image, readCanvas } from 'image-js'

const UNIMERNET_MEAN = 0.7931
const UNIMERNET_STD = 0.1738

export async function preprocessImg(file: File) {
  // console.log('preprocessImg')
  // console.log(file)
  const img = await createImageBitmap(file)
  const canvas = new OffscreenCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')!
  // prefill background, fix transparent background issue
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0)
  // readCanvas actually also accepts an OffscreenCanvas, it's simply a matter of type annotation
  let image = readCanvas(canvas as unknown as HTMLCanvasElement)
  // console.log(image)
  image = cropMargin(image)
  image = resize(image, 384, 384)
  const array = normalize(image)
  return { image, array }
}

function cropMargin(input: Image): Image {
  const image = input.grey()
  // return grey
  const data = image.getRawImage().data

  let max = -Infinity, min = Infinity
  for (let i = 0; i < data.length; i++) {
    if (data[i] > max) max = data[i]
    if (data[i] < min) min = data[i]
  }

  if (max === min) return image

  // threshold at 200
  const threshold = 200
  let minX = image.width, minY = image.height
  let maxX = 0, maxY = 0

  for (let y = 0; y < image.height; y++) {
    for (let x = 0; x < image.width; x++) {
      const idx = y * image.width + x
      const normalized = ((data[idx] - min) / (max - min)) * 255
      if (normalized < threshold) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) return image

  return image.crop({
    origin: { row: minY, column: minX },
    width: maxX - minX,
    height: maxY - minY
  })
}

function resize(image: Image, height: number, width: number): Image {
  const [targetH, targetW] = [height, width]
  const minDim = Math.min(targetH, targetW)
  const scale = minDim / Math.min(image.height, image.width)

  let newW = Math.round(image.width * scale)
  let newH = Math.round(image.height * scale)

  // Thumbnail logic
  if (newW > targetW || newH > targetH) {
    const ratio = Math.min(targetW / newW, targetH / newH)
    newW = Math.round(newW * ratio)
    newH = Math.round(newH * ratio)
  }

  const resized = image.resize({ width: newW, height: newH })

  // Center padding
  const padW = Math.floor((targetW - newW) / 2)
  const padH = Math.floor((targetH - newH) / 2)

  const output = new Image(targetW, targetH, { colorModel: resized.components === 1 ? 'GREY' : 'RGB' })
  output.fill(0)

  for (let y = 0; y < resized.height; y++) {
    for (let x = 0; x < resized.width; x++) {
      for (let c = 0; c < resized.components; c++) {
        const srcIdx = (y * resized.width + x) * resized.components + c
        const dstIdx = ((y + padH) * targetW + (x + padW)) * output.components + c
        output.data[dstIdx] = resized.data[srcIdx]
      }
    }
  }

  return output
}

function normalize(image: Image, mean: number = UNIMERNET_MEAN, std: number = UNIMERNET_STD): Float32Array {
  const grey = image.components === 1 ? image : image.grey()
  const data = grey.getRawImage().data
  const normalized = new Float32Array(data.length)

  for (let i = 0; i < data.length; i++) {
    normalized[i] = (data[i] / 255.0 - mean) / std
  }

  return normalized
}
