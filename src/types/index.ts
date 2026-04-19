export interface HeartbeatConfig {
  agentId: string
  agentPath: string
  schedule: string           // cron expression
  tokenLimit?: number
  tierOverride?: string[]    // extra files to load this cycle
}

export interface WikiPage {
  path: string
  title: string
  tags: string[]
  source?: string
  date: string
  status: 'active' | 'stale' | 'archived'
  content: string
}

export interface ConsolidationCandidate {
  pattern: string
  agentIds: string[]
  firstSeen: string
  wikiPage: string | null
}

export type Tier = 1 | 2 | 3

export interface ContextFile {
  path: string
  tier: Tier
  tokenEstimate: number
}

export interface RunnerResult {
  agentId: string
  stdout: string
  exitCode: number
  durationMs: number
}
