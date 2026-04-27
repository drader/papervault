import type { Adapter, DetectedInput, RawFetch, PaperMeta } from '../types.js'

// Semantic Scholar — resolves DOI to metadata + abstract, also discovers arXiv ID (quality 0)
export class SemanticScholarAdapter implements Adapter {
  readonly name = 'semantic-scholar'
  readonly quality = 0 as const

  canHandle(input: DetectedInput): boolean {
    return !!(input.doi || input.arxivId)
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const paperId = input.doi
      ? `DOI:${input.doi}`
      : `ARXIV:${input.arxivId}`

    const fields = 'title,authors,year,venue,externalIds,abstract,openAccessPdf'
    const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(paperId)}?fields=${fields}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) return null

      const data = await res.json() as SSPaper
      const meta = ssToMeta(data)
      if (!meta.title) return null

      return {
        meta,
        content: meta.abstract ?? '',
        format: 'abstract',
        quality: 0,
        source: this.name,
      }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}

interface SSPaper {
  title?: string
  authors?: Array<{ name: string }>
  year?: number
  venue?: string
  abstract?: string
  externalIds?: Record<string, string>
  openAccessPdf?: { url: string }
}

function ssToMeta(p: SSPaper): PaperMeta {
  return {
    title: p.title ?? '',
    authors: p.authors?.map(a => a.name) ?? [],
    year: p.year,
    venue: p.venue,
    abstract: p.abstract,
    arxivId: p.externalIds?.ArXiv,
    doi: p.externalIds?.DOI,
    url: p.openAccessPdf?.url,
  }
}
