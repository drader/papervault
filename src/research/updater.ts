import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import type { ResearchUpdate } from './llm.js'

const ROOT = join(__dirname, '..', '..')

function researchPath(topic: string, file: string): string {
  return join(ROOT, 'research', topic, file)
}

export function readResearchFiles(topic: string) {
  const read = (file: string) => readFileSync(researchPath(topic, file), 'utf-8')
  return {
    index:      read('index.md'),
    candidates: read('candidates.md'),
    log:        read('log.md'),
  }
}

function insertRowInSection(content: string, sectionHeader: string, newRow: string): string {
  const lines = content.split('\n')
  let inSection = false
  let lastTableRow = -1

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ') && lines[i].includes(sectionHeader)) {
      inSection = true
      continue
    }
    if (inSection && lines[i].startsWith('## ')) break
    if (inSection && lines[i].startsWith('|')) lastTableRow = i
  }

  if (lastTableRow === -1) return content
  lines.splice(lastTableRow + 1, 0, newRow)
  return lines.join('\n')
}

function updateFrontmatterDate(content: string, date: string): string {
  return content.replace(/^last_researched:.*$/m, `last_researched: ${date}`)
}

export function applyUpdates(topic: string, updates: ResearchUpdate, date: string): void {
  let candidates = readFileSync(researchPath(topic, 'candidates.md'), 'utf-8')
  for (const p of updates.new_candidates) {
    const row = `| ${p.title} | ${p.venue_year} | ${p.authors} | ${p.identifier} | ☐ |`
    candidates = insertRowInSection(candidates, p.section, row)
  }
  writeFileSync(researchPath(topic, 'candidates.md'), candidates)

  const index = readFileSync(researchPath(topic, 'index.md'), 'utf-8')
  writeFileSync(researchPath(topic, 'index.md'), updateFrontmatterDate(index, date))

  const logEntry = `\n## [${date}] research | ${updates.log_entry}\nYeni aday: ${updates.new_candidates.length}\n`
  const logPath = researchPath(topic, 'log.md')
  writeFileSync(logPath, readFileSync(logPath, 'utf-8') + logEntry)
}

export function commitChanges(topic: string, date: string): void {
  execSync(`git -C "${ROOT}" add research/${topic}/`, { stdio: 'inherit' })
  const status = execSync(`git -C "${ROOT}" status --porcelain research/${topic}/`).toString().trim()
  if (!status) { console.log('No changes to commit.'); return }
  execSync(`git -C "${ROOT}" commit -m "research(${topic}): update ${date}"`, { stdio: 'inherit' })
  execSync(`git -C "${ROOT}" push`, { stdio: 'inherit' })
}
