export type { SearchResult, SearchOptions, SearchAdapter } from './types.js'
export { runSearch } from './runner.js'

import type { SearchResult } from './types.js'

export function formatForLLM(results: SearchResult[]): string {
  return results
    .filter(r => !!r.title)
    .map(r => {
      const id      = r.arxivId ? `arXiv:${r.arxivId}` : r.doi ? `DOI:${r.doi}` : ''
      const authors = r.authors.slice(0, 3).join(', ') + (r.authors.length > 3 ? ' et al.' : '')
      const venue   = [r.venue, r.year].filter(Boolean).join(', ')
      const lines   = [
        `- ${r.title}`,
        `  Authors: ${authors}`,
        venue   ? `  Venue: ${venue}`   : '',
        id      ? `  ID: ${id}`         : '',
        r.abstract ? `  Abstract: ${r.abstract.slice(0, 300)}${r.abstract.length > 300 ? '…' : ''}` : '',
        `  Source: ${r.source}`,
      ]
      return lines.filter(Boolean).join('\n')
    })
    .join('\n\n')
}
