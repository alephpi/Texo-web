import { tex2typst } from 'tex2typst'

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

export function convertToTypst(code: string) {
  const cleanedCode = code.replace(/~/g, '\\ ')
  return tex2typst(cleanedCode)
}
