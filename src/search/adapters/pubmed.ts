import type { SearchAdapter, SearchOptions, SearchResult } from '../types.js'

const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'

export class PubMedSearchAdapter implements SearchAdapter {
  readonly name = 'pubmed'

  async search(keywords: string[], options: SearchOptions): Promise<SearchResult[]> {
    const { maxResults = 10, timeoutMs = 10_000 } = options
    const query = keywords.join(' ')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      // Step 1: search → get IDs
      const searchUrl = `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`
      const searchRes = await fetch(searchUrl, { signal: controller.signal })
      if (!searchRes.ok) return []

      const searchData = await searchRes.json() as { esearchresult?: { idlist?: string[] } }
      const ids = searchData.esearchresult?.idlist ?? []
      if (ids.length === 0) return []

      // Step 2: summary → get metadata
      const summaryUrl = `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
      const summaryRes = await fetch(summaryUrl, { signal: controller.signal })
      if (!summaryRes.ok) return []

      const summaryData = await summaryRes.json() as PubMedSummaryResponse
      const uids = summaryData.result?.uids ?? []

      const results: SearchResult[] = []
      for (const uid of uids) {
        const doc = summaryData.result[uid]
        if (!doc) continue

        const authors = (doc.authors ?? [])
          .filter(a => a.authtype === 'Author')
          .map(a => a.name)

        const year = doc.pubdate ? parseInt(doc.pubdate.slice(0, 4), 10) : undefined
        const title = doc.title ?? ''
        if (!title) continue

        results.push({
          title,
          authors,
          year:    year && !isNaN(year) ? year : undefined,
          venue:   doc.source,
          doi:     doc.elocationid?.startsWith('doi:') ? doc.elocationid.slice(4) : undefined,
          url:     `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
          source:  'pubmed',
        })
      }
      return results
    } catch {
      return []
    } finally {
      clearTimeout(timer)
    }
  }
}

interface PubMedDoc {
  title?: string
  authors?: Array<{ name: string; authtype: string }>
  pubdate?: string
  source?: string
  elocationid?: string
}

interface PubMedSummaryResponse {
  result: Record<string, PubMedDoc> & { uids?: string[] }
}
