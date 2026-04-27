import type { SearchAdapter, SearchOptions, SearchResult } from '../types.js'

export class SemanticScholarSearchAdapter implements SearchAdapter {
  readonly name = 'semantic-scholar'

  constructor(private readonly apiKey?: string) {}

  async search(keywords: string[], options: SearchOptions): Promise<SearchResult[]> {
    const { maxResults = 10, timeoutMs = 10_000 } = options
    const query  = keywords.join(' ')
    const fields = 'title,authors,year,venue,externalIds,abstract,openAccessPdf'
    const url    = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&fields=${fields}&limit=${maxResults}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (this.apiKey) headers['x-api-key'] = this.apiKey

    try {
      const res = await fetch(url, { signal: controller.signal, headers })
      if (!res.ok) return []

      const data = await res.json() as { data?: SSPaper[] }
      return (data.data ?? []).map(ssToResult).filter(r => !!r.title)
    } catch {
      return []
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

function ssToResult(p: SSPaper): SearchResult {
  const arxivId = p.externalIds?.ArXiv
  const doi     = p.externalIds?.DOI
  return {
    title:   p.title ?? '',
    authors: p.authors?.map(a => a.name) ?? [],
    year:    p.year,
    venue:   p.venue,
    arxivId,
    doi,
    abstract: p.abstract,
    url: p.openAccessPdf?.url ?? (arxivId ? `https://arxiv.org/abs/${arxivId}` : undefined),
    source: 'semantic-scholar',
  }
}
