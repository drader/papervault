# Skill: WIKI_LINT

Wiki sağlık kontrolü. Haftalık çalışır.

## Adımlar

1. `wiki/` altındaki tüm markdown dosyalarını tara (`raw/` ve `archive/` hariç)
2. Şu kategorilerde bulguları tespit et:

   **ÇELİŞKİ**: İki sayfa aynı konuda zıt iddia içeriyor mu?
   **ESKİMİŞ**: Son 30 günde `raw/`'a eklenen kaynak mevcut sayfaları geçersiz kılıyor mu?
   **YETİM**: Hiçbir yerden `[[link]]` almayan sayfalar
   **EKSİK KAVRAM**: Wiki'de 3+ sayfada geçen ama kendi sayfası olmayan kavramlar
   **TEK YÖNLÜ**: A sayfası B'ye link veriyor ama B, A'yı `## Related`'da saymıyor
   **SCHEMA**: Frontmatter'da zorunlu alan (title, date, status) eksik

3. `outputs/reports/lint-report.md` dosyasını yaz:
   ```markdown
   # Lint Report — YYYY-MM-DD
   Taranan dosya: N | Toplam bulgu: M

   ## Yüksek Öncelik
   - [BULGU_TİPİ] dosya.md — açıklama — öneri

   ## Orta Öncelik
   ...

   ## Düşük Öncelik
   ...
   ```

4. `wiki/log.md`'ye kayıt yaz:
   ```
   ## [YYYY-MM-DD] lint | N bulgu (Y:yüksek O:orta D:düşük)
   ```

## Kural
Otomatik düzeltme yapma — sadece raporla.
Düzeltme kararı insana veya sonraki INGEST/QUERY döngüsüne bırakılır.
