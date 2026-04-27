import { XMLParser } from 'fast-xml-parser'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: true,
  trimValues: true,
  isArray: (name) => ['author', 'sec', 'p', 'div', 'ref'].includes(name),
})

// ── JATS XML (PubMed Central, Europe PMC) ─────────────────────────────────

export function jatsXmlToText(xml: string): string {
  const doc = parser.parse(xml)
  const article = doc.article ?? doc['pmc-articleset']?.article ?? doc

  const parts: string[] = []

  // Title
  const title = extractText(article?.front?.['article-meta']?.['title-group']?.['article-title'])
  if (title) parts.push(`# ${title}\n`)

  // Abstract
  const abstract = extractText(article?.front?.['article-meta']?.abstract)
  if (abstract) parts.push(`## Abstract\n\n${abstract}`)

  // Body sections
  const body = article?.body
  if (body) parts.push(extractJatsBody(body))

  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}

function extractJatsBody(body: unknown): string {
  const parts: string[] = []
  const node = body as Record<string, unknown>

  for (const sec of asArray(node.sec)) {
    const s = sec as Record<string, unknown>
    const title = extractText(s.title)
    if (title) parts.push(`## ${title}`)

    for (const p of asArray(s.p)) {
      const text = extractText(p)
      if (text) parts.push(text)
    }

    // Nested subsections
    for (const subsec of asArray(s.sec)) {
      const ss = subsec as Record<string, unknown>
      const stitle = extractText(ss.title)
      if (stitle) parts.push(`### ${stitle}`)
      for (const p of asArray(ss.p)) {
        const text = extractText(p)
        if (text) parts.push(text)
      }
    }
  }

  // Fallback: top-level paragraphs
  if (parts.length === 0) {
    for (const p of asArray(node.p)) {
      const text = extractText(p)
      if (text) parts.push(text)
    }
  }

  return parts.join('\n\n')
}

// ── TEI XML (OpenAlex / GROBID) ────────────────────────────────────────────

export function teiXmlToText(xml: string): string {
  const doc = parser.parse(xml)
  const tei = doc.TEI ?? doc.tei ?? doc

  const parts: string[] = []

  // Title
  const title = extractText(
    tei?.teiHeader?.fileDesc?.titleStmt?.title,
  )
  if (title) parts.push(`# ${title}\n`)

  // Abstract
  const abstract = extractText(
    tei?.teiHeader?.profileDesc?.abstract,
  )
  if (abstract) parts.push(`## Abstract\n\n${abstract}`)

  // Body
  const body = tei?.text?.body
  if (body) parts.push(extractTeiBody(body))

  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}

function extractTeiBody(body: unknown): string {
  const parts: string[] = []
  const node = body as Record<string, unknown>

  for (const div of asArray(node.div)) {
    const d = div as Record<string, unknown>
    const head = extractText(d.head)
    if (head) parts.push(`## ${head}`)

    for (const p of asArray(d.p)) {
      const text = extractText(p)
      if (text) parts.push(text)
    }

    // Nested divs
    for (const subdiv of asArray(d.div)) {
      const sd = subdiv as Record<string, unknown>
      const shead = extractText(sd.head)
      if (shead) parts.push(`### ${shead}`)
      for (const p of asArray(sd.p)) {
        const text = extractText(p)
        if (text) parts.push(text)
      }
    }
  }

  return parts.join('\n\n')
}

// ── Helpers ────────────────────────────────────────────────────────────────

function extractText(node: unknown): string {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node.replace(/\s+/g, ' ').trim()
  if (typeof node === 'number' || typeof node === 'boolean') return String(node)
  if (Array.isArray(node)) return node.map(extractText).filter(Boolean).join(' ')
  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>
    // Prefer text node
    if (obj['#text']) return extractText(obj['#text'])
    // Skip attribute-only objects
    return Object.entries(obj)
      .filter(([k]) => !k.startsWith('@_'))
      .map(([, v]) => extractText(v))
      .filter(Boolean)
      .join(' ')
  }
  return ''
}

function asArray(val: unknown): unknown[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}
