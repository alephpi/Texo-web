import { tex2typst } from 'tex2typst'
import { Latex2TypstTool } from './types/pandoc'

/**
 * 包裹 LaTeX 代码
 * @param code - 原始 LaTeX 代码
 * @param wrapOption - 包裹格式选项
 * @returns 包裹后的代码
 */
export function wrapCode(code: string, wrapOption: string | null): string {
  const cleanCode = code.trim()

  if (!wrapOption) {
    return cleanCode
  }

  return wrapOption.replace('...', cleanCode)
}

/**
 * 标准化 LaTeX 代码, 对齐 &, 换行 \\
 * @param code - 原始 LaTeX 代码
 * @returns 标准化后的代码
 */
export function formatLatex(code: string): string {
  if (!code) return ''

  const tokens = code.split(/\s+/)
  const new_tokens = []
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i]!
    const next_token = tokens[i + 1]!
    new_tokens.push(token)
    if (token === '\\\\') {
      new_tokens.push('\n')
    } else if (token[0] === '\\' && (/^[A-Za-z0-9]/.test(next_token[0]!))) {
      new_tokens.push(' ')
    }
  }
  new_tokens.push(tokens[tokens.length - 1])
  return new_tokens.join('')
}

let lastInput: string | null = null
let lastOutput: string | null = null

export async function convertToTypst(code: string, tool: Latex2TypstTool = Latex2TypstTool.Pandoc): Promise<string> {
  const cleanedCode = code.replace(/~/g, '\\ ')
  const cacheKey = `${tool}:${cleanedCode.trim()}`

  if (lastInput === cacheKey && lastOutput !== null) {
    if (import.meta.client) {
      console.log(`[convertToTypst] Cache hit: same input as last conversion`)
    }
    return lastOutput
  }
  let result: string
  switch (tool) {
    case Latex2TypstTool.Pandoc:
      const response = await $fetch<{ success: boolean; output: string }>('/api/convert/typst', {
        method: 'POST',
        body: { latex: cleanedCode }
      })
      if (response.success) {
        result = response.output
      } else {
        throw new Error('Pandoc conversion failed')
      }
      break
    case Latex2TypstTool.Tex2Typst:
      result = tex2typst(cleanedCode)
      break
    default:
      throw new Error(`Unknown conversion tool: ${tool}`)
  }

  lastInput = cacheKey
  lastOutput = result

  return result
}