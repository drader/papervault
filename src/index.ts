import 'node:process'
import { startScheduler } from './scheduler/index.js'
import { validateWiki } from './validator/index.js'

async function main() {
  console.log('[memex] Starting...')

  // Validate wiki on startup, report issues but don't block
  const issues = validateWiki()
  if (issues.length > 0) {
    console.warn(`[memex] ${issues.length} wiki page(s) have schema issues:`)
    issues.forEach(i => console.warn(`  ${i.path} — missing: ${i.missing.join(', ')}`))
  }

  // Start scheduler — reads all agents/*/HEARTBEAT.md and registers cron jobs
  startScheduler()

  console.log('[memex] Daemon running. Press Ctrl+C to stop.')
}

main().catch(err => {
  console.error('[memex] Fatal error:', err)
  process.exit(1)
})
