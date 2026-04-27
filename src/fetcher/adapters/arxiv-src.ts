import { createWriteStream, mkdirSync, rmSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { pipeline } from 'stream/promises'
import type { Adapter, DetectedInput, RawFetch } from '../types.js'
import { findMainTex, latexToText } from '../parsers/latex.js'

// arXiv LaTeX source — best quality (quality 5)
// Downloads tar.gz from arxiv.org/src/{id}, extracts, finds main .tex
export class ArxivSrcAdapter implements Adapter {
  readonly name = 'arxiv-src'
  readonly quality = 5 as const

  canHandle(input: DetectedInput): boolean {
    return !!input.arxivId
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const id = input.arxivId!
    const url = `https://arxiv.org/src/${id}`

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    let tmpDir: string | null = null
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok || !res.body) return null

      const contentType = res.headers.get('content-type') ?? ''
      // If arXiv returns PDF instead of tar, the source is unavailable
      if (contentType.includes('pdf')) return null

      tmpDir = join(tmpdir(), `papervault-arxiv-${id}-${Date.now()}`)
      mkdirSync(tmpDir, { recursive: true })

      const tarPath = join(tmpDir, 'source.tar.gz')
      const ws = createWriteStream(tarPath)
      await pipeline(res.body as unknown as NodeJS.ReadableStream, ws)

      // Extract tar.gz
      const { extract } = await import('tar')
      await extract({ file: tarPath, cwd: tmpDir, strip: 0 })

      const mainTex = findMainTex(tmpDir)
      if (!mainTex) return null

      const latex = readFileSync(mainTex, 'utf-8')
      const text = latexToText(latex, tmpDir)
      if (!text || text.length < 100) return null

      return {
        meta: { title: '', authors: [], arxivId: id },
        content: text,
        format: 'latex',
        quality: 5,
        source: this.name,
      }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
      if (tmpDir) {
        try { rmSync(tmpDir, { recursive: true, force: true }) } catch { /* ignore */ }
      }
    }
  }
}
