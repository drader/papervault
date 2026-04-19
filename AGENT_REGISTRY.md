# Agent Registry

Sistemdeki tüm ajanların dizini.

## Aktif Ajanlar

| Ajan | Klasör | Misyon | Heartbeat | Durum |
|---|---|---|---|---|
| Orchestrator | `agents/orchestrator/` | Koordinasyon, LINT, CONSOLIDATE tetikleme | Haftalık | Aktif |
| Researcher | `agents/researcher/` | Kaynak bulma, INGEST, QUERY | Günlük | Aktif |

## Yeni Ajan Eklemek

1. `agents/[ajan-adı]/` klasörünü oluştur
2. `AGENT.md`, `HEARTBEAT.md`, `MEMORY.md`, `RULES.md` yaz
3. `skills/WIKI_QUERY.md` ve `skills/WIKI_INGEST.md` ekle
4. Bu tabloya ekle
5. `src/scheduler/index.ts` otomatik olarak yeni `HEARTBEAT.md`'yi algılar

## Skill Envanteri

| Skill | Dosya | Hangi Ajanlar |
|---|---|---|
| Wiki Ingest | `skills/WIKI_INGEST.md` | researcher |
| Wiki Query | `skills/WIKI_QUERY.md` | researcher, orchestrator |
| Wiki Lint | `skills/WIKI_LINT.md` | orchestrator |
| Consolidate | `skills/CONSOLIDATE.md` | orchestrator |
| Coordinate | `skills/COORDINATE.md` | orchestrator |
