import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { loadTier1 } from '../runner/context-loader.js'

const ROOT = process.cwd()

export function sessionStartBriefing(): string {
  const tier1 = loadTier1()

  const agentRegistry = existsSync(join(ROOT, 'AGENT_REGISTRY.md'))
    ? readFileSync(join(ROOT, 'AGENT_REGISTRY.md'), 'utf-8')
    : ''

  return `# Oturum Başlangıcı

Tier 1 bağlam yüklendi. Aşağıda projenin mevcut durumu yer alıyor.

${tier1}

---

## Aktif Ajanlar
${agentRegistry}

---

Bugün ne üzerinde çalışıyoruz?
`
}
