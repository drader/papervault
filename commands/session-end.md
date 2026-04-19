# /session-end

Oturum kapanışı. Hafızayı güncelle, wikilink bütünlüğünü doğrula.

## Adımlar

1. Bu oturumda ne yapıldığını özetle (3-5 madde)

2. `memory/status.md` güncelle:
   - "Şu An Ne Yapılıyor" bölümünü güncelle
   - Tamamlanan konuları kaldır, yenileri ekle

3. `memory/session-log.md`'ye giriş ekle:
   ```
   ## [YYYY-MM-DD] session-end
   - Yapılan: [özet]
   - Sonraki: [bir sonraki oturumda yapılacak]
   ```

4. Bu oturumda alınan önemli kararları `memory/decisions.md`'ye ekle

5. Wikilink kontrolü: Bu oturumda yazılan sayfalardaki `[[linkler]]` var olan dosyalara mı işaret ediyor?
   - Kırık link varsa listele (düzeltme yapma, sadece raporla)

6. `wiki/log.md`'ye oturum özeti yaz:
   ```
   ## [YYYY-MM-DD] session-end | N ingest, M query, K yeni sayfa
   ```

## Kural
session-log.md 50 satırı aşarsa eski girişleri `outputs/reports/session-log-archive-YYYY-MM.md`'ye taşı.
