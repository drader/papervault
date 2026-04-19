import { readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { runAgent } from '../runner/index.js'

const AGENTS_DIR = join(process.cwd(), 'agents')
const ORCHESTRATOR_PATH = join(AGENTS_DIR, 'orchestrator')

// Called weekly by orchestrator heartbeat.
// Reads all agents' MEMORY.md files and runs the CONSOLIDATE skill
// to promote cross-agent patterns into wiki/concepts/.
export async function runConsolidation(): Promise<void> {
  const memorySummary = collectMemories()

  console.log(`[consolidator] Running consolidation across ${memorySummary.agents.length} agents`)

  await runAgent({
    agentId: 'orchestrator',
    agentPath: ORCHESTRATOR_PATH,
    schedule: '',
    tierOverride: memorySummary.paths,
  })
}

function collectMemories(): { agents: string[]; paths: string[] } {
  const agents: string[] = []
  const paths: string[] = []

  for (const entry of readdirSync(AGENTS_DIR)) {
    const agentPath = join(AGENTS_DIR, entry)
    if (!statSync(agentPath).isDirectory()) continue

    const memPath = join(agentPath, 'MEMORY.md')
    try {
      readFileSync(memPath, 'utf-8')
      agents.push(entry)
      paths.push(`agents/${entry}/MEMORY.md`)
    } catch {
      // No MEMORY.md — skip
    }
  }

  return { agents, paths }
}
