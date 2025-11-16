export enum PandocStatus {
  Ready = 'ready',
  Processing = 'processing',
  Result = 'result',
  Error = 'error',
  Timeout = 'timeout'
}

export type PandocConvertOption = {
    from?: string
    to?: string
    extraArgs?: string[]
    timeout?: number
    key?: string
}

export enum Latex2TypstTool {
  Tex2Typst = 'tex2typst',
  Pandoc = 'pandoc',
}
