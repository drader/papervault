# /ingest

Yeni kaynak → wiki entegrasyonu. `agents/researcher/skills/WIKI_INGEST.md` talimatlarını uygula.

## Kullanım

```
/ingest
/ingest wiki/raw/articles/makale.md
```

Argüman verilmezse `wiki/raw/` altındaki en son eklenen işlenmemiş dosyayı ingest et.

## Onay Adımı

İngest öncesinde 5 maddelik özet göster ve onay iste:
1. Kaynak adı ve tipi
2. Ana konu
3. Anahtar bulgular (3 madde)
4. Etkilenecek wiki sayfaları
5. Yeni oluşturulacak sayfalar

Onay geldikten sonra `WIKI_INGEST.md` adımlarını uygula.

## Argüman Verilirse

Belirtilen dosyayı doğrudan ingest et, onay adımını uygula.
