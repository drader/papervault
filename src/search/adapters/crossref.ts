import type { SearchAdapter, SearchOptions, SearchResult } from '../types.js'

export class CrossrefSearchAdapter implements SearchAdapter {
  readonly name = 'crossref'

  constructor(private readonly email?: string) {}

  async search(keywords: string[], options: SearchOptions): Promise<SearchResult[]> {
    const { maxResults = 10, timeoutMs = 10_000 } = options
    const query = keywords.join(' ')

    const params = new URLSearchParams({
      query,
      rows:   String(maxResults),
      select: 'title,author,published,DOI,container-title,abstract',
    })
    const url = `https://api.crossref.org/works?${params}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    // Crossref polite pool: identify with mailto
    const mailto = this.email ?? 'papervault@example.com'
    const headers = { 'User-Agent': `papervault/0.1 (mailto:${mailto})` }

    try {
      const res = await fetch(url, { signal: controller.signal, headers })
      if (!res.ok) return []

      const data = await res.json() as { message?: { items?: CRWork[] } }
      return (data.message?.items ?? []).map(crToResult).filter(r => !!r.title)
    } catch {
      return []
    } finally {
      clearTimeout(timer)
    }
  }
}

interface CRWork {
  title?: string[]
  author?: Array<{ given?: string; family?: string }>
  published?: { 'date-parts'?: number[][] }
  DOI?: string
  'container-title'?: string[]
  abstract?: string
}

function crToResult(w: CRWork): SearchResult {
  const title   = w.title?.[0] ?? ''
  const authors = (w.author ?? []).map(a => [a.given, a.family].filter(Boolean).join(' '))
  const year    = w.published?.['date-parts']?.[0]?.[0]
  const doi     = w.DOI
  const venue   = w['container-title']?.[0]
  const abstract = w.abstract?.replace(/<[^>]+>/g, '') // strip JATS tags

  return {
    title,
    authors,
    year,
    venue,
    doi,
    abstract,
    url: doi ? `https://doi.org/${doi}` : undefined,
    source: 'crossref',
  }
}
