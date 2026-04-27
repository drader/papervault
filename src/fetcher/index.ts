import { readFileSync } from 'fs'
import { join } from 'path'
import type { Adapter, DetectedInput, FetchResult, FetcherConfig, RawFetch } from './types.js'
import { detectInput } from './detector.js'
import { normalize } from './normalizer.js'

// arXiv adapters
import { ArxivApiAdapter } from './adapters/arxiv-api.js'
import { ArxivSrcAdapter } from './adapters/arxiv-src.js'
import { ArxivHtmlAdapter } from './adapters/arxiv-html.js'
import { ArxivPdfAdapter } from './adapters/arxiv-pdf.js'

// DOI / general adapters
import { SemanticScholarAdapter } from './adapters/semantic-scholar.js'
import { UnpaywallAdapter } from './adapters/unpaywall.js'
import { PmcAdapter } from './adapters/pmc.js'
import { EuropePmcAdapter } from './adapters/europepmc.js'
import { OpenAlexAdapter } from './adapters/openalex.js'
import { CoreAdapter } from './adapters/core.js'
import { ZenodoAdapter } from './adapters/zenodo.js'
import { AclAdapter } from './adapters/acl.js'

export { detectInput } from './detector.js'
export type { FetchResult, PaperMeta } from './types.js'

// ── Config ────────────────────────────────────────────────────────────────────

function loadConfig(): FetcherConfig {
  const configPath = join(process.cwd(), 'sources-config.json')
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8')) as FetcherConfig
  } catch {
    // Sensible defaults when config is missing
    return {
      sources: {},
      cascade: { qualityThreshold: 3, timeoutMs: 15000, stopAtFirstAboveThreshold: true },
    }
  }
}

// ── Adapter Registry ──────────────────────────────────────────────────────────

function buildAdapters(config: FetcherConfig): Adapter[] {
  const s = config.sources
  const enabled = (name: string) => s[name]?.enabled !== false

  const adapters: Adapter[] = []

  // arXiv cascade (quality desc: src=5, html=3, pdf=1, api=0)
  if (enabled('arxiv-src'))        adapters.push(new ArxivSrcAdapter())
  if (enabled('arxiv-html'))       adapters.push(new ArxivHtmlAdapter())
  if (enabled('arxiv-pdf'))        adapters.push(new ArxivPdfAdapter())
  if (enabled('arxiv-api'))        adapters.push(new ArxivApiAdapter())

  // DOI cascade (quality desc: pmc/europepmc=4, unpaywall html=3, openalex/core/zenodo/acl=1, ss/oa abstract=0)
  if (enabled('pmc'))              adapters.push(new PmcAdapter())
  if (enabled('europepmc'))        adapters.push(new EuropePmcAdapter())
  if (enabled('unpaywall'))        adapters.push(new UnpaywallAdapter(s['unpaywall']?.email ?? ''))
  if (enabled('openalex'))         adapters.push(new OpenAlexAdapter())
  if (enabled('core'))             adapters.push(new CoreAdapter(s['core']?.apiKey ?? ''))
  if (enabled('zenodo'))           adapters.push(new ZenodoAdapter())
  if (enabled('acl'))              adapters.push(new AclAdapter())
  if (enabled('semantic-scholar')) adapters.push(new SemanticScholarAdapter())

  return adapters
}

// ── Cascade Logic ─────────────────────────────────────────────────────────────

export async function fetchPaper(rawInput: string): Promise<FetchResult | null> {
  const config = loadConfig()
  const input = detectInput(rawInput)
  const adapters = buildAdapters(config)
  const { qualityThreshold, timeoutMs, stopAtFirstAboveThreshold } = config.cascade

  // Two-path cascade: arXiv-first, then DOI-general
  // Sort: arXiv adapters first if we have an arXiv ID
  const sorted = sortAdapters(adapters, input)
  const candidates = sorted.filter(a => a.canHandle(input))

  let bestRaw: RawFetch | null = null

  for (const adapter of candidates) {
    let raw: RawFetch | null = null
    try {
      raw = await adapter.fetch(input, timeoutMs)
    } catch {
      raw = null
    }

    if (!raw) continue

    if (!bestRaw || raw.quality > bestRaw.quality) {
      bestRaw = raw
    }

    if (stopAtFirstAboveThreshold && bestRaw.quality >= qualityThreshold) break
  }

  if (!bestRaw) return null

  // If meta is incomplete, always try the fast metadata adapters regardless of threshold
  if (!bestRaw.meta.title || !bestRaw.meta.authors.length) {
    const metaAdapters = [
      new ArxivApiAdapter(),
      new SemanticScholarAdapter(),
    ]
    for (const adapter of metaAdapters) {
      if (!adapter.canHandle(input)) continue
      try {
        const metaResult = await adapter.fetch(input, Math.min(timeoutMs, 8000))
        if (metaResult?.meta.title) {
          bestRaw = { ...bestRaw, meta: mergeMeta(bestRaw.meta, metaResult.meta) }
          break
        }
      } catch { /* ignore */ }
    }
  }

  return normalize(bestRaw)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sortAdapters(adapters: Adapter[], input: DetectedInput): Adapter[] {
  // If we have an arXiv ID, prioritize arXiv adapters (they have the canonical source)
  if (input.arxivId) {
    const arxivNames = new Set(['arxiv-src', 'arxiv-html', 'arxiv-pdf', 'arxiv-api'])
    const arxiv = adapters.filter(a => arxivNames.has(a.name))
    const others = adapters.filter(a => !arxivNames.has(a.name))
    return [...arxiv, ...others]
  }
  return adapters
}

function mergeMeta(primary: RawFetch['meta'], secondary: RawFetch['meta']): RawFetch['meta'] {
  return {
    title: primary.title || secondary.title,
    authors: primary.authors.length ? primary.authors : secondary.authors,
    year: primary.year ?? secondary.year,
    venue: primary.venue ?? secondary.venue,
    arxivId: primary.arxivId ?? secondary.arxivId,
    doi: primary.doi ?? secondary.doi,
    abstract: primary.abstract ?? secondary.abstract,
    categories: primary.categories ?? secondary.categories,
    url: primary.url ?? secondary.url,
  }
}
