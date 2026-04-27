# /structural-update

Yapısal değişiklik sonrası standart güncelleme protokolü.

## Ne Zaman Uygulanır

Her yapısal değişikliğin ardından **otomatik olarak** uygulanır:
- Yeni modül veya dizin eklenmesi
- Mevcut modülün silinmesi veya yeniden adlandırılması
- Bağımlılık ekleme/çıkarma
- Workflow veya otomasyon değişiklikleri
- Önemli davranış değişiklikleri

## Adımlar

### 1. Atıl / Kullanılmayan Kısımları Tespit Et

Yapılan değişikliğin ardından projede artık geçersiz veya gereksiz hale gelen öğeleri listele:

- Artık kullanılmayan dosyalar, importlar, bağımlılıklar
- Güncellenmesi gereken referanslar (dokümantasyon, config, README)
- Silinebilecek template kalıpları veya örnek dosyalar
- Mimari sayfayla çelişen eski bilgiler

Listeyi kullanıcıya sun ve her madde için ne yapılacağını sor (sil / güncelle / görmezden gel).

### 2. Kullanıcı Onayından Sonra

Onaylanan işlemleri gerçekleştir, ardından:

**docs/index.html** — Sunumda değişen bilgileri güncelle:
- Özellik açıklamaları
- Stack bilgileri
- Terminal örnekleri

**docs/architecture/index.html** — Mimari sayfada değişen bilgileri güncelle:
- Pipeline adımları
- Miras tablosu (Miras / Uyarlandı / Yeni sayıları)
- Katman diyagramları

**README.md** — Varsa güncel olmayan kurulum adımları, env değişkenleri, özellik listesi.

### 3. Tamamlanma

Tüm güncellemeler yapıldıktan sonra kullanıcıya bildir.
Commit önerisi sun; kullanıcı onayına kadar commit atma.
