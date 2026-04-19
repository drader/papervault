import matter from 'gray-matter'

const REQUIRED_FIELDS = ['title', 'date', 'status'] as const

export interface ValidationResult {
  valid: boolean
  missing: string[]
  path: string
}

export function validateWikiPage(path: string, content: string): ValidationResult {
  const { data } = matter(content)
  const missing = REQUIRED_FIELDS.filter(f => !data[f])
  return { valid: missing.length === 0, missing, path }
}
