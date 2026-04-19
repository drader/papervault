import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { validateWikiPage, ValidationResult } from './frontmatter.js'

const WIKI_DIR = join(process.cwd(), 'wiki')
const SKIP_DIRS = new Set(['raw', 'archive', '_seed'])

export function validateWiki(): ValidationResult[] {
  const results: ValidationResult[] = []
  scanDir(WIKI_DIR, results)
  return results.filter(r => !r.valid)
}

function scanDir(dir: string, results: ValidationResult[]): void {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (!SKIP_DIRS.has(entry)) scanDir(fullPath, results)
      continue
    }

    if (!entry.endsWith('.md') || entry === 'index.md' || entry === 'log.md') continue

    const content = readFileSync(fullPath, 'utf-8')
    results.push(validateWikiPage(fullPath, content))
  }
}
