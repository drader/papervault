export async function pdfToText(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import to avoid module-level side effects in pdf-parse
    const mod = await import('pdf-parse/lib/pdf-parse.js' as string)
    const pdfParse: (buf: Buffer) => Promise<{ text: string }> = mod.default ?? mod
    const result = await pdfParse(buffer)
    return cleanPdfText(result.text)
  } catch {
    try {
      // Fallback: top-level import
      const mod = await import('pdf-parse')
      const pdfParse: (buf: Buffer) => Promise<{ text: string }> = mod.default ?? mod
      const result = await pdfParse(buffer)
      return cleanPdfText(result.text)
    } catch (err) {
      console.warn('[pdf] pdf-parse unavailable. Run: npm install pdf-parse')
      console.warn('[pdf]', (err as Error).message)
      return ''
    }
  }
}

function cleanPdfText(raw: string): string {
  return raw
    // Remove hyphenation at line breaks
    .replace(/-\n(\w)/g, '$1')
    // Collapse excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Normalize line breaks: single → space, double → paragraph
    .replace(/([^\n])\n([^\n])/g, '$1 $2')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
