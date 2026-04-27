import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createXai } from '@ai-sdk/xai'
import { generateText } from 'ai'
import type { LanguageModel } from 'ai'

const DEFAULTS: Record<string, string> = {
  anthropic: 'claude-haiku-4-5-20251001',
  openai:    'gpt-4o-mini',
  google:    'gemini-1.5-flash',
  deepseek:  'deepseek-chat',
  llama:     'llama-3.3-70b-versatile',
  grok:      'grok-2-1212',
}

const OPENAI_COMPAT: Record<string, string> = {
  deepseek: 'https://api.deepseek.com/v1',
  llama:    'https://api.groq.com/openai/v1',
}

export function createModel(provider: string, apiKey: string, modelOverride?: string): LanguageModel {
  const model = modelOverride ?? DEFAULTS[provider]
  if (!model) throw new Error(`Unknown provider: "${provider}". Supported: ${Object.keys(DEFAULTS).join(', ')}`)

  if (provider === 'anthropic') return createAnthropic({ apiKey })(model)
  if (provider === 'openai')    return createOpenAI({ apiKey })(model)
  if (provider === 'google')    return createGoogleGenerativeAI({ apiKey })(model)
  if (provider === 'grok')      return createXai({ apiKey })(model)

  const baseURL = OPENAI_COMPAT[provider]
  if (baseURL) return createOpenAI({ apiKey, baseURL })(model)

  throw new Error(`Provider "${provider}" not configured`)
}

export interface ResearchUpdate {
  new_candidates: Array<{
    section: string
    title: string
    venue_year: string
    authors: string
    identifier: string  // arXiv ID or DOI
  }>
  log_entry: string
}

export async function generateResearchUpdates(
  model: LanguageModel,
  currentFiles: { index: string; candidates: string; log: string },
  searchContext?: string
): Promise<ResearchUpdate> {
  const prompt = `You are a research assistant for an academic paper knowledge wiki. The research topic and search keywords are in the index.md file below.

Your task: identify recent academic papers (last ~90 days) worth adding to the candidates list.

${searchContext ? `## Recent Web Search Results\n${searchContext}\n` : ''}

## Current candidates.md
${currentFiles.candidates}

## Current log.md (last entries)
${currentFiles.log.split('\n').slice(-15).join('\n')}

## index.md (topic + keywords)
${currentFiles.index}

## Instructions
Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "new_candidates": [
    {
      "section": "<exact section header from candidates.md, e.g. 'Attention Mechanisms'>",
      "title": "<paper title>",
      "venue_year": "<Conference/Journal, YYYY>",
      "authors": "<Author et al. or Author, Author>",
      "identifier": "<arXiv ID (e.g. 2301.12345) or DOI>"
    }
  ],
  "log_entry": "<one-line summary of what was found>"
}

Rules:
- Only include papers NOT already present in candidates.md
- Prefer papers with a known arXiv ID — it enables automatic fetching
- If nothing new was found, return an empty array
- Do not invent papers — only include verifiable ones
- Return raw JSON only, no code fences`

  const { text } = await generateText({ model, prompt })
  const json = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(json) as ResearchUpdate
}
