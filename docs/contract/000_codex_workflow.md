# Codex Workflow – LIVA (LÅST)

## Formål

Sikre forutsigbar implementasjon i et kontraktstyrt repo.

## Absolutte regler (LÅST)

- docs/contract/ er source of truth.
- Ingen redesign, ingen “rydde litt ekstra”, ingen forbedringer uten kontrakt.
- Implementer kun det kontrakten beskriver (ikke mer, ikke mindre).
- Hvis noe er uklart: stopp og spør (ikke gjett).

## Arbeidsform (LÅST)

- 1 kontrakt → 1 implementasjon → 1 manuell verifisering → 1 commit.
- Ikke bland flere kontrakter i samme commit.
- Bruk branch per oppgave.

## Fil-ansvar etter refactor (kontrakt 13–15) (LÅST)

- app.js: kun bootstrap/init (seed state, bind events, første render). Ikke featurelogikk.
- state/program.actions.js: all state-mutasjon og “commands” (create/open/update program).
- state/program.storage.js: persistens (draft/arkiv/localStorage). Ikke UI.
- ui/render.js: all HTML-templates/rendering. Ingen persistens.
- ui/events.js: alle event listeners og UI-handlers (delegation). Ingen persistens.
- index.html: én fil, seksjonert. Kun strukturelle wrappers/hooks (ikke templating).
- CSS: splittet i base/toolbar/program/library. Ingen redesign uten kontrakt.

## Instruksformat ved nye oppgaver (LÅST)

Ved implementasjon skal Codex alltid starte svaret med:

1. Hvilken kontrakt implementeres (filnavn)
2. Hvilke filer endres (fil-scope)
3. Hvordan det verifiseres manuelt (kort sjekkliste)

## Forbud (LÅST)

- Ingen modaler med mindre kontrakt sier det.
- Ingen nye routes/sider med mindre kontrakt sier det.
- Ingen endring i høyre bibliotek eller toppheader med mindre kontrakt sier det.
