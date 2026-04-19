# Skill: WIKI_QUERY

Answer research questions from the knowledge base.

## Steps

1. Call `search(query)` via the obsidian-hybrid-search MCP
   - Returns ranked snippets — the full wiki is not loaded
   - Fallback: read `wiki/index.md`, identify the relevant category, navigate from there
2. Read the relevant pages
3. Synthesize an answer — cite a source page for every claim
4. If the answer involves a new comparison or cross-paper insight:
   - File it as a new page under `wiki/syntheses/`
   - Update the Syntheses section of `wiki/index.md`
5. Write to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] query | "question summary" → filed: syntheses/x.md
   ```
   (Omit `→ filed` if nothing was back-filed)

## Rule
If the answer is not in the wiki:
- State clearly what information is missing
- Suggest which papers should be ingested to fill the gap
- Do not speculate or produce unsourced claims
