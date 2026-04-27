# Conventions

## Dosya İsimlendirme

| Tür | Kural | Örnek |
|---|---|---|
| Wiki sayfaları | kebab-case | `hook-engagement.md` |
| Sources | `YYYY-MM-slug.md` | `2026-04-goodfellow-dl-ch9.md` |
| Decisions | `YYYY-MM-slug.md` | `2026-04-attention-scope.md` |
| Journal girdisi | `YYYY-MM-DD.md` | `2026-04-19.md` |
| Çıktılar | `YYYY-MM-DD_description.md` | `2026-04-19_lint-report.md` |
| Agent skills | BÜYÜK_HARF.md | `WIKI_QUERY.md` |

## Wiki Sayfa Formatı

Her wiki sayfası bu yapıyı izler:

```markdown
---
title: Sayfa Başlığı
tags: [kavram, araştırma]
source: raw/papers/slug.md
date: 2026-04-19
status: active   # active | stale | archived
---

# Sayfa Başlığı

İçerik buraya.

## ÇELİŞKİ (varsa)
Kaynak A şunu derken, Kaynak B bunu diyor. Çözülmedi.

## Sources
- [[papers/2026-paper-slug]]

## Related
- [[concepts/ilgili-kavram]]
- [[entities/ilgili-entity]]
```

## Sources Sayfa Formatı

Paper olmayan referanslar için — ders kitabı bölümü, blog yazısı, dokümantasyon, standart.

```markdown
---
title: Kaynak başlığı
type: source
kind: textbook | blog | documentation | standard | survey
date: YYYY-MM-DD
status: active
url: https://...   # varsa
---

# Başlık

Kısa özet — bu kaynaktan ne öğrendik, hangi wiki sayfalarını besliyor?

## İlgili Wiki Sayfaları
- [[concepts/...]]
- [[methods/...]]
```

> `wiki/raw/papers/` — fetcher'ın çektiği ham paper içeriği (otomatik)
> `wiki/sources/` — paper olmayan kaynakların manuel notları

## Decisions Sayfa Formatı

```markdown
---
title: Karar başlığı
type: decision
date: YYYY-MM-DD
status: active   # active | revised | superseded
superseded_by:   # varsa yeni karar dosyası
---

# Karar: ...

## Bağlam
Neden bu karar gerekti?

## Karar
Ne yapılmasına karar verildi?

## Gerekçe
Kanıtlar ve argümanlar. [[papers/...]] linkleri buraya.

## Dışarıda Bırakılanlar
Neden alternatifler reddedildi?

## Sonuçlar
Bu karar neleri etkiliyor?
```

> `memory/decisions.md` — ne karar verildi (anlık referans, Tier 1)
> `wiki/decisions/` — neden ve hangi kanıtla (tam gerekçe, çapraz bağlantılı, Tier 3)

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
