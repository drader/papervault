import type { Adapter, DetectedInput, RawFetch } from '../types.js'
import { jatsXmlToText } from '../parsers/xml.js'

// Europe PMC — JATS XML full text (quality 4)
export class EuropePmcAdapter implements Adapter {
  readonly name = 'europepmc'
  readonly quality = 4 as const

  canHandle(input: DetectedInput): boolean {
    return !!(input.doi || input.arxivId)
  }

  async fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const id = await resolveEpmcId(input, controller.signal)
      if (!id) return null

      const { source, pmcid } = id
      const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/${source}/${pmcid}/fullTextXML`

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

interface EpmcId { source: string; pmcid: string }

async function resolveEpmcId(input: DetectedInput, signal: AbortSignal): Promise<EpmcId | null> {
  let query: string
  if (input.doi) {
    query = `DOI:"${input.doi}"`
  } else if (input.arxivId) {
    query = `ARXIV:${input.arxivId}`
  } else {
    return null
  }

  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query)}&format=json&resultType=core&pageSize=1`
  try {
    const res = await fetch(url, { signal })
    if (!res.ok) return null

    const data = await res.json() as { resultList?: { result?: Array<{ source?: string; id?: string; pmcid?: string }> } }
    const hit = data.resultList?.result?.[0]
    if (!hit) return null

    const source = hit.source ?? 'MED'
    const pmcid = hit.pmcid ?? hit.id
    if (!pmcid) return null

    return { source, pmcid }
  } catch {
    return null
  }
}
