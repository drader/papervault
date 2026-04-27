# /fetch-paper

Verilen arXiv ID, DOI veya URL için çok kaynaklı cascade fetcher'ı çalıştır ve sonucu `wiki/raw/papers/` altına yaz.

## Kullanım

```
/fetch-paper 2301.12345
/fetch-paper https://arxiv.org/abs/2301.12345
/fetch-paper 10.1145/3386392
/fetch-paper https://doi.org/10.1038/s41586-020-2649-2
```

## Adımlar

1. `npm run fetch -- "<input>"` komutunu çalıştır
2. Çıktıdan `meta`, `fullText` ve `format` alanlarını al
3. `meta.title` değerinden slug üret: küçük harf, boşluklar tire, özel karakterler kaldır
4. `wiki/raw/papers/<slug>.md` dosyasını oluştur:

```markdown
---
title: <meta.title>
authors: [<meta.authors virgülle>]
year: <meta.year>
venue: <meta.venue>
arxivId: <meta.arxivId>
doi: <meta.doi>
source: <result.source>
format: <result.format>
quality: <result.quality>
fetchedAt: <result.fetchedAt>
---

## Abstract

<result.abstract>

## Full Text

<result.fullText>
```

5. Eğer `fullText` yoksa sadece abstract ile kaydet ve bunu belirt
6. Dosya yolu ve kalite bilgisini kullanıcıya raporla
7. `/ingest` komutunu çalıştırmayı öner

## Hata Durumları

- Hiçbir kaynaktan sonuç gelmezse: kullanıcıya hangi kaynaklara denediğini raporla
- Kalite 0 ise (sadece abstract): ingest'in sınırlı olacağını uyar
- `sources-config.json` eksikse: `sources-config.example.json`'ı kopyalayıp düzenlemesini söyle (`cp sources-config.example.json sources-config.json`)
