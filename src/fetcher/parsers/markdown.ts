export function markdownToText(md: string): string {
  let text = md
  // Remove YAML frontmatter
  text = text.replace(/^---[\s\S]*?---\n/, '')
  // Keep headings as-is (already readable)
  // Remove inline code formatting
  text = text.replace(/`([^`]+)`/g, '$1')
  // Remove bold/italic markers
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
  text = text.replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
  // Remove link syntax but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  // Remove images
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '')
  // Normalize whitespace
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n{3,}/g, '\n\n')
  return text.trim()
}
