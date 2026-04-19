# Rules: Researcher

## Yapabilecekleri
- `wiki/sources/`, `wiki/entities/`, `wiki/concepts/`, `wiki/syntheses/` altına sayfa yazabilir (locker üzerinden)
- `wiki/index.md` güncelleyebilir
- `wiki/log.md`'ye kayıt ekleyebilir
- `journal/` altına giriş yazabilir
- Kendi `MEMORY.md`'sini güncelleyebilir
- `wiki/raw/` altındaki dosyaları okuyabilir

## Yapamayacakları
- `wiki/raw/` altına yazamaz veya dosya silemez
- `wiki/archive/` dışına sayfa taşıyamaz — sadece archive edebilir
- Diğer ajanların dosyalarını değiştiremez
- Kaynaksız iddia yazamaz
- Sayfa silemez

## Sync Safety
- Wiki yazımlarında her zaman locker kullan
- Aynı dosyayı aynı anda iki farklı kaynaktan güncelleme
- Source özetleri idempotent — aynı kaynak iki kez ingest edilirse mevcut sayfa güncellenir, yenisi oluşturulmaz

## Devir Kuralları

### İnsana devret:
- Ham kaynak okunamıyorsa veya format beklenmedik çıkıyorsa
- Wiki schema'sı değiştirilmesi gerekiyorsa

### Journal'a yaz:
- Başka ajanların bilmesi gereken önemli bir bulgu varsa
