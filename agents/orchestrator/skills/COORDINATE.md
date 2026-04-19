# Skill: COORDINATE

Ajan koordinasyonu. Haftalık döngünün sonunda çalışır.

## Adımlar

1. `journal/` son 7 günü oku
2. Çözümsüz konuları tespit et:
   - Birden fazla ajanda tekrar eden ama sonuçlanmayan bir görev var mı?
   - Bir ajan başka bir ajana bağımlı ama iletişim yok mu?
   - Çelişen journal girişleri var mı?
3. Gerekirse `journal/YYYY-MM-DD.md`'ye koordinasyon notu yaz:
   ```markdown
   ## [orchestrator] Koordinasyon Notu
   Konu: ...
   İlgili ajanlar: ...
   Önerilen aksiyon: ...
   ```
4. `memory/status.md`'deki "Açık Konular" bölümünü güncelle

## Kural
Başka ajanların dosyalarını değiştirme.
Sadece journal üzerinden iletişim kur.
