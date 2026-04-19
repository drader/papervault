# Skill: WIKI_QUERY

Wiki'den bilgi çekme. Her ajan kullanır.

## Adımlar

1. obsidian-hybrid-search MCP üzerinden `search(query)` çağır
   - Ranked snippets döner — tüm wiki yüklenmez
   - Yoksa: `wiki/index.md` hub'ını oku, ilgili kategoriyi belirle
2. İlgili sayfaları oku (`read(path)` veya doğrudan dosya okuma)
3. Cevabı sentezle — her iddia için kaynak referansı ver
4. Cevap yeni bir sentez/karşılaştırma içeriyorsa:
   - `wiki/syntheses/` altına yeni sayfa olarak geri-dosyala
   - `wiki/index.md` Syntheses bölümünü güncelle
5. `wiki/log.md`'ye kayıt yaz:
   ```
   ## [YYYY-MM-DD] query | "soru özeti" → filed: syntheses/x.md
   ```
   (Geri-dosyalama yoksa `→ filed` satırını atla)

## Kural
Wiki'de cevap bulunamazsa:
- Hangi bilginin eksik olduğunu söyle
- Hangi kaynağın ingest edilmesi gerektiğini öner
- Tahmin veya kaynaksız iddia üretme
