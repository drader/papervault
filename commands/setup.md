# /setup

First-time setup — intake interview. Solves the cold start problem.

## Usage

```
/setup
```

Called by `npm run setup`. Can also be run directly inside Claude Code.

## Steps

Ask the user these 7 questions in order (wait for each answer before proceeding):

1. **Research area**: What research domain or subfield is this vault for?
   _(e.g. machine learning / NLP / computer vision / biology / economics / other)_

2. **Goal**: What is the purpose of this vault in one sentence?
   _(e.g. "Track the state of the art in retrieval-augmented generation" or "Follow research from a specific lab")_

3. **Key concepts**: List 5 concepts or terms you want the wiki to track from day one.

4. **Key authors or groups**: Are there specific researchers, labs, or institutions whose work you always want ingested?

5. **Open questions**: What are 3 research questions you currently don't have good answers to?

6. **Reading habit**: How often do you expect to drop new papers into `wiki/raw/papers/`?
   _(daily / a few per week / a few per month)_

7. **Existing papers**: Do you have any PDFs or abstract text files ready to drop in `wiki/raw/papers/` right now?

## Setup Output

After collecting answers:

1. `CLAUDE.md` — update Purpose with the stated goal and domain
2. `memory/status.md` — fill with project context and reading cadence
3. `memory/glossary.md` — add the 5 key concepts
4. `wiki/concepts/` — write a starter page for each concept (from LLM knowledge, clearly marked as unseeded)
5. `wiki/authors/` — write a stub page for each key author or group
6. `wiki/index.md` — updated catalog
7. `agents/researcher/MEMORY.md` — populate Bootstrap Hypotheses with domain-specific hypotheses based on open questions
8. If existing papers are available: immediately start `/ingest`

## Rule
Do not fabricate or speculate in wiki pages.
Unseeded concept and author pages must include the note:
"No papers ingested yet for this entry. This page will be enriched after the first relevant ingest."
