import { parse } from 'node-html-parser'

export function htmlToText(html: string): string {
  const root = parse(html)

  // Remove noise: math, figures, nav, references, scripts
  const noiseSelectors = [
    '.ltx_Math', '.ltx_equation', '.MathJax', '.MathJax_Display',
    'figure', '.ltx_figure', '.ltx_table',
    '.ltx_bibliography', '#bib', '.references',
    'nav', 'header', 'footer', 'script', 'style', 'noscript',
    '.ltx_page_footer', '.ltx_page_header',
  ]
  for (const sel of noiseSelectors) {
    root.querySelectorAll(sel).forEach(el => el.remove())
  }

  const parts: string[] = []

  // Try arXiv HTML structure first
  const article = root.querySelector('article') ?? root.querySelector('.ltx_document') ?? root

  // Title
  const title = article.querySelector('h1, .ltx_title')?.text?.trim()
  if (title) parts.push(`# ${title}\n`)

  // Abstract
  const abstract = article.querySelector('.ltx_abstract, section.abstract')
  if (abstract) {
    parts.push('## Abstract\n\n' + cleanText(abstract.text))
  }

  // Sections
  const sections = article.querySelectorAll(
    'section.ltx_section, section.ltx_chapter, section[class*="section"], section',
  )

  if (sections.length > 0) {
    for (const sec of sections) {
      const heading = sec.querySelector('h2, h3, h4, .ltx_title')?.text?.trim()
      if (heading && !isNoiseHeading(heading)) parts.push(`## ${heading}`)

      for (const p of sec.querySelectorAll('p')) {
        const text = cleanText(p.text)
        if (text.length > 20) parts.push(text)
      }
    }
  } else {
    // Generic fallback: grab all paragraphs
    for (const p of article.querySelectorAll('p')) {
      const text = cleanText(p.text)
      if (text.length > 20) parts.push(text)
    }
  }

  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
}

function cleanText(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/\[EQUATION\]/g, '')
    .trim()
}

function isNoiseHeading(h: string): boolean {
  const noise = ['references', 'bibliography', 'acknowledgements', 'acknowledgments']
  return noise.some(n => h.toLowerCase().includes(n))
}
