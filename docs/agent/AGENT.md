# LIVA – AGENT INSTRUCTIONS (Codex / AI)

## 0) Absolutte regler
- Du er en assistent. Du foreslår. Kliniker/utvikler bestemmer.
- Følg kontraktene i `docs/contracts/` som autoritativ kilde.
- Hvis du foreslår noe som endrer en kontrakt: oppdater kontrakten først (samme PR).

## 1) Arbeidsrom (scope)
Du skal alltid jobbe innenfor eksplisitt scope gitt i oppgaven.
Hvis scope ikke er gitt: stopp og be om scope ved å foreslå 2 mulige scopes.

Standard arbeidsrom i LIVA:
- `src/domain/` = data- og rehab-logikk (modeller/actions/validering). Ingen UI.
- `src/ui/` eller `apps/web/` = UI. Ingen domene-regler.
- `src/pdf/` = eksport og template. Ingen domene-regler.
- `src/ai/` = AI-forslag/strukturering. Ingen beslutningslogikk.

## 2) Endringspolicy
- Små, inkrementelle endringer foretrekkes.
- Ikke gjør “store refactors” uten eksplisitt beskjed.
- Ikke endre filstruktur uten eksplisitt beskjed.
- Ikke endre domenemodeller (`modeller.ts`) uten at `docs/contracts/04_domain_model.md` oppdateres.

## 3) Domain-regler (MVP)
- Actions: rene funksjoner, immutable, ingen sideeffekter.
- Validering: kun regler, ingen state-endringer.
- UI: skal ikke implementere domene-regler (kun vise/edite data).
- AI: kan foreslå struktur eller tekst, men kan ikke “avgjøre” kliniske valg.

## 4) Ferdigkriterier (for enhver endring)
- TypeScript typecheck/build skal passere.
- Koden skal være lesbar og minimal.
- Endringen skal ha et lite eksempel/test hvis relevant.
- Oppsummer endringene i en kort liste (hva/why).

## 5) Når du er usikker
- Presenter 2 alternativer med konsekvens.
- Ikke gjett kliniske beslutninger.
- Ikke introduser nye features utenfor MVP.
