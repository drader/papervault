# papervault

**Agentic research paper knowledge base — built on [memex](https://github.com/drader/memex)**

Drop arXiv PDFs or abstracts in. Agents extract contributions, methods, and limitations — linking authors, venues, and concepts into a growing research wiki automatically.

→ [View presentation](https://drader.github.io/papervault/)

---

## How it works

1. **Drop a paper** — Place an arXiv PDF or plain-text abstract into `wiki/raw/papers/`. The daemon picks it up on the next scheduled cycle.
2. **Agent reads and extracts** — The researcher agent identifies the problem, contributions, methodology, results, and limitations. It resolves author names, venue details, and referenced methods.
3. **Wiki pages are written** — A structured paper summary, author profiles, method pages, concept pages, and venue pages are created and cross-linked bidirectionally.
4. **Orchestrator promotes patterns** — Every Monday the orchestrator scans agent memory for recurring patterns, promotes them to synthesis pages, and flags orphans and missing citations.

Every page links back to its sources. When the queue is empty, the agent runs a **Wakeup routine** — scanning for missing links, flagging gaps, and writing a "papers to consider" note to the journal.

---

## Wiki structure

```
wiki/
  raw/papers/    drop arXiv PDFs or .txt abstracts here
  papers/        one structured summary per paper
  authors/       researcher profiles
  methods/       specific algorithms and techniques
  concepts/      higher-level research area concepts
  venues/        conferences and journals
  syntheses/     literature reviews, cross-paper comparisons
  archive/       retired pages (never deleted)
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- [Claude CLI](https://github.com/anthropics/claude-code) (`npm install -g @anthropic-ai/claude-code`)
- `obsidian-hybrid-search` (`npm install -g obsidian-hybrid-search`)

### Install

```bash
git clone https://github.com/drader/papervault my-papervault
cd my-papervault
npm install
```

### First run

```bash
npm run setup
```

Runs a 7-question intake interview. You tell the agent your research area, key concepts, authors you follow, and open questions. It seeds the wiki with starter pages and Bootstrap Hypotheses so day-one output is domain-aware.

### Start the daemon

```bash
npm start                # foreground
npm run dev              # watch mode
npm run install-daemon   # background daemon (launchd on macOS, systemd on Linux)
```

### Ingest a paper

```
/ingest
```

Or just drop a file into `wiki/raw/papers/` — the daemon will pick it up on the next cycle (Tue–Fri 09:00 by default).

---

## Slash Commands

| Command | What it does |
|---|---|
| `/ingest` | Process the next uningest paper in `wiki/raw/papers/` |
| `/query` | Ask a research question, get a wiki-backed answer |
| `/lint` | Check wiki health: orphan pages, missing citations, broken links |
| `/setup` | First-time intake interview |
| `/session-start` | Load context, log session open |
| `/session-end` | Flush scratch notes, log session close |

---

## License

MIT
