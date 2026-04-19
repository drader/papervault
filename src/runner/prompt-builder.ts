import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { HeartbeatConfig } from '../types/index.js'
import { loadTier1, loadTier2 } from './context-loader.js'

export function buildPrompt(config: HeartbeatConfig): string {
  const heartbeatPath = join(config.agentPath, 'HEARTBEAT.md')
  const heartbeat = existsSync(heartbeatPath)
    ? readFileSync(heartbeatPath, 'utf-8')
    : ''

  const rulesPath = join(config.agentPath, 'RULES.md')
  const rules = existsSync(rulesPath)
    ? readFileSync(rulesPath, 'utf-8')
    : ''

  const tier1 = loadTier1()
  const tier2 = loadTier2(config)

  return `# Ajan: ${config.agentId}
Sen bu sistemin ${config.agentId} ajanısın.

## Kurallar
${rules}

## Bu Döngüde Yapılacaklar (HEARTBEAT)
${heartbeat}

---

## Tier 1 Bağlam (Her Oturumda)
${tier1}

---

## Tier 2 Bağlam (Bu Ajan İçin)
${tier2}

---

Yukarıdaki HEARTBEAT talimatlarını şimdi uygula.
Her adımı tamamladıkça wiki/log.md ve journal/'a kaydet.
`
}
