import { appendFileSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

const ROOT = process.cwd()

export function logSessionEnd(summary: string): void {
  const date = new Date().toISOString().slice(0, 10)
  const logPath = join(ROOT, 'memory/session-log.md')
  const entry = `\n## [${date}] session-end\n${summary}\n`
  appendFileSync(logPath, entry)
}

export function updateStatus(newStatus: string): void {
  const statusPath = join(ROOT, 'memory/status.md')
  const date = new Date().toISOString().slice(0, 10)
  const content = `# Proje Durumu\n_Son güncelleme: ${date}_\n\n${newStatus}\n`
  writeFileSync(statusPath, content)
}

// Verify that all [[wikilinks]] in the wiki point to existing files
export function checkWikilinks(): string[] {
  const broken: string[] = []
  const wikiDir = join(ROOT, 'wiki')
  if (!existsSync(wikiDir)) return broken

  // Basic check: find [[link]] patterns and verify file existence
  const scanDir = (dir: string) => {
    const { readdirSync, statSync } = require('fs')
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry)
      if (statSync(fullPath).isDirectory()) { scanDir(fullPath); continue }
      if (!entry.endsWith('.md')) continue

      const content = readFileSync(fullPath, 'utf-8')
      const links = [...content.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1])

      for (const link of links) {
        const target = join(wikiDir, `${link}.md`)
        if (!existsSync(target)) broken.push(`${fullPath} → [[${link}]]`)
      }
    }
  }

  scanDir(wikiDir)
  return broken
}
