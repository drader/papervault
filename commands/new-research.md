# /new-research

Yeni araştırma konusu başlat: klasör yap, GitHub Actions workflow oluştur.

## Kullanım

```
/new-research Attention Mechanisms
```

## Adımlar

### 1. Slug, başlık ve schedule

Argümandan konu adını al. Slug kural: küçük harf, Türkçe karakter yok, boşluk → tire.
Örnek: "Attention Mechanisms" → `attention-mechanisms`

Eğer argüman verilmemişse kullanıcıya sor.

Kullanıcıya araştırma sıklığını sor:
- **Haftalık** → `0 6 * * 1` (Her Pazartesi 09:00 Istanbul)
- **İki haftada bir** → `0 6 1,15 * *` (Ayın 1'i ve 15'i)
- **Aylık** → `0 6 1 * *` (Her ayın 1'i) ← varsayılan
- **Özel** → kullanıcının verdiği cron ifadesi

### 2. Konuyu araştır

WebSearch ile konuyu hızlıca araştır:
- Ana alt alanlar ve araştırma kolları neler?
- Öne çıkan araştırmacılar, kurumlar, laboratuvarlar kimler?
- Bu konuda hangi venue'lar (konferans/dergi) öne çıkıyor?
- En önemli 8-12 arama keyword'ü neler?
- Son 3 ayda dikkat çeken paper'lar var mı?

### 3. Klasörü ve dosyaları oluştur

`research/{slug}/` altında 3 dosya oluştur:

**index.md** — şu frontmatter ile:
```yaml
---
title: {Başlık}
type: research
status: active
last_researched: {bugünün tarihi YYYY-MM-DD}
research_schedule: "{cron ifadesi}"
search_keywords:
  - {araştırmadan çıkan keyword 1}
  - {araştırmadan çıkan keyword 2}
  - ... (8-12 arası)
focus_venues:
  - {öne çıkan konferans/dergi 1}
  - {öne çıkan konferans/dergi 2}
---
```
İçerik: konunun kısa teknik çerçevesi, araştırma kolları tablosu, keyword haritası, dosya listesi.

**candidates.md** — araştırmada bulunan paper adaylarıyla dolu başlangıç tablosu:
```markdown
---
title: {Başlık} — Paper Adayları
type: research-candidates
last_updated: {bugünün tarihi}
---

# Paper Adayları

Bu dosya fetch ve ingest adayı paper'ları takip eder.
Durum: ☐ keşfedildi · ☑ fetch edildi · ✓ ingested

## {Alt Alan 1}

| Başlık | Venue / Yıl | Yazarlar | arXiv / DOI | Durum |
|---|---|---|---|---|
| {paper başlığı} | {venue, yıl} | {yazarlar} | {arXiv ID veya DOI} | ☐ |
```
Hiç paper bulunamazsa boş tablo şablonu yaz.

**log.md** — tek giriş:
```
## [{bugünün tarihi}] research | ilk araştırma — /new-research komutuyla oluşturuldu
Aday: {bulunan paper sayısı}
```

### 4. GitHub Actions workflow oluştur

`.github/workflows/research-{slug}.yml` dosyasını oluştur:

```yaml
name: Research — {Başlık}

on:
  schedule:
    - cron: '{cron ifadesi}'
  workflow_dispatch:
    inputs:
      topic:
        description: 'Research topic slug'
        required: false
        default: '{slug}'

jobs:
  research:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci

      - name: Configure git
        run: |
          git config user.name  "papervault-bot"
          git config user.email "papervault-bot@users.noreply.github.com"

      - name: Run research
        env:
          ANTHROPIC_API_KEY:          ${{ secrets.ANTHROPIC_API_KEY }}
          LLM_MODEL:                  ${{ secrets.LLM_MODEL }}
          RESEARCH_TOPIC:             {slug}
          # Optional: improves Semantic Scholar rate limits
          SEMANTIC_SCHOLAR_API_KEY:   ${{ secrets.SEMANTIC_SCHOLAR_API_KEY }}
          # Optional: enables paper-search-mcp CLI (20+ sources)
          # Requires: pip install paper-search-mcp in a prior step
        run: npx tsx src/research/index.ts
```

### 5. Log yaz

`wiki/log.md`'ye ekle:
```
## [{bugünün tarihi}] new-research | {slug}
Schedule: {cron}. Dosyalar: research/{slug}/ (yeni). Workflow: .github/workflows/research-{slug}.yml
```

### 6. Kullanıcıya özet sun

- Oluşturulan klasör ve dosyalar
- Bulunan paper adayı sayısı
- GitHub Actions workflow adı ve schedule'ı
- Önerilen ilk adım: hangi paper'ı önce fetch etmeli → `npm run fetch {arXiv ID}`
