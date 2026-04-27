import type { Adapter, DetectedInput, RawFetch, PaperMeta } from '../types.js'

// OpenAlex — metadata + abstract + OA PDF link discovery (quality 0 for metadata, 1 for PDF)
export class OpenAlexAdapter implements Adapter {
  readonly name = 'openalex'
  readonly quality = 0 as const

  canHandle(input: DetectedInput): boolean {
    return !!(input.doi || input.arxivId)
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const workId = input.doi
        ? `https://doi.org/${input.doi}`
        : `https://arxiv.org/abs/${input.arxivId}`

      const url = `https://api.openalex.org/works/${encodeURIComponent(workId)}`
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) return null

      const data = await res.json() as OAWork
      const meta = oaToMeta(data)
      if (!meta.title) return null

      // If there's a direct PDF, fetch it
      const pdfUrl = data.open_access?.oa_url
      if (pdfUrl && pdfUrl.endsWith('.pdf')) {
        const pdfRes = await fetch(pdfUrl, { signal: controller.signal })
        if (pdfRes.ok) {
          const ct = pdfRes.headers.get('content-type') ?? ''
          if (ct.includes('pdf')) {
            const buffer = Buffer.from(await pdfRes.arrayBuffer())
            return { meta, binary: buffer, format: 'pdf', quality: 1, source: this.name }
          }
        }
      }

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

interface OAWork {
  title?: string
  publication_year?: number
  doi?: string
  abstract_inverted_index?: Record<string, number[]>
  authorships?: Array<{ author?: { display_name?: string } }>
  primary_location?: { source?: { display_name?: string } }
  open_access?: { oa_url?: string }
  ids?: { arxiv?: string; doi?: string }
}

function oaToMeta(w: OAWork): PaperMeta {
  const abstract = w.abstract_inverted_index
    ? invertedIndexToText(w.abstract_inverted_index)
    : undefined

  const doi = w.ids?.doi?.replace('https://doi.org/', '') ?? w.doi
  const arxivUrl = w.ids?.arxiv ?? ''
  const arxivId = arxivUrl.replace('https://arxiv.org/abs/', '')

  return {
    title: w.title ?? '',
    authors: w.authorships?.map(a => a.author?.display_name ?? '').filter(Boolean) ?? [],
    year: w.publication_year,
    venue: w.primary_location?.source?.display_name,
    doi,
    arxivId: arxivId || undefined,
    abstract,
  }
}

function invertedIndexToText(index: Record<string, number[]>): string {
  const words: string[] = []
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) {
      words[pos] = word
    }
  }
  return words.filter(Boolean).join(' ')
}
