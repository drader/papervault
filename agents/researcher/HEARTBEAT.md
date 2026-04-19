---
schedule: "0 9 * * 2-5"
token_limit: 8000
---

# Researcher Heartbeat

Runs Tuesday–Friday at 09:00.

## Each Cycle

### 1. Read Context
- `memory/status.md` and recent journal entries
- `wiki/index.md` — current state of the knowledge base
- Own `MEMORY.md` — patterns from previous cycles

### 2. Assess
- Are there uningest papers in `wiki/raw/papers/`?
  - Yes → run WIKI_INGEST skill
  - No → run Wakeup routine

### 3. Wakeup (when queue is empty)
1. Scan `wiki/papers/` — identify papers with no linked methods or authors
2. Scan `wiki/authors/` — find authors with only one paper; check if more exist in the wiki
3. Review `scratch/ideas.md` — open questions, papers flagged for deeper reading
4. Write to `journal/YYYY-MM-DD.md`: "Papers to consider this week" based on gaps found

### 4. Log
- Operation record to `wiki/log.md`
- Confirmed new patterns to `MEMORY.md`

## Escalation
- `wiki/raw/papers/` empty for 2+ weeks → write warning to `memory/status.md`
- Paper unreadable during INGEST → log to `journal/`, continue to next paper
