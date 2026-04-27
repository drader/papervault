export interface SearchResult {
  title: string
  authors: string[]
  year?: number
  venue?: string
  arxivId?: string
  doi?: string
  abstract?: string
  url?: string
  source: string
}

export interface SearchOptions {
  maxResults?: number   // per source, default 10
  timeoutMs?: number    // default 10_000
}

export interface SearchAdapter {
  readonly name: string
  search(keywords: string[], options: SearchOptions): Promise<SearchResult[]>
}
