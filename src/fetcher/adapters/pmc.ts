import type { Adapter, DetectedInput, RawFetch } from '../types.js'
import { jatsXmlToText } from '../parsers/xml.js'

// PubMed Central — JATS XML full text via NCBI E-utilities (quality 4)
export class PmcAdapter implements Adapter {
  readonly name = 'pmc'
  readonly quality = 4 as const

  canHandle(input: DetectedInput): boolean {
    return !!(input.doi || input.arxivId)
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const pmcid = await resolvePmcId(input, controller.signal)
      if (!pmcid) return null

      const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pmc&id=${pmcid}&rettype=xml&retmode=xml`
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) return null

      const xml = await res.text()
      if (!xml.includes('<article')) return null

      const text = jatsXmlToText(xml)
      if (!text || text.length < 100) return null

      return {
        meta: { title: '', authors: [], doi: input.doi, arxivId: input.arxivId },
        content: xml,
        format: 'jats-xml',
        quality: 4,
        source: this.name,
      }
    } catch {
      return null
    } finally {
      clearTimeout(timer)
    }
  }
}

async function resolvePmcId(input: DetectedInput, signal: AbortSignal): Promise<string | null> {
  // Try DOI→PMCID via ID converter
  if (input.doi) {
    const url = `https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/?ids=${encodeURIComponent(input.doi)}&format=json`
    try {
      const res = await fetch(url, { signal })
      if (res.ok) {
        const data = await res.json() as { records?: Array<{ pmcid?: string }> }
        const pmcid = data.records?.[0]?.pmcid
        if (pmcid) return pmcid.replace(/^PMC/, '')
      }
    } catch { /* fall through */ }
  }

  // Try arXiv ID via eSearch
  if (input.arxivId) {
    const query = encodeURIComponent(`${input.arxivId}[arxiv]`)
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${query}&retmax=1&retmode=json`
    try {
      const res = await fetch(url, { signal })
      if (res.ok) {
        const data = await res.json() as { esearchresult?: { idlist?: string[] } }
        const id = data.esearchresult?.idlist?.[0]
        if (id) return id
      }
    } catch { /* fall through */ }
  }

  return null
}
