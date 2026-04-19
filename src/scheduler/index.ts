import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import cron from 'node-cron'
import { parseHeartbeat } from './parser.js'
import { runAgent } from '../runner/index.js'
import { HeartbeatConfig } from '../types/index.js'

const AGENTS_DIR = join(process.cwd(), 'agents')

export function discoverAgents(): HeartbeatConfig[] {
  const configs: HeartbeatConfig[] = []

  for (const entry of readdirSync(AGENTS_DIR)) {
    const agentPath = join(AGENTS_DIR, entry)
    if (!statSync(agentPath).isDirectory()) continue

    const config = parseHeartbeat(agentPath)
    if (config) configs.push(config)
  }

  return configs
}

export function startScheduler(): void {
  const agents = discoverAgents()

  if (agents.length === 0) {
    console.log('[scheduler] No agents with valid HEARTBEAT.md found.')
    return
  }

  for (const agent of agents) {
    if (!cron.validate(agent.schedule)) {
      console.warn(`[scheduler] Invalid cron expression for ${agent.agentId}: ${agent.schedule}`)
      continue
    }

    cron.schedule(agent.schedule, async () => {
      console.log(`[scheduler] Triggering ${agent.agentId}`)
      await runAgent(agent)
    })

    console.log(`[scheduler] ${agent.agentId} scheduled: ${agent.schedule}`)
  }
}
