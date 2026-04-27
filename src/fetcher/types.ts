export type InputType = 'arxiv' | 'doi' | 'url' | 'unknown'

export type ContentFormat =
  | 'latex'
  | 'jats-xml'
  | 'tei-xml'
  | 'html'
  | 'markdown'
  | 'pdf'
  | 'abstract'

export type QualityScore = 0 | 1 | 2 | 3 | 4 | 5

export interface DetectedInput {
  type: InputType
  raw: string
  arxivId?: string   // e.g. "2301.12345" or "2301.12345v2"
  doi?: string       // e.g. "10.1145/3386392"
  url?: string       // generic URL
}

export interface PaperMeta {
  title: string
  authors: string[]
  year?: number
  venue?: string
  arxivId?: string
  doi?: string
  abstract?: string
  categories?: string[]
  url?: string
}

export interface RawFetch {
  meta: PaperMeta
  content?: string    // text-based content (latex, xml, html, markdown, abstract)
  binary?: Buffer     // binary content (pdf)
  format: ContentFormat
  quality: QualityScore
  source: string      // adapter name
}

export interface FetchResult {
  meta: PaperMeta
  fullText?: string
  abstract?: string
  format: ContentFormat
  quality: QualityScore
  source: string
  fetchedAt: string
}

export interface SourceConfig {
  enabled: boolean
  apiKey?: string
  email?: string
}

export interface CascadeConfig {
  qualityThreshold: number
  timeoutMs: number
  stopAtFirstAboveThreshold: boolean
}

export interface FetcherConfig {
  sources: Record<string, SourceConfig>
  cascade: CascadeConfig
}

export interface Adapter {
  readonly name: string
  readonly quality: QualityScore
  canHandle(input: DetectedInput): boolean
  fetch(input: DetectedInput, timeoutMs: number): Promise<RawFetch | null>
}
