import type { Adapter, DetectedInput, RawFetch, PaperMeta } from '../types.js'

// Zenodo — OA repository with PDFs and metadata (quality 1)
export class ZenodoAdapter implements Adapter {
  readonly name = 'zenodo'
  readonly quality = 1 as const

  canHandle(input: DetectedInput): boolean {
    return !!(input.doi)
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      // Search Zenodo by DOI
      const query = encodeURIComponent(`doi:"${input.doi}"`)
      const url = `https://zenodo.org/api/records?q=${query}&size=1`

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) return null

      const data = await res.json() as ZenodoSearchResult
      const hit = data.hits?.hits?.[0]
      if (!hit) return null

      const meta = zenodoToMeta(hit)

      // Find PDF file
      const pdfFile = hit.files?.find(f => f.type === 'pdf' || f.key?.endsWith('.pdf'))
      if (pdfFile?.links?.self) {
        const pdfRes = await fetch(pdfFile.links.self, { signal: controller.signal })
        if (pdfRes.ok) {
          const buffer = Buffer.from(await pdfRes.arrayBuffer())
          return { meta, binary: buffer, format: 'pdf', quality: 1, source: this.name }
        }
      }

      // Fall back to abstract
      if (meta.abstract) {
        return {
          meta,
          content: meta.abstract,
          format: 'abstract',
          quality: 0,
          source: this.name,
        }
      }

      return null
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}

interface ZenodoRecord {
  metadata?: {
    title?: string
    creators?: Array<{ name?: string }>
    publication_date?: string
    doi?: string
    description?: string
    journal?: { title?: string }
  }
  files?: Array<{ key?: string; type?: string; links?: { self?: string } }>
}

interface ZenodoSearchResult {
  hits?: { hits?: ZenodoRecord[] }
}

function zenodoToMeta(r: ZenodoRecord): PaperMeta {
  const m = r.metadata ?? {}
  const year = m.publication_date ? parseInt(m.publication_date.slice(0, 4), 10) : undefined
  return {
    title: m.title ?? '',
    authors: m.creators?.map(c => c.name ?? '').filter(Boolean) ?? [],
    year: isNaN(year as number) ? undefined : year,
    venue: m.journal?.title,
    doi: m.doi,
    abstract: m.description?.replace(/<[^>]+>/g, ' ').trim(),
  }
}
