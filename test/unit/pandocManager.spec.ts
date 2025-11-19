import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import { EventEmitter } from 'events'
import { existsSync, readFileSync } from 'node:fs'

class MockChildProcess extends EventEmitter {
  public stdout = new EventEmitter()
  public stderr = new EventEmitter()
  public stdin = {
    write: vi.fn(),
    end: vi.fn()
  }
  public kill = vi.fn()
}

type MockedProcess = MockChildProcess

const mockProcesses: MockedProcess[] = []

const spawnMock = vi.fn(() => {
  const proc = new MockChildProcess()
  mockProcesses.push(proc)
  return proc
})

vi.mock('child_process', () => ({
  spawn: spawnMock
}))

const { PandocManager } = await import('../../server/utils/pandocManager')

function detectDockerEnvironment(): boolean {
  if (process.env.FORCE_REAL_PANDOC === '1') {
    return true
  }
  try {
    if (existsSync('/.dockerenv')) {
      return true
    }
  } catch {}
  try {
    const content = readFileSync('/proc/1/cgroup', 'utf8')
    if (content.includes('docker') || content.includes('containerd')) {
      return true
    }
  } catch {}
  return false
}

const isDockerRuntime = detectDockerEnvironment()

function emitSuccess(proc: MockedProcess, output: string) {
  proc.stdout.emit('data', Buffer.from(output))
  proc.emit('close', 0)
}

async function startConversion(manager: PandocManager, latex: string, options?: Parameters<PandocManager['convert']>[1]) {
  const currentIndex = mockProcesses.length
  const promise = manager.convert(latex, options)
  await Promise.resolve()
  const proc = mockProcesses[currentIndex]
  if (!proc) {
    throw new Error('Mock process did not start')
  }
  return { promise, proc }
}

describe('PandocManager', () => {
  beforeEach(() => {
    mockProcesses.length = 0
    spawnMock.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllTimers()
  })

  it('converts latex via pandoc process and trims stdout', async () => {
    const manager = new PandocManager(2)
    const { promise, proc } = await startConversion(manager, 'x + y')
    emitSuccess(proc, '  converted ')
    await expect(promise).resolves.toBe('converted')
    expect(proc.stdin.write).toHaveBeenCalledWith('x + y')
    expect(proc.stdin.end).toHaveBeenCalled()
  })

  it('rejects when pandoc exits with non-zero code', async () => {
    const manager = new PandocManager(1)
    const { promise, proc } = await startConversion(manager, '\\frac{1}{2}')
    proc.stderr.emit('data', Buffer.from('boom'))
    proc.emit('close', 1)
    await expect(promise).rejects.toThrow(/pandoc conversion failed/i)
  })

  it('rejects when spawn emits error', async () => {
    const manager = new PandocManager(1)
    const { promise, proc } = await startConversion(manager, 'bad input')
    proc.emit('error', new Error('spawn failed'))
    await expect(promise).rejects.toThrow(/failed to start pandoc/i)
  })

  it('enforces concurrency limits by deferring queued conversions', async () => {
    const manager = new PandocManager(2)
    const { promise: p1, proc: proc1 } = await startConversion(manager, 'a')
    const { promise: p2, proc: proc2 } = await startConversion(manager, 'b')
    const p3Promise = manager.convert('c')

    expect(spawnMock).toHaveBeenCalledTimes(2)

    emitSuccess(proc1, 'a')
    await p1
    await Promise.resolve()
    expect(spawnMock).toHaveBeenCalledTimes(3)
    const proc3 = mockProcesses[2]
    if (!proc3) {
      throw new Error('Third process was not created')
    }

    emitSuccess(proc2, 'b')
    emitSuccess(proc3, 'c')

    await expect(p1).resolves.toBe('a')
    await expect(p2).resolves.toBe('b')
    await expect(p3Promise).resolves.toBe('c')
  })

  it('times out long running conversions', async () => {
    vi.useFakeTimers()
    const manager = new PandocManager(1)
    const { promise } = await startConversion(manager, 'slow', { timeout: 50 })
    vi.advanceTimersByTime(60)
    await expect(promise).rejects.toThrow(/timeout/i)
  })
})

describe.runIf(isDockerRuntime)('PandocManager real process (docker only)', () => {
  let RealPandocManager: typeof PandocManager

  beforeAll(async () => {
    vi.resetModules()
    vi.doUnmock('child_process')
    const mod = await import('../../server/utils/pandocManager')
    RealPandocManager = mod.PandocManager
  })

  it('executes real pandoc conversion', async () => {
    const manager = new RealPandocManager(1)
    const latex = '\\begin{equation}a + b = c\\end{equation}'
    const output = await manager.convert(latex, { timeout: 15000 })
    expect(output).toMatch(/a\s*\+\s*b/)
  })
})

