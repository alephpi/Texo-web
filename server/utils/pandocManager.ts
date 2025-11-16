/**
 * External pandoc process manager module
 */
import type { PandocConvertOption} from "../../app/composables/types/pandoc";
import {spawn, type ChildProcess} from 'child_process';
import pLimit from 'p-limit'

export class PandocManager {
    private _concurrencyLimit: ReturnType<typeof pLimit>

    constructor(concurrency: number = 3){
        this._concurrencyLimit = pLimit(concurrency)
    }

    /**
     * Convert Latex to Typst
     */
    public async convert(latex: string, options: PandocConvertOption = {}): Promise<string>{
        return this._concurrencyLimit(async () => {
            return new Promise<string>((resolve, reject) => {
                const timeout = options.timeout || 10000
                const from = options.from || 'latex'
                const to = options.to || 'typst'
                const extraArgs = options.extraArgs || []

                const process = spawn('pandoc',[`--from=${from}`, `--to=${to}`, '--wrap=none',...extraArgs],{stdio: ['pipe','pipe','pipe']})
                let stdoutBuffer = ''
                let stderrBuffer = ''

                const timeoutId = setTimeout(() => {
                    process.kill('SIGTERM')
                    reject(new Error(`Pandoc convertion timeout after ${timeout}ms`))
                }, timeout)
                process.stdout?.on('data', (data: Buffer) => {stdoutBuffer += data.toString()})
                process.stderr?.on('data', (data: Buffer) => {stderrBuffer += data.toString()})
                process.on('close',(code) => {
                    clearTimeout(timeoutId)
                    if (code === 0) {
                        resolve(stdoutBuffer.trim())
                    } else {
                        reject(new Error(
                            `Pandoc conversion failed (code ${code}): ${stderrBuffer || 'Unknown error'}`
                        ))
                    }
                })
                process.on('error', (error) => {
                    clearTimeout(timeoutId)
                    reject(new Error(`Failed to start Pandoc: ${error.message}`))
                })
                if (process.stdin){
                    process.stdin.write(latex)
                    process.stdin.end()
                }
            })
        })
    }

    public getQueueStatus(): {
        pending: number
        active: number      
        total: number       
        isIdle: boolean   
    } {
        const pending = this._concurrencyLimit.pendingCount ?? 0
        const active = this._concurrencyLimit.activeCount ?? 0
        
        return {
            pending,
            active,
            total: pending + active,
            isIdle: pending === 0 && active === 0
        }
    }
    
}

let pandocManager: PandocManager | null = null
export function getPandocManager(): PandocManager{
    if (!pandocManager){
        pandocManager = new PandocManager(3)
    }
    return pandocManager
}