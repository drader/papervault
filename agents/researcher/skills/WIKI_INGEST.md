# Skill: WIKI_INGEST

New paper → structured wiki page.

## Trigger
A file exists in `wiki/raw/papers/` with no corresponding page in `wiki/papers/`.

## Steps

1. Find the most recently modified uningest file in `wiki/raw/papers/`
2. Read the paper. Extract:
   - Title, authors (full names), venue (conference/journal), year, arXiv ID (if present)
   - Abstract / problem statement
   - Key contributions (3–5 bullet points)
   - Methodology — what approach or algorithm does the paper propose?
   - Main results and benchmarks (quantitative where possible)
   - Limitations acknowledged by the authors
   - Related work mentioned (other paper titles/authors)
   - Open questions this paper raises
3. Write `wiki/papers/YYYY-MM-DD-slug.md` (SCHEMA.md format):
   - Frontmatter: title, authors, venue, year, arxiv_id, tags, source (raw file path), date, status: active
   - Sections: Problem, Key Contributions, Methodology, Results, Limitations, Open Questions, Sources, Related
4. For each author: create or update `wiki/authors/firstname-lastname.md`
   - Bidirectional link: author → paper, paper → author
5. For each method/algorithm introduced or used: create or update `wiki/methods/method-name.md`
6. For each high-level concept: create or update `wiki/concepts/concept-name.md`
7. For the venue: create or update `wiki/venues/venue-name.md` if it doesn't exist
8. Update `wiki/index.md` — add new pages to the relevant categories
9. Write to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | slug
   Pages touched: papers/X, authors/Y Z, methods/M, concepts/C
   ```

## Rules
- Never modify files in `wiki/raw/` — read only
- Every claim in a paper page must link back to its source
- If a paper is already ingested: update the existing page, do not create a new one
- If a paper is unreadable: log to `journal/`, skip, continue to next paper
- All wiki writes go through the locker
