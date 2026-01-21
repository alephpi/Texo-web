import { cpSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default function mirrorPublicAssets(publicDir: string, serverDir: string) {
  if (!publicDir || !serverDir) return

  const sourceDir = resolve(publicDir)
  const targetDir = resolve(serverDir, 'chunks', 'public')

  if (!existsSync(sourceDir)) return
  if (sourceDir === targetDir) return

  mkdirSync(targetDir, { recursive: true })
  cpSync(sourceDir, targetDir, { recursive: true })
}
