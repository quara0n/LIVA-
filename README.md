# LIVA

LIVA er et klinikerstyrt verktøy for å bygge trenings- og rehabiliteringsprogrammer.

## Prinsipper
- AI foreslår – kliniker bestemmer
- Programmet er kjernen i produktet
- Alt som eksporteres (PDF) må være eksplisitt redigerbart

## Repo-struktur (kort)
- docs/contracts/   → Autoritative kontrakter (MÅ følges)
- docs/agent/       → Instruksjoner for Codex / AI
- src/domain/       → Programmodell, actions, validering
- apps/web/         → UI (MVP)
- src/pdf/          → PDF-eksport

## Viktig
Alle låste beslutninger ligger i `docs/contracts/`.
Hvis kode og kontrakt er i konflikt, er kontrakten fasit.

