import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import { buildPrompt } from './prompt-builder.js'
import { HeartbeatConfig, RunnerResult } from '../types/index.js'

const execFileAsync = promisify(execFile)
const LOGS_DIR = join(process.cwd(), 'logs')

export async function runAgent(config: HeartbeatConfig): Promise<RunnerResult> {
  const start = Date.now()
  const prompt = buildPrompt(config)

  if (!existsSync(LOGS_DIR)) mkdirSync(LOGS_DIR, { recursive: true })

  try {
    const { stdout } = await execFileAsync('claude', [
      '--print',
      '--output-format', 'text',
      prompt,
    ], { timeout: 300_000 }) // 5 min timeout

    const duration = Date.now() - start
    logRun(config.agentId, stdout, duration)

    return { agentId: config.agentId, stdout, exitCode: 0, durationMs: duration }
  } catch (err: unknown) {
    const error = err as { message?: string; code?: number }
    const duration = Date.now() - start
    const msg = error.message ?? 'Unknown error'
    logRun(config.agentId, `ERROR: ${msg}`, duration)

    return { agentId: config.agentId, stdout: msg, exitCode: error.code ?? 1, durationMs: duration }
  }
}

function logRun(agentId: string, output: string, durationMs: number): void {
  const date = new Date().toISOString().slice(0, 10)
  const logPath = join(LOGS_DIR, `${date}-${agentId}.log`)
  const entry = `[${new Date().toISOString()}] (${durationMs}ms)\n${output}\n\n`
  writeFileSync(logPath, entry, { flag: 'a' })
}
