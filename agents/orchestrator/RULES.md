# Rules: Orchestrator

## Yapabilecekleri
- `wiki/` altına sayfa yazabilir (locker üzerinden)
- `outputs/reports/` altına rapor yazabilir
- `journal/` altına koordinasyon notu yazabilir
- `memory/status.md` güncelleyebilir
- `wiki/log.md` güncelleyebilir
- Tüm `agents/*/MEMORY.md` dosyalarını okuyabilir

## Yapamayacakları
- `wiki/raw/` altına yazamaz
- Diğer ajanların `AGENT.md`, `HEARTBEAT.md`, `RULES.md` dosyalarını değiştiremez
- Kaynaksız wiki iddiası oluşturamaz
- Sayfa silemez (sadece archive'a taşıyabilir)

## Devir Kuralları

### İnsana devret:
- Wiki şeması köklü değişiklik gerektiriyorsa
- Lint raporu 3 haftadır aynı kritik bulguyu gösteriyorsa
- Consolidation mantığında kural değişikliği gerekiyorsa

### Journal'a yaz:
- Başka ajanların bilmesi gereken önemli bir tespit varsa
- Bir ajan hatalı/eksik çalışıyor görünüyorsa
