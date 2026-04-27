import type { SearchResult } from './types.js'

function normalizeDoi(doi: string): string {
  return doi.toLowerCase().replace(/^https?:\/\/doi\.org\//, '').trim()
}

function normalizeArxivId(id: string): string {
  // strip version suffix: 2301.12345v2 → 2301.12345
  return id.replace(/v\d+$/, '').trim()
}

export function deduplicate(results: SearchResult[]): SearchResult[] {
  const seenDoi  = new Set<string>()
  const seenArxiv = new Set<string>()
  const out: SearchResult[] = []

  for (const r of results) {
    const doi    = r.doi    ? normalizeDoi(r.doi)           : null
    const arxiv  = r.arxivId ? normalizeArxivId(r.arxivId) : null

    if (doi    && seenDoi.has(doi))    continue
    if (arxiv  && seenArxiv.has(arxiv)) continue

    if (doi)   seenDoi.add(doi)
    if (arxiv) seenArxiv.add(arxiv)

    out.push(r)
  }

  return out
}
