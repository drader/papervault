import type { Adapter, DetectedInput, RawFetch, PaperMeta } from '../types.js'

// CORE — OA full text PDFs + metadata (quality 1 for PDF, 0 for abstract)
// Requires free API key from core.ac.uk
export class CoreAdapter implements Adapter {
  readonly name = 'core'
  readonly quality = 1 as const

  constructor(private readonly apiKey: string) {}

  canHandle(input: DetectedInput): boolean {
    return !!this.apiKey && !!(input.doi || input.arxivId)
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const query = input.doi
        ? `doi:"${input.doi}"`
        : `arxivId:${input.arxivId}`

      const searchUrl = `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&limit=1`
      const res = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      })
      if (!res.ok) return null

      const data = await res.json() as CoreSearchResult
      const hit = data.results?.[0]
      if (!hit) return null

      const meta = coreToMeta(hit)

      // Try to get PDF
      const pdfUrl = hit.downloadUrl ?? hit.sourceFulltextUrls?.[0]
      if (pdfUrl) {
        const pdfRes = await fetch(pdfUrl, { signal: controller.signal })
        if (pdfRes.ok) {
          const ct = pdfRes.headers.get('content-type') ?? ''
          if (ct.includes('pdf')) {
            const buffer = Buffer.from(await pdfRes.arrayBuffer())
            return { meta, binary: buffer, format: 'pdf', quality: 1, source: this.name }
          }
        }
      }

      // Fall back to abstract
      if (hit.abstract) {
        return {
          meta,
          content: hit.abstract,
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

interface CoreWork {
  title?: string
  authors?: Array<{ name?: string }>
  yearPublished?: number
  publisher?: string
  doi?: string
  abstract?: string
  downloadUrl?: string
  sourceFulltextUrls?: string[]
}

interface CoreSearchResult {
  results?: CoreWork[]
}

function coreToMeta(w: CoreWork): PaperMeta {
  return {
    title: w.title ?? '',
    authors: w.authors?.map(a => a.name ?? '').filter(Boolean) ?? [],
    year: w.yearPublished,
    venue: w.publisher,
    doi: w.doi,
    abstract: w.abstract,
  }
}
