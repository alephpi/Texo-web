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

  // 在 \begin{array}{...} 前后添加换行,但保持 {...} 与 \begin{array} 在同一行
  const processedCode = code
    .replace(/\\begin\{array\}\s*(\{[^}]*\})/g, '\n\\begin{array}$1\n')
    .replace(/\\end\{array\}/g, '\n\\end{array}\n')

  // 按 \\ 分割行
  const rawLines = processedCode.split('\\\\')

  // 进一步按换行符分割,并过滤空行
  const allLines: string[] = []
  for (const line of rawLines) {
    const subLines = line.split('\n').map(l => l.trim()).filter(l => l)
    allLines.push(...subLines)
  }

  if (allLines.length === 0) return ''

  // 识别需要对齐的行(不包括 \begin 和 \end 行)
  const linesToAlign: number[] = []
  const lineSegments: string[][] = []

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i]!
    if (line.includes('\\begin{') || line.includes('\\end{')) {
      // 这些行不参与对齐
      lineSegments.push([line])
    } else if (line.includes('&')) {
      // 包含 & 的行需要对齐
      linesToAlign.push(i)
      const segments = line.split('&').map(seg => seg.trim())
      lineSegments.push(segments)
    } else {
      // 普通行
      lineSegments.push([line])
    }
  }

  // 如果有需要对齐的行,计算列宽
  if (linesToAlign.length > 0) {
    const maxCols = Math.max(...linesToAlign.map(i => lineSegments[i]!.length))
    const colWidths: number[] = []

    for (let col = 0; col < maxCols - 1; col++) {
      let maxWidth = 0
      for (const idx of linesToAlign) {
        const segments = lineSegments[idx]!
        if (segments[col]) {
          maxWidth = Math.max(maxWidth, segments[col]!.length)
        }
      }
      colWidths.push(maxWidth)
    }

    // 对齐包含 & 的行
    for (const idx of linesToAlign) {
      const segments = lineSegments[idx]!
      const paddedSegments = segments.map((seg, segIdx) => {
        if (segIdx < segments.length - 1) {
          return seg.padEnd(colWidths[segIdx] || 0)
        }
        return seg
      })
      lineSegments[idx] = [paddedSegments.join(' & ')]
    }
  }

  // 重新组合,只在需要对齐的行之间添加 \\
  const result: string[] = []
  for (let i = 0; i < lineSegments.length; i++) {
    const lineContent = lineSegments[i]![0] || lineSegments[i]!.join(' & ')

    // 判断是否需要在行尾添加 \\
    if (i < lineSegments.length - 1) {
      const nextLine = allLines[i + 1]
      const isCurrentAlignLine = linesToAlign.includes(i)
      const isNextAlignLine = linesToAlign.includes(i + 1)

      // 如果当前行和下一行都是对齐行,添加 \\
      if (isCurrentAlignLine && isNextAlignLine) {
        result.push(lineContent + ' \\\\')
      } else if (isCurrentAlignLine && !nextLine!.includes('\\end{')) {
        result.push(lineContent + ' \\\\')
      } else {
        result.push(lineContent)
      }
    } else {
      result.push(lineContent)
    }
  }

  // 去掉空行
  return result.filter(line => line.trim()).join('\n')
}
