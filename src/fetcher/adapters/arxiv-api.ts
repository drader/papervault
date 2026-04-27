import type { Adapter, DetectedInput, RawFetch, PaperMeta } from '../types.js'

// arXiv Atom API — metadata + abstract only (quality 0)
export class ArxivApiAdapter implements Adapter {
  readonly name = 'arxiv-api'
  readonly quality = 0 as const

  canHandle(input: DetectedInput): boolean {
    return !!input.arxivId
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const id = input.arxivId!
    const url = `https://export.arxiv.org/api/query?id_list=${id}&max_results=1`

    const res = await fetchWithTimeout(url, timeoutMs)
    if (!res.ok) return null

    const xml = await res.text()
    const meta = parseAtomEntry(xml)
    if (!meta) return null

    return {
      meta,
      content: meta.abstract ?? '',
      format: 'abstract',
      quality: 0,
      source: this.name,
    }
  }
}

function parseAtomEntry(xml: string): PaperMeta | null {
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1]
  if (!entry) return null

  const title = decodeEntities(
    entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() ?? '',
  ).replace(/\s+/g, ' ')

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
  const doi = entry.match(/<arxiv:doi[^>]*>([\s\S]*?)<\/arxiv:doi>/)?.[1]?.trim()

  const categories: string[] = []
  for (const m of entry.matchAll(/term="([^"]+)"/g)) {
    categories.push(m[1])
  }

  const venue = entry.match(/<arxiv:journal_ref[^>]*>([\s\S]*?)<\/arxiv:journal_ref>/)?.[1]?.trim()

  if (!title) return null

  return {
    title,
    authors,
    year: isNaN(year as number) ? undefined : year,
    venue,
    arxivId,
    doi,
    abstract,
    categories,
    url: arxivId ? `https://arxiv.org/abs/${arxivId}` : undefined,
  }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}
