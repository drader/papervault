import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { estimateTokens, tierLimit } from '../budget/index.js'
import { HeartbeatConfig } from '../types/index.js'

const ROOT = process.cwd()

function readIfExists(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf-8') : ''
}

function recentJournalEntries(days = 3): string {
  const journalDir = join(ROOT, 'journal')
  if (!existsSync(journalDir)) return ''

  const cutoff = Date.now() - days * 86400_000
  return readdirSync(journalDir)
    .filter(f => f.endsWith('.md') && statSync(join(journalDir, f)).mtimeMs > cutoff)
    .map(f => readFileSync(join(journalDir, f), 'utf-8'))
    .join('\n\n')
}

function lastNLines(content: string, n: number): string {
  const lines = content.split('\n')
  return lines.slice(-n).join('\n')
}

export function loadTier1(): string {
  const limit = tierLimit(1)
  const parts: string[] = []
  let used = 0

  const files = [
    join(ROOT, 'memory/status.md'),
    join(ROOT, 'memory/decisions.md'),
    join(ROOT, 'memory/glossary.md'),
  ]

  for (const f of files) {
    const content = readIfExists(f)
    if (!content) continue
    const tokens = estimateTokens(content)
    if (used + tokens <= limit) {
      parts.push(`### ${f}\n${content}`)
      used += tokens
    }
  }

  // session-log: only last 10 lines to stay within budget
  const sessionLog = readIfExists(join(ROOT, 'memory/session-log.md'))
  const trimmedLog = lastNLines(sessionLog, 10)
  const logTokens = estimateTokens(trimmedLog)
  if (used + logTokens <= limit) {
    parts.push(`### memory/session-log.md (son 10 satır)\n${trimmedLog}`)
    used += logTokens
  }

  // ideas
  const ideas = readIfExists(join(ROOT, 'scratch/ideas.md'))
  if (ideas && used + estimateTokens(ideas) <= limit) {
    parts.push(`### scratch/ideas.md\n${ideas}`)
    used += estimateTokens(ideas)
  }

  // journal (last 3 days)
  const journal = recentJournalEntries(3)
  if (journal && used + estimateTokens(journal) <= limit) {
    parts.push(`### journal (son 3 gün)\n${journal}`)
  }

  return parts.join('\n\n---\n\n')
}

export function loadTier2(config: HeartbeatConfig): string {
  const limit = tierLimit(2)
  const parts: string[] = []
  let used = 0

  const files = [
    join(ROOT, 'wiki/index.md'),
    join(config.agentPath, 'AGENT.md'),
    join(config.agentPath, 'MEMORY.md'),
    ...(config.tierOverride ?? []).map(f => join(ROOT, f)),
  ]

  for (const f of files) {
    const content = readIfExists(f)
    if (!content) continue
    const tokens = estimateTokens(content)
    if (used + tokens <= limit) {
      parts.push(`### ${f}\n${content}`)
      used += tokens
    }
  }

  return parts.join('\n\n---\n\n')
}
