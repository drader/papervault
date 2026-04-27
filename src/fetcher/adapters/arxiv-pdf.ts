import type { Adapter, DetectedInput, RawFetch } from '../types.js'

// arXiv PDF — last resort fallback (quality 1)
export class ArxivPdfAdapter implements Adapter {
  readonly name = 'arxiv-pdf'
  readonly quality = 1 as const

  canHandle(input: DetectedInput): boolean {
    return !!input.arxivId
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const id = input.arxivId!
    const url = `https://arxiv.org/pdf/${id}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) return null

      const contentType = res.headers.get('content-type') ?? ''
      if (!contentType.includes('pdf')) return null

      const buffer = Buffer.from(await res.arrayBuffer())

      return {
        meta: { title: '', authors: [], arxivId: id },
        binary: buffer,
        format: 'pdf',
        quality: 1,
        source: this.name,
      }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}
