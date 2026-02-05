# LIVA – Prompt templates (til Codex)

## Template A: Domain-oppgave (trygt)
Du jobber i LIVA.
Følg kontraktene i `docs/contracts/` (spesielt 01_mvp.md, 04_domain_model.md, 05_rehab_logic.md).
Scope: Du kan kun endre filer i `src/domain/`. Ikke rør UI/PDF/AI.

Oppgave:
- [Skriv én konkret oppgave]

Krav:
- Actions er rene og immutable
- Ingen validering i actions
- Validering i `src/domain/validering.ts`
- Ikke endre `modeller.ts` uten å oppdatere `docs/contracts/04_domain_model.md`

Ferdig når:
- Typecheck/build passerer
- Endringen har et lite eksempel/test (hvis relevant)

---

## Template B: UI-oppgave (trygt)
Du jobber i LIVA.
Følg kontraktene i `docs/contracts/` (spesielt 03_ux_mvp.md og 01_mvp.md).
Scope: Du kan kun endre filer i `apps/web/` (eller `src/ui/`). Ikke rør domain.

Oppgave:
- [Skriv én konkret UI-oppgave]

Krav:
- UI må bruke domain-modellen uten å innføre nye regler
- Alt som eksporteres må være eksplisitt redigerbart (UX-kontrakt)
- Ingen “magiske” defaults uten kontrakt

Ferdig når:
- Build passerer
- UI endrer kun presentasjon/inputs

---

## Template C: PDF-oppgave (trygt)
Du jobber i LIVA.
Følg kontraktene i `docs/contracts/06_pdf_contract.md` og `04_domain_model.md`.
Scope: Du kan kun endre `src/pdf/`.

Oppgave:
- [Skriv én konkret PDF-oppgave]

Krav:
- PDF må kunne genereres uten manuell etterarbeid
- Bruk snapshot-felter (f.eks. ovelseInstans.navn)
- Ikke implementer domene-regler i PDF-laget

Ferdig når:
- PDF genereres fra seed/eksempel
- Typecheck/build passerer
