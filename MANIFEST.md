# MANIFEST — Context Routing Map

Her oturumda bu dosya okunur. Hangi dosyaların ne zaman yükleneceğini tanımlar.

## Tier 1 — Her Oturumda Yükle

Token bütçesi: 4000 token. Aşılırsa `session-log.md` eski satırları budlanır.

```
memory/status.md
memory/decisions.md
memory/glossary.md
memory/session-log.md     (son 10 giriş)
scratch/ideas.md
journal/                  (son 3 günün dosyaları)
```

## Tier 2 — İlgili Alan Aktifken Yükle

Token bütçesi: 8000 token.

```
wiki/index.md             (tüm wiki için giriş noktası — hub)
agents/[aktif-ajan]/AGENT.md
agents/[aktif-ajan]/MEMORY.md
```

Wiki araması için önce `wiki/index.md` okunur, ilgili sayfalar belirlenir,
sonra sadece o sayfalar yüklenir. Tüm wiki hiçbir zaman tek seferde yüklenmez.
Büyük wiki'lerde (>100 sayfa) obsidian-hybrid-search MCP kullanılır.

## Tier 3 — Sadece Açıkça İstenince Yükle

```
wiki/archive/
wiki/raw/                 (ingest dışında açılmaz)
outputs/reports/
journal/                  (3 günden eski)
```

## Arama Önceliği

1. obsidian-hybrid-search MCP `search()` → ranked snippets
2. `wiki/index.md` hub → ilgili kategori → sayfa
3. Hiçbiri yoksa → `/ingest` ile yeni kaynak ekle
