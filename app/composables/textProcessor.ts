import katex from 'katex'
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

/**
 * Sanitizes MathML content for compatibility with Microsoft Word.
 *
 * Removes layout hacks and spacing elements that Word renders incorrectly as blank boxes.
 * Handles both server-side (regex-based) and client-side (DOM-based) sanitization.
 *
 * @param mathml - The MathML string to sanitize
 * @returns The sanitized MathML string. Returns the original input if parsing fails or if DOM APIs are unavailable.
 *
 * @remarks
 * - If `DOMParser` and `XMLSerializer` are unavailable (server-side), uses regex patterns to remove:
 *   - All `<mpadded>` elements
 *   - `<mspace>` elements with width="1em" or width="1.0em"
 * - If DOM APIs are available (client-side), parses the MathML and:
 *   - Unwraps `<mpadded>` elements by moving their children to the parent
 *   - Removes `<mspace>` elements with width >= 1em
 *
 * @example
 * ```ts
 * const original = '<math><mpadded><mi>x</mi></mpadded></math>';
 * const sanitized = sanitizeMathMLForWord(original);
 * // Returns: '<math><mi>x</mi></math>'
 * ```
 */
function sanitizeMathMLForWord(mathml: string): string {
  if (!mathml) return mathml

  // Strip layout hacks that Word renders as blank boxes.
  if (typeof DOMParser === 'undefined' || typeof XMLSerializer === 'undefined') {
    return mathml
      .replace(/<mpadded[\s\S]*?<\/mpadded>/g, '')
      .replace(
        /<mspace\b[^>]*\bwidth=(['"])?1(?:\.0+)?em\1[^>]*>[\s\S]*?<\/mspace>/g,
        ''
      )
      .replace(/<mspace\b[^>]*\bwidth=(['"])?1(?:\.0+)?em\1[^>]*\/>/g, '')
  }

  const doc = new DOMParser().parseFromString(mathml, 'application/xml')
  const root = doc.documentElement
  if (!root || root.nodeName === 'parsererror') return mathml

  root.querySelectorAll('mpadded').forEach((node) => {
    const parent = node.parentNode
    if (!parent) return
    while (node.firstChild) {
      parent.insertBefore(node.firstChild, node)
    }
    parent.removeChild(node)
  })

  root.querySelectorAll('mspace').forEach((node) => {
    const width = node.getAttribute('width')
    if (!width) return
    const match = width.trim().match(/^([0-9]*\.?[0-9]+)em$/)
    if (!match) return
    const value = Number(match[1])
    if (Number.isFinite(value) && value >= 1) {
      node.remove()
    }
  })

  return new XMLSerializer().serializeToString(root)
}

export function convertToMathML(code: string) {
  const cleanedCode = code.trim()
  if (!cleanedCode) return ''

  const rendered = katex.renderToString(cleanedCode, {
    throwOnError: false,
    displayMode: true,
    output: 'mathml'
  })

  const mathmlMatch = rendered.match(/<math[\s\S]*<\/math>/)
  if (!mathmlMatch) return rendered

  let mathml = mathmlMatch[0]
  mathml = mathml.replace(/<annotation[\s\S]*?<\/annotation>/g, '')
  mathml = mathml.replace(/<\/?semantics[^>]*>/g, '')
  mathml = mathml.replace(
    /<mtext>([\s\u00A0\u2000-\u200A\u202F\u205F\u3000]+)<\/mtext>/g,
    '<mspace width="0.2em"/>'
  )
  return sanitizeMathMLForWord(mathml)
}
