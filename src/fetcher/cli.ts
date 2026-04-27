#!/usr/bin/env tsx
import { writeFileSync } from 'fs'
import { fetchPaper } from './index.js'

async function main() {
  const args = process.argv.slice(2)
  const input = args[0]
  const outputFlag = args.indexOf('--output')
  const outputPath = outputFlag !== -1 ? args[outputFlag + 1] : null

  if (!input) {
    console.error('Usage: fetch-paper <arxiv-id|doi|url> [--output path.json]')
    process.exit(1)
  }

  console.error(`[fetch] Fetching: ${input}`)
  const result = await fetchPaper(input)

  if (!result) {
    console.error('[fetch] No result found across all sources.')
    process.exit(1)
  }

  console.error(`[fetch] Done — source: ${result.source}, quality: ${result.quality}, format: ${result.format}`)
  console.error(`[fetch] Title: ${result.meta.title}`)
  if (result.meta.authors.length) {
    console.error(`[fetch] Authors: ${result.meta.authors.slice(0, 3).join(', ')}${result.meta.authors.length > 3 ? ' ...' : ''}`)
  }
  if (result.fullText) {
    console.error(`[fetch] Full text: ${result.fullText.length} chars`)
  }

  const output = {
    meta: result.meta,
    format: result.format,
    quality: result.quality,
    source: result.source,
    fetchedAt: result.fetchedAt,
    abstract: result.abstract,
    fullTextLength: result.fullText?.length ?? 0,
    fullText: result.fullText,
  }

  const json = JSON.stringify(output, null, 2)

  if (outputPath) {
    writeFileSync(outputPath, json, 'utf-8')
    console.error(`[fetch] Written to ${outputPath}`)
  } else {
    process.stdout.write(json + '\n')
  }
}

main().catch(err => {
  console.error('[fetch] Fatal:', err)
  process.exit(1)
})
