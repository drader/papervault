# Conventions

## Dosya İsimlendirme

| Tür | Kural | Örnek |
|---|---|---|
| Wiki sayfaları | kebab-case | `hook-engagement.md` |
| Source özeti | `YYYY-MM-DD-slug.md` | `2026-04-19-llm-memory-paper.md` |
| Journal girdisi | `YYYY-MM-DD.md` | `2026-04-19.md` |
| Çıktılar | `YYYY-MM-DD_description.md` | `2026-04-19_lint-report.md` |
| Agent skills | BÜYÜK_HARF.md | `WIKI_QUERY.md` |

## Wiki Sayfa Formatı

Her wiki sayfası bu yapıyı izler:

```markdown
---
title: Sayfa Başlığı
tags: [kavram, araştırma]
source: sources/2026-04-19-makale.md
date: 2026-04-19
status: active   # active | stale | archived
---

# Sayfa Başlığı

İçerik buraya.

## ÇELİŞKİ (varsa)
Kaynak A şunu derken, Kaynak B bunu diyor. Çözülmedi.

## Sources
- [[sources/2026-04-19-makale]]

## Related
- [[concepts/ilgili-kavram]]
- [[entities/ilgili-entity]]
```

## Log Formatı

```
## [YYYY-MM-DD] ingest | kaynak-slug
## [YYYY-MM-DD] query  | "soru özeti" → filed: syntheses/x.md
## [YYYY-MM-DD] lint   | N bulgu (Y:yüksek O:orta D:düşük)
## [YYYY-MM-DD] consolidate | N promoted, M archived
```

## MEMORY.md Formatı

```markdown
## İşe Yarayanlar
- Kalıp açıklaması. Kanıt: [ne gözlemlendi, ne zaman].

## İşe Yaramayanlar
- Anti-kalıp. Kanıt: [ne gözlemlendi].

## Bootstrap Hypotheses
- Hypothesis: [alan bilgisinden gelen başlangıç tahmini] [doğrulanmadı]

## Fark Edilen Örüntüler
- Sinyal: [gözlem]. Doğrulama için daha fazla veri gerekiyor.
```

## Terfi Kriteri (MEMORY.md → wiki/)

- 2+ ajanın MEMORY.md'sinde aynı kalıp geçiyorsa → wiki/concepts/ 'e terfi
- 1 ajanda ama 3+ hafta boyunca tekrar ediyorsa → wiki/concepts/'e terfi
- 1 ajanda, ilk hafta, tek gözlem → bekle
