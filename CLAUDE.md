# papervault — Master Schema

This file is the system constitution. Read every session.

## Purpose

A self-growing research paper knowledge base. Drop arXiv PDFs or abstract text files into `wiki/raw/papers/`. The researcher agent ingests them into structured wiki pages — extracting contributions, methods, and limitations, linking authors and venues, surfacing connections across papers automatically.

## System Architecture

```
TypeScript Motor (src/)     →  scheduler, runner, locker, validator, budget, consolidator
Markdown Content            →  wiki/, agents/, memory/, commands/
MCP Server                  →  obsidian-hybrid-search (semantic search over wiki/)
```

## Two Memory Layers

| Layer | Location | Content | Written by |
|---|---|---|---|
| Process memory | `agents/*/MEMORY.md` | Reading patterns, recurring themes, hypotheses | Each agent |
| Domain knowledge | `wiki/` | Papers, authors, methods, concepts, venues, entities | Agents via locker |

The weekly consolidator bridges process memory → domain knowledge automatically.

## Tier System

- **Tier 1** — Every session: `memory/`, `scratch/ideas.md`, `journal/` (last 3 days)
- **Tier 2** — When agent/domain is active: `wiki/index.md`, `agents/[active]/AGENT.md + MEMORY.md`
- **Tier 3** — Only when explicitly requested: `wiki/archive/`, `outputs/`, old `journal/`

## Operations

- **INGEST** — New paper → structured wiki page (`/ingest`)
- **QUERY**  — Ask a research question, get a wiki-backed answer (`/query`)
- **LINT**   — Wiki health check: orphan pages, missing sources, broken links (`/lint`)
- **CONSOLIDATE** — MEMORY.md → wiki bridge (orchestrator, weekly)
- **FETCH** — arXiv ID / DOI / URL → `wiki/raw/papers/` (`/fetch-paper`)
- **NEW-RESEARCH** — Yeni araştırma konusu başlat, paper keşfet, candidates.md oluştur (`/new-research`)

## Hard Rules

1. `wiki/raw/` is never modified — read only
2. Every claim cites a source — unsourced claims are forbidden
3. Contradictions are flagged with `## CONFLICT`, never deleted
4. Pages are never deleted — moved to `wiki/archive/`, status: archived
5. Every operation is logged with a timestamp to `wiki/log.md`
6. Wiki writes go through the locker — no direct writes
7. Never modify another agent's files

## Directory Guide

```
CLAUDE.md          this file — master schema
MANIFEST.md        tier routing map
CONVENTIONS.md     naming rules
AGENT_REGISTRY.md  active agents index

src/               TypeScript motor
wiki/              research knowledge base
  raw/papers/      drop arXiv PDFs or .txt abstracts here
  papers/          one structured summary page per paper
  authors/         researcher profiles (linked from papers)
  methods/         specific algorithms and techniques
  concepts/        higher-level research area concepts
  venues/          conferences and journals (NeurIPS, ICML, etc.)
  entities/        research groups, labs, datasets, software tools
  sources/         non-paper references: textbooks, blog posts, documentation, standards
  syntheses/       literature reviews and cross-paper comparisons
  decisions/       research methodology decisions with full rationale and evidence
agents/            agent definitions and process memories
memory/            system-wide Tier 1 state
scratch/           papers to read, open questions
journal/           cross-agent signal channel
commands/          slash command prompt templates
scripts/           setup and management scripts
outputs/           reading lists, weekly reports
research/          per-topic research folders
  {slug}/          index.md, candidates.md, log.md
```
