import type { RawFetch, FetchResult } from './types.js'
import { latexToText } from './parsers/latex.js'
import { jatsXmlToText, teiXmlToText } from './parsers/xml.js'
import { htmlToText } from './parsers/html.js'
import { pdfToText } from './parsers/pdf.js'
import { markdownToText } from './parsers/markdown.js'

export async function normalize(raw: RawFetch): Promise<FetchResult> {
  let fullText: string | undefined

  if (raw.format !== 'abstract') {
    fullText = await extractText(raw)
    if (!fullText) fullText = undefined
  }

  return {
    meta: raw.meta,
    fullText,
    abstract: raw.meta.abstract,
    format: raw.format,
    quality: raw.quality,
    source: raw.source,
    fetchedAt: new Date().toISOString(),
  }
}

async function extractText(raw: RawFetch): Promise<string> {
  switch (raw.format) {
    case 'latex':
      return raw.content ? latexToText(raw.content) : ''

    case 'jats-xml':
      return raw.content ? jatsXmlToText(raw.content) : ''

    case 'tei-xml':
      return raw.content ? teiXmlToText(raw.content) : ''

    case 'html':
      return raw.content ? htmlToText(raw.content) : ''

    case 'markdown':
      return raw.content ? markdownToText(raw.content) : ''

    case 'pdf':
      return raw.binary ? pdfToText(raw.binary) : ''

    case 'abstract':
      return raw.meta.abstract ?? ''
  }
}
