// nuxt.config.ts
import { copyFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { resolve } from 'path'

export default function copyKatexFonts(rootDir: string) {
  const sourceDir = resolve(rootDir, 'node_modules/katex/dist/fonts')
  const targetDir = resolve(rootDir, 'public/fonts')

  try {
    // 检查目标目录是否已有字体文件，避免重复复制
    if (existsSync(targetDir) && readdirSync(targetDir).length > 0) {
      console.log('✓ KaTeX fonts already exist in public/fonts')
      return
    }

    mkdirSync(targetDir, { recursive: true })
    const files = readdirSync(sourceDir).filter(file => file.endsWith('.woff2'))
    files.forEach((file) => {
      copyFileSync(
        resolve(sourceDir, file),
        resolve(targetDir, file)
      )
    })
    console.log(`✓ Copied ${files.length} KaTeX fonts to public/fonts`)
  } catch (error) {
    console.error('Failed to copy KaTeX fonts:', error)
  }
}
