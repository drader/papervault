import type { Adapter, DetectedInput, RawFetch } from '../types.js'

// Unpaywall — discovers open-access URL for a DOI, then fetches PDF or HTML (quality 1-3)
export class UnpaywallAdapter implements Adapter {
  readonly name = 'unpaywall'
  readonly quality = 1 as const  // conservative; actual quality depends on resolved format

  constructor(private readonly email: string) {}

  canHandle(input: DetectedInput): boolean {
    return !!input.doi && !!this.email
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const doi = input.doi!
    const url = `https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${encodeURIComponent(this.email)}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) return null

      const data = await res.json() as UnpaywallResult
      const oaUrl = bestOaUrl(data)
      if (!oaUrl) return null

      // Fetch the actual content
      const contentRes = await fetch(oaUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/pdf, text/html' },
      })
      if (!contentRes.ok) return null

      const contentType = contentRes.headers.get('content-type') ?? ''
      const meta = {
        title: data.title ?? '',
        authors: data.z_authors?.map(a => [a.given, a.family].filter(Boolean).join(' ')) ?? [],
        year: data.year,
        doi: data.doi,
        url: oaUrl,
      }

      if (contentType.includes('pdf')) {
        const buffer = Buffer.from(await contentRes.arrayBuffer())
        return { meta, binary: buffer, format: 'pdf', quality: 1, source: this.name }
      }

      if (contentType.includes('html')) {
        const html = await contentRes.text()
        return { meta, content: html, format: 'html', quality: 3, source: this.name }
      }

      return null
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}

interface UnpaywallResult {
  doi?: string
  title?: string
  year?: number
  z_authors?: Array<{ given?: string; family?: string }>
  best_oa_location?: { url_for_pdf?: string; url_for_landing_page?: string }
  oa_locations?: Array<{ url_for_pdf?: string; url?: string; host_type?: string }>
}

function bestOaUrl(data: UnpaywallResult): string | null {
  // Prefer PDF from publisher or repository
  const best = data.best_oa_location
  if (best?.url_for_pdf) return best.url_for_pdf

  // Try other locations with PDF URLs
  for (const loc of data.oa_locations ?? []) {
    if (loc.url_for_pdf) return loc.url_for_pdf
  }

  // Fall back to landing page
  if (best?.url_for_landing_page) return best.url_for_landing_page

  return null
}
