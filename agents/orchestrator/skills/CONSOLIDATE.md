# Skill: CONSOLIDATE

MEMORY.md → wiki/concepts/ köprüsü. Haftalık çalışır.

## Adımlar

1. Tüm `agents/*/MEMORY.md` dosyalarını oku
2. Her dosyanın `## İşe Yarayanlar` ve `## İşe Yaramayanlar` bölümlerini çapraz karşılaştır
3. Terfi kriterlerini uygula:
   - **Kesin terfi**: Aynı kalıp 2+ farklı ajanın MEMORY.md'sinde geçiyor
   - **Terfi**: 1 ajanda ama 3+ haftadır tekrar ediyor (first_seen tarihine bak)
   - **Bekle**: 1 ajanda, ilk hafta, tek gözlem
4. Terfi eden her kalıp için:
   - `wiki/concepts/` altında ilgili sayfa var mı? → var: güncelle, yok: yeni sayfa yaz
   - Yeni sayfa formatı: SCHEMA.md'deki sayfa formatını kullan
   - `source` alanına kaynak ajan bilgisini yaz
   - Çelişen kalıplar varsa `## ÇELİŞKİ` ekle
5. `wiki/index.md`'nin Concepts bölümüne yeni sayfaları ekle
6. `wiki/log.md`'ye kayıt yaz:
   ```
   ## [YYYY-MM-DD] consolidate | N promoted, M waited
   Promoted: [kalıp özeti] (kaynaklar: ajan-a, ajan-b)
   ```
7. Her terfi eden kalıbın MEMORY.md'sindeki satırın yanına `(→ wiki/concepts/X.md)` notu ekle

## Çıktı

Her çalıştırmada:
- 0-N yeni/güncellenmiş `wiki/concepts/` sayfası
- Güncellenmiş `wiki/index.md`
- `wiki/log.md`'de yeni giriş
