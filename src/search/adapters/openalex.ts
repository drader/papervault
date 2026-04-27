import type { SearchAdapter, SearchOptions, SearchResult } from '../types.js'

export class OpenAlexSearchAdapter implements SearchAdapter {
  readonly name = 'openalex'

  async search(keywords: string[], options: SearchOptions): Promise<SearchResult[]> {
    const { maxResults = 10, timeoutMs = 10_000 } = options
    const query = keywords.join(' ')
    const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${maxResults}&filter=type:article&select=title,doi,authorships,publication_year,primary_location,abstract_inverted_index,ids`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) return []

      const data = await res.json() as { results?: OAWork[] }
      return (data.results ?? []).map(oaToResult).filter(r => !!r.title)
    } catch {
      return []
    } finally {
      clearTimeout(timer)
    }
  }
}

interface OAWork {
  title?: string
  doi?: string
  publication_year?: number
  authorships?: Array<{ author?: { display_name?: string } }>
  primary_location?: { source?: { display_name?: string } }
  abstract_inverted_index?: Record<string, number[]>
  ids?: { arxiv?: string; doi?: string }
}

function oaToResult(w: OAWork): SearchResult {
  const abstract = w.abstract_inverted_index
    ? invertedIndexToText(w.abstract_inverted_index)
    : undefined

  const doi = (w.ids?.doi ?? w.doi)?.replace('https://doi.org/', '')
  const arxivUrl = w.ids?.arxiv ?? ''
  const arxivId  = arxivUrl.replace('https://arxiv.org/abs/', '') || undefined

  return {
    title:   w.title ?? '',
    authors: w.authorships?.map(a => a.author?.display_name ?? '').filter(Boolean) ?? [],
    year:    w.publication_year,
    venue:   w.primary_location?.source?.display_name,
    doi,
    arxivId,
    abstract,
    url: arxivId ? `https://arxiv.org/abs/${arxivId}` : doi ? `https://doi.org/${doi}` : undefined,
    source: 'openalex',
  }
}

function invertedIndexToText(index: Record<string, number[]>): string {
  const words: string[] = []
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) words[pos] = word
  }
  return words.filter(Boolean).join(' ')
}
