import matter from 'gray-matter'
import { readFileSync } from 'fs'
import { join } from 'path'
import { createModel, generateResearchUpdates } from './llm.js'
import { readResearchFiles, applyUpdates, commitChanges } from './updater.js'
import { runSearch, formatForLLM } from '../search/index.js'

const ROOT = join(__dirname, '..', '..')

function readSearchKeywords(topic: string): string[] {
  const indexPath = join(ROOT, 'research', topic, 'index.md')
  const { data } = matter(readFileSync(indexPath, 'utf-8'))
  return (data.search_keywords as string[] | undefined) ?? [topic.replace(/-/g, ' ')]
}

async function main() {
  const topic         = process.env.RESEARCH_TOPIC ?? 'example-topic'
  const provider      = process.env.LLM_PROVIDER ?? ''
  const apiKey        = process.env.LLM_API_KEY ?? ''
  const modelOverride = process.env.LLM_MODEL

  if (!provider || !apiKey) {
    console.error('LLM_PROVIDER and LLM_API_KEY environment variables are required.')
    process.exit(1)
  }

  const date = new Date().toISOString().slice(0, 10)
  console.log(`[${date}] Research runner — topic: ${topic}`)

  const model        = createModel(provider, apiKey, modelOverride)
  const currentFiles = readResearchFiles(topic)
  const keywords     = readSearchKeywords(topic)

  console.log(`Searching with keywords: ${keywords.join(', ')}`)
  const results      = await runSearch(keywords, { maxResults: 10 })
  const searchContext = results.length > 0 ? formatForLLM(results) : undefined

  if (searchContext) {
    const sources = [...new Set(results.map(r => r.source))].join(', ')
    console.log(`Found ${results.length} papers via: ${sources}`)
  } else {
    console.log('No search results — using LLM knowledge only.')
  }

  console.log('Generating research updates...')
  const updates = await generateResearchUpdates(model, currentFiles, searchContext)

  console.log(`Found: ${updates.new_candidates.length} new candidates`)
  applyUpdates(topic, updates, date)
  commitChanges(topic, date)
  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
