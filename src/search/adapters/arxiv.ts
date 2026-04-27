import type { SearchAdapter, SearchOptions, SearchResult } from '../types.js'

export class ArxivSearchAdapter implements SearchAdapter {
  readonly name = 'arxiv'

  async search(keywords: string[], options: SearchOptions): Promise<SearchResult[]> {
    const { maxResults = 10, timeoutMs = 10_000 } = options
    const query = keywords.join(' AND ')
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}&sortBy=relevance`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) return []

      const xml = await res.text()
      return parseAtomFeed(xml)
    } catch {
      return []
    } finally {
      clearTimeout(timer)
    }
  }
}

function parseAtomFeed(xml: string): SearchResult[] {
  const results: SearchResult[] = []
  const entries = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)

  for (const [, entry] of entries) {
    const title = decodeEntities(
      entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? '',
    ).replace(/\s+/g, ' ')

    if (!title) continue

    const abstract = decodeEntities(
      entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]?.trim() ?? '',
    ).replace(/\s+/g, ' ')

    const authors: string[] = []
    for (const m of entry.matchAll(/<name>([\s\S]*?)<\/name>/g)) {
      authors.push(m[1].trim())
    }

    const published = entry.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() ?? ''
    const year = published ? parseInt(published.slice(0, 4), 10) : undefined

    const arxivId = entry.match(/<id>.*?abs\/([^<\s]+)<\/id>/)?.[1]?.trim()
    const doi     = entry.match(/<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/)?.[1]?.trim()
    const venue   = entry.match(/<arxiv:journal_ref[^>]*>([\s\S]*?)<\/arxiv:journal_ref>/)?.[1]?.trim()

    results.push({
      title,
      authors,
      year: year && !isNaN(year) ? year : undefined,
      venue,
      arxivId,
      doi,
      abstract,
      url: arxivId ? `https://arxiv.org/abs/${arxivId}` : undefined,
      source: 'arxiv',
    })
  }

  return results
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
