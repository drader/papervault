import type { DetectedInput } from './types.js'

const ARXIV_ID_RE = /(\d{4}\.\d{4,5}(?:v\d+)?)/

export function detectInput(raw: string): DetectedInput {
  const s = raw.trim()

  // arXiv URLs
  const arxivUrlPatterns = [
    /arxiv\.org\/abs\/(\d{4}\.\d{4,5}(?:v\d+)?)/i,
    /arxiv\.org\/pdf\/(\d{4}\.\d{4,5}(?:v\d+)?)/i,
    /ar5iv\.labs\.arxiv\.org\/html\/(\d{4}\.\d{4,5}(?:v\d+)?)/i,
  ]
  for (const re of arxivUrlPatterns) {
    const m = s.match(re)
    if (m) return { type: 'arxiv', raw: s, arxivId: m[1] }
  }

  // Bare arXiv ID: "2301.12345" or "2301.12345v2"
  if (ARXIV_ID_RE.test(s) && !s.includes('/') && !s.includes(' ')) {
    const m = s.match(ARXIV_ID_RE)!
    return { type: 'arxiv', raw: s, arxivId: m[1] }
  }

  // DOI URLs
  const doiUrlMatch = s.match(/doi\.org\/(.+)/i)
  if (doiUrlMatch) return { type: 'doi', raw: s, doi: doiUrlMatch[1] }

  // Bare DOI: starts with "10."
  if (/^10\.\d{4,}\/\S+/.test(s)) return { type: 'doi', raw: s, doi: s }

  // Generic URL
  if (s.startsWith('http://') || s.startsWith('https://')) {
    return { type: 'url', raw: s, url: s }
  }

  return { type: 'unknown', raw: s }
}

export function normalizeArxivId(raw: string): string {
  // Strip version suffix for source/html fetching
  return raw.replace(/v\d+$/, '')
}
