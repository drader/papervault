# Wiki Schema — Constitution

This file is the wiki's constitution. The LLM follows these rules on every wiki write.

## Purpose

A permanent knowledge base for research papers. Domain: defined in CLAUDE.md.

## Folder Structure

| Folder | Content | Does NOT contain |
|---|---|---|
| `raw/papers/` | Raw arXiv PDFs and abstract .txt files | Anything processed |
| `papers/` | One structured summary page per paper | Opinions, synthesis |
| `authors/` | Researcher profiles linked from papers | Abstract concepts |
| `methods/` | Specific algorithms and techniques | High-level areas |
| `concepts/` | High-level research area concepts | Specific algorithms |
| `venues/` | Conferences and journals | Paper content |
| `syntheses/` | Cross-paper comparisons and literature reviews | Raw paper summaries |
| `archive/` | Retired pages — never deleted | Active content |
| `_seed/` | Starter template pages — can be deleted after setup | Real knowledge |

## Paper Page Format

```markdown
---
title: "Attention Is All You Need"
authors: [Vaswani et al.]
venue: NeurIPS 2017
year: 2017
arxiv_id: 1706.03762
tags: [transformers, attention, nlp]
source: raw/papers/attention-is-all-you-need.pdf
date: YYYY-MM-DD
status: active
---

# Attention Is All You Need

Brief one-paragraph summary of the paper's core contribution.

## Problem
What gap or limitation does this paper address?

## Key Contributions
- Contribution 1
- Contribution 2
- Contribution 3

## Methodology
How does it work? What is the proposed approach?

## Results
Key benchmarks and quantitative findings.

## Limitations
Limitations acknowledged by the authors.

## Open Questions
What does this paper leave unresolved?

## CONFLICT (if any)
[[papers/paper-a]] claims X while [[papers/paper-b]] claims Y. Unresolved — YYYY-MM-DD.

## Sources
- [[raw/papers/filename]]

## Related
- [[authors/firstname-lastname]]
- [[methods/method-name]]
- [[concepts/concept-name]]
- [[venues/venue-name]]
```

## Naming Conventions

- File names: kebab-case
- Paper pages: `YYYY-MM-DD-paper-slug.md` (slug from title)
- Author pages: `firstname-lastname.md`
- Method pages: canonical method name (`attention-mechanism.md`)
- Concept pages: canonical concept name (`retrieval-augmented-generation.md`)
- Venue pages: canonical abbreviation (`neurips.md`, `icml.md`, `arxiv.md`)

## Hard Rules

1. `raw/` is never modified — read only
2. Every claim cites a source — unsourced claims are forbidden
3. Conflicts are flagged with `## CONFLICT`, never deleted
4. Pages are never deleted — moved to `archive/`, status: archived
5. Bidirectional links are required: if A links to B, B must list A in `## Related`
6. Every operation is logged to `log.md`
