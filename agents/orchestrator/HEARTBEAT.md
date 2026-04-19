---
schedule: "0 9 * * 1"
token_limit: 8000
---

# Orchestrator Heartbeat

Her Pazartesi 09:00'da çalışır.

## Her Döngüde

### 1. Bağlamı Oku
- `memory/status.md` — proje durumu
- `journal/` son 7 günü — ajan aksiyonları ve sinyaller
- `wiki/index.md` — wiki durumu

### 2. CONSOLIDATE Çalıştır
`skills/CONSOLIDATE.md` talimatlarını uygula:
- Tüm `agents/*/MEMORY.md` dosyalarını oku
- Terfi kriterlerini değerlendir (2+ ajan VEYA 3+ hafta)
- Terfi edenleri `wiki/concepts/` altına yaz
- `wiki/log.md`'ye consolidation kaydı düş

### 3. LINT Çalıştır
`skills/WIKI_LINT.md` talimatlarını uygula:
- wiki/ sağlık kontrolü
- `outputs/reports/lint-report.md` yaz

### 4. Koordinasyon
`skills/COORDINATE.md` talimatlarını uygula:
- Journal'daki çözümsüz konuları tespit et
- Gerekirse `journal/YYYY-MM-DD.md`'ye yönlendirme notu yaz

### 5. Logla
- `wiki/log.md` → operasyon kaydı
- `memory/session-log.md` → döngü özeti

## Eskalasyon
- 3+ haftadır lint bulgu sayısı artıyorsa → `memory/status.md`'ye kritik uyarı yaz
- Consolidation 0 terfi dönüyorsa → wiki'nin büyümediğini `memory/status.md`'ye yaz
