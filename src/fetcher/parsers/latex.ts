import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// ── Public API ─────────────────────────────────────────────────────────────

export function latexToText(latex: string, baseDir?: string): string {
  let text = baseDir ? resolveIncludes(latex, baseDir) : latex
  text = extractBody(text)
  text = stripEnvironments(text)
  text = convertStructure(text)
  text = stripCommands(text)
  text = cleanWhitespace(text)
  return text
}

// Finds the main .tex file in a directory (the one with \documentclass)
export function findMainTex(dir: string): string | null {
  const files = findTexFiles(dir)
  if (files.length === 0) return null
  if (files.length === 1) return files[0]

  for (const file of files) {
    try {
      if (readFileSync(file, 'utf-8').includes('\\documentclass')) return file
    } catch { /* skip */ }
  }

  // Fallback: largest file
  return files.sort((a, b) => {
    try { return statSync(b).size - statSync(a).size } catch { return 0 }
  })[0] ?? null
}

export function findTexFiles(dir: string): string[] {
  const results: string[] = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) results.push(...findTexFiles(full))
      else if (entry.name.endsWith('.tex')) results.push(full)
    }
  } catch { /* skip unreadable dirs */ }
  return results
}

// ── Internal ───────────────────────────────────────────────────────────────

function resolveIncludes(content: string, baseDir: string, depth = 0): string {
  if (depth > 10) return content
  return content.replace(/\\(?:input|include)\{([^}]+)\}/g, (match, filename) => {
    const name = filename.trim()
    const candidates = [join(baseDir, name), join(baseDir, name + '.tex')]
    for (const p of candidates) {
      try {
        return resolveIncludes(readFileSync(p, 'utf-8'), baseDir, depth + 1)
      } catch { /* try next */ }
    }
    return ''
  })
}

function extractBody(latex: string): string {
  // Strip comments
  let text = latex.replace(/(?<!\\)%.*/g, '')

  // Extract \begin{document}...\end{document}
  const start = text.indexOf('\\begin{document}')
  const end = text.indexOf('\\end{document}')
  if (start !== -1) text = text.slice(start + '\\begin{document}'.length)
  if (end !== -1) text = text.slice(0, text.indexOf('\\end{document}'))
  return text
}

function stripEnvironments(text: string): string {
  // Convert abstract
  text = text.replace(
    /\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g,
    '\n\n## Abstract\n\n$1\n\n',
  )
  // Strip math
  text = text.replace(
    /\\begin\{(equation|align|gather|multline|eqnarray|math)\*?\}[\s\S]*?\\end\{\1\*?\}/g,
    ' [EQUATION] ',
  )
  text = text.replace(/\$\$[\s\S]*?\$\$/g, ' [EQUATION] ')
  text = text.replace(/\\\[[\s\S]*?\\\]/g, ' [EQUATION] ')
  text = text.replace(/\$(?:[^$\n]|\\.)+\$/g, '[EQ]')

  // Strip figure / table / algorithm
  text = text.replace(
    /\\begin\{(figure|table|algorithm|lstlisting|verbatim|tikzpicture)\*?\}[\s\S]*?\\end\{\1\*?\}/g,
    '',
  )

  // Convert itemize / enumerate
  text = text.replace(/\\begin\{(itemize|enumerate|description)\}/g, '')
  text = text.replace(/\\end\{(itemize|enumerate|description)\}/g, '')
  text = text.replace(/\\item(\[([^\]]*)\])?\s*/g, '\n- ')

  // Strip remaining known environments
  text = text.replace(/\\begin\{[^}]+\}/g, '')
  text = text.replace(/\\end\{[^}]+\}/g, '')

  return text
}

function convertStructure(text: string): string {
  text = text.replace(/\\(?:chapter|section)\*?\{([^}]+)\}/g, '\n\n## $1\n\n')
  text = text.replace(/\\subsection\*?\{([^}]+)\}/g, '\n\n### $1\n\n')
  text = text.replace(/\\subsubsection\*?\{([^}]+)\}/g, '\n\n#### $1\n\n')
  text = text.replace(/\\paragraph\*?\{([^}]+)\}/g, '\n\n**$1** ')
  return text
}

function stripCommands(text: string): string {
  // Keep inner text for formatting commands
  text = text.replace(/\\(?:textbf|textit|emph|text|mbox)\{([^}]+)\}/g, '$1')

  // Strip cite, ref, label
  text = text.replace(/\\(?:cite[tp]?|ref|label|eqref|autoref)\*?\{[^}]*\}/g, '')

  // Strip footnotes (keep content)
  text = text.replace(/\\footnote\{([^}]*)\}/g, ' ($1)')

  // Strip href (keep display text)
  text = text.replace(/\\href\{[^}]*\}\{([^}]+)\}/g, '$1')
  text = text.replace(/\\url\{[^}]*\}/g, '')

  // Strip all remaining commands with braced arguments (keep inner)
  // Repeat a few times to handle nesting
  for (let i = 0; i < 3; i++) {
    text = text.replace(/\\[a-zA-Z]+\*?\{([^{}]*)\}/g, '$1')
  }

  // Strip remaining bare commands and braces
  text = text.replace(/\\[a-zA-Z]+\*?/g, ' ')
  text = text.replace(/[{}\\]/g, '')

  return text
}

function cleanWhitespace(text: string): string {
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}
