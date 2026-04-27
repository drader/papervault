import type { Adapter, DetectedInput, RawFetch, PaperMeta } from '../types.js'

// ACL Anthology — NLP papers, PDF + metadata (quality 1)
// Works for papers with ACL DOI (10.18653/...) or anthology ID in URL
export class AclAdapter implements Adapter {
  readonly name = 'acl'
  readonly quality = 1 as const

  canHandle(input: DetectedInput): boolean {
    if (input.doi?.startsWith('10.18653/')) return true
    if (input.url?.includes('aclanthology.org')) return true
    return false
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const anthologyId = resolveAnthologyId(input)
      if (!anthologyId) return null

      // ACL Anthology provides JSON metadata
      const metaUrl = `https://aclanthology.org/${anthologyId}.json`
      const metaRes = await fetch(metaUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })

      let meta: PaperMeta = { title: '', authors: [] }
      if (metaRes.ok) {
        const data = await metaRes.json() as AclMeta
        meta = aclToMeta(data, anthologyId)
      }

      // Fetch PDF
      const pdfUrl = `https://aclanthology.org/${anthologyId}.pdf`
      const pdfRes = await fetch(pdfUrl, { signal: controller.signal })
      if (pdfRes.ok) {
        const ct = pdfRes.headers.get('content-type') ?? ''
        if (ct.includes('pdf')) {
          const buffer = Buffer.from(await pdfRes.arrayBuffer())
          return { meta, binary: buffer, format: 'pdf', quality: 1, source: this.name }
        }
      }

      if (meta.title) {
        return { meta, content: meta.abstract ?? '', format: 'abstract', quality: 0, source: this.name }
      }

      return null
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}

interface AclMeta {
  title?: string
  author?: Array<{ full?: string; first?: string; last?: string }>
  year?: string
  venue?: string
  doi?: string
  abstract?: string
  url?: string
}

function aclToMeta(m: AclMeta, id: string): PaperMeta {
  return {
    title: m.title ?? '',
    authors: m.author?.map(a => a.full ?? [a.first, a.last].filter(Boolean).join(' ')) ?? [],
    year: m.year ? parseInt(m.year, 10) : undefined,
    venue: m.venue,
    doi: m.doi,
    abstract: m.abstract,
    url: `https://aclanthology.org/${id}`,
  }
}

function resolveAnthologyId(input: DetectedInput): string | null {
  // From DOI: 10.18653/v1/2023.acl-long.123 → 2023.acl-long.123
  if (input.doi?.startsWith('10.18653/')) {
    const parts = input.doi.split('/')
    return parts[parts.length - 1] ?? null
  }

  // From URL: https://aclanthology.org/2023.acl-long.123
  if (input.url) {
    const m = input.url.match(/aclanthology\.org\/([A-Z0-9][^/\s.]+)/i)
    return m?.[1] ?? null
  }

  return null
}
