import matter from 'gray-matter'
import { readFileSync, existsSync } from 'fs'
import { HeartbeatConfig } from '../types/index.js'

export function parseHeartbeat(agentPath: string): HeartbeatConfig | null {
  const heartbeatPath = `${agentPath}/HEARTBEAT.md`
  if (!existsSync(heartbeatPath)) return null

  const raw = readFileSync(heartbeatPath, 'utf-8')
  const { data } = matter(raw)

  if (!data.schedule) return null

  const agentId = agentPath.split('/').pop() ?? 'unknown'

  return {
    agentId,
    agentPath,
    schedule: data.schedule,
    tokenLimit: data.token_limit,
    tierOverride: data.tier_override ?? [],
  }
}
