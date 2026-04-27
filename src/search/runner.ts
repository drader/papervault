import { execFile } from 'child_process'
import { promisify } from 'util'
import type { SearchAdapter, SearchOptions, SearchResult } from './types.js'
import { OpenAlexSearchAdapter }         from './adapters/openalex.js'
import { ArxivSearchAdapter }            from './adapters/arxiv.js'
import { SemanticScholarSearchAdapter }  from './adapters/semantic-scholar.js'
import { PubMedSearchAdapter }           from './adapters/pubmed.js'
import { CrossrefSearchAdapter }         from './adapters/crossref.js'
import { deduplicate }                   from './dedup.js'

const execFileAsync = promisify(execFile)

function buildCoreAdapters(): SearchAdapter[] {
  return [
    new OpenAlexSearchAdapter(),
    new ArxivSearchAdapter(),
    new SemanticScholarSearchAdapter(process.env.SEMANTIC_SCHOLAR_API_KEY),
    new PubMedSearchAdapter(),
    new CrossrefSearchAdapter(process.env.UNPAYWALL_EMAIL),
  ]
}

// paper-search-mcp CLI output normalizer
// Handles the Paper class format: { title, authors, doi, arxiv_id, abstract, year, venue, url }
function normalizePaperSearchResult(raw: Record<string, unknown>): SearchResult {
  const authors = Array.isArray(raw.authors)
    ? (raw.authors as string[])
    : typeof raw.authors === 'string'
      ? [raw.authors]
      : []

  return {
    title:    String(raw.title ?? ''),
    authors,
    year:     typeof raw.year === 'number' ? raw.year : undefined,
    venue:    typeof raw.venue === 'string' ? raw.venue : undefined,
    arxivId:  typeof raw.arxiv_id === 'string' ? raw.arxiv_id : undefined,
    doi:      typeof raw.doi === 'string' ? raw.doi : undefined,
    abstract: typeof raw.abstract === 'string' ? raw.abstract : undefined,
    url:      typeof raw.url === 'string' ? raw.url : undefined,
    source:   'paper-search-mcp',
  }
}

async function runPaperSearchMcp(
  keywords: string[],
  maxResults: number,
  timeoutMs: number,
): Promise<SearchResult[] | null> {
  try {
    const { stdout } = await execFileAsync(
      'paper-search',
      ['search', keywords.join(' '), '--format', 'json', '--limit', String(maxResults)],
      { timeout: timeoutMs },
    )
    const parsed = JSON.parse(stdout)
    const items: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : parsed?.results ?? []
    return items
      .map(normalizePaperSearchResult)
      .filter(r => !!r.title)
  } catch {
    return null   // not installed, or search failed — fall through to core adapters
  }
}

async function runCoreAdapters(
  adapters: SearchAdapter[],
  keywords: string[],
  options: SearchOptions,
): Promise<SearchResult[]> {
  const settled = await Promise.allSettled(
    adapters.map(a => a.search(keywords, options)),
  )
  return settled.flatMap(s => s.status === 'fulfilled' ? s.value : [])
}

export async function runSearch(
  keywords: string[],
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const maxResults = options.maxResults ?? 10
  const timeoutMs  = options.timeoutMs  ?? 10_000

  // Try paper-search-mcp first (20+ sources, if installed)
  const mcp = await runPaperSearchMcp(keywords, maxResults, timeoutMs)
  if (mcp) return deduplicate(mcp)

  // Fall back to 5 core TypeScript adapters
  const results = await runCoreAdapters(buildCoreAdapters(), keywords, { maxResults, timeoutMs })
  return deduplicate(results)
}
