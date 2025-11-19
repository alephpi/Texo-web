import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { convertToTypst, __resetConvertCache, __setConvertClientMode } from '../../app/composables/textProcessor'
import { Latex2TypstTool } from '../../app/composables/types/pandoc'

const successResponse = { success: true, output: 'typst-output' }

describe('convertToTypst cache behavior (nuxt env)', () => {
  let fetchStub: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchStub = vi.fn().mockResolvedValue(successResponse)
    vi.stubGlobal('$fetch', fetchStub)
    __resetConvertCache()
    __setConvertClientMode(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    __resetConvertCache()
    __setConvertClientMode(null)
  })

  it('reuses cache for the same client and same payload', async () => {
    const first = await convertToTypst('\\alpha', Latex2TypstTool.Pandoc)
    const second = await convertToTypst('\\alpha')

    expect(first).toBe('typst-output')
    expect(second).toBe('typst-output')
    expect(fetchStub).toHaveBeenCalledTimes(1)
  })

  it('does not share cache across simulated clients (cache reset)', async () => {
    await convertToTypst('\\alpha')
    __resetConvertCache()
    const fresh = await convertToTypst('\\alpha')

    expect(fresh).toBe('typst-output')
    expect(fetchStub).toHaveBeenCalledTimes(2)
  })

  it('does not cache when payload differs', async () => {
    await convertToTypst('\\alpha')
    await convertToTypst('\\beta + 1')

    expect(fetchStub).toHaveBeenCalledTimes(2)
  })

  it('bypasses cache when forced into non-client mode', async () => {
    __setConvertClientMode(false)
    fetchStub.mockResolvedValueOnce({ success: true, output: 'first' })
    fetchStub.mockResolvedValueOnce({ success: true, output: 'second' })

    const first = await convertToTypst('\\gamma')
    const second = await convertToTypst('\\gamma')

    expect(first).toBe('first')
    expect(second).toBe('second')
    expect(fetchStub).toHaveBeenCalledTimes(2)
  })

  it('treats same payload as cached even if representing multiple clients in one session', async () => {
    const simulatedClients = ['client-a', 'client-b']
    for (const client of simulatedClients) {
      const result = await convertToTypst('\\delta')
      expect(result).toBe('typst-output')
    }
    expect(fetchStub).toHaveBeenCalledTimes(1)
  })
})

