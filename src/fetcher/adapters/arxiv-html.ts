import type { Adapter, DetectedInput, RawFetch } from '../types.js'
import { htmlToText } from '../parsers/html.js'

// arXiv HTML full text — pre-rendered LaTeX (~75% coverage, quality 3)
export class ArxivHtmlAdapter implements Adapter {
  readonly name = 'arxiv-html'
  readonly quality = 3 as const

  canHandle(input: DetectedInput): boolean {
    return !!input.arxivId
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const id = input.arxivId!
    const url = `https://arxiv.org/html/${id}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'text/html' },
      })

      if (!res.ok) return null

      const html = await res.text()
      // arXiv returns a redirect page when HTML is unavailable
      if (html.includes('HTML not available') || html.includes('We were unable to generate')) {
        return null
      }

      const text = htmlToText(html)
      if (!text || text.length < 100) return null

      return {
        meta: { title: '', authors: [], arxivId: id },
        content: text,
        format: 'html',
        quality: 3,
        source: this.name,
      }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}
