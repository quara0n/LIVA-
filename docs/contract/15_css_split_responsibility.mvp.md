# 15_css_split_responsibility.mvp.md

Node: UX & UI / Programbygger / PDF (MVP)
Status: LOCKED (MVP)
Type: Refactor (struktur) – INGEN feature-endringer

## Formål

Splitte eksisterende CSS i flere filer etter ansvar, slik at videre arbeid blir mer forutsigbart og mindre risikabelt.
Dette er en ren organisering/refactor. UI skal se likt ut.

## Scope

- Kun CSS-filstruktur + flytting av eksisterende regler
- Kun oppdatering av <link>-referanser i index.html (eller tilsvarende) for å inkludere de nye CSS-filene i riktig rekkefølge
- Ingen endring i HTML-struktur (HTML-seksjonering er allerede gjort)
- Ingen endring i JS

## Non-goals (skal IKKE gjøres)

- Ikke redesign
- Ikke “forbedre” spacing, farger, font, borders, shadows
- Ikke rydde i CSS utover det som er nødvendig for å flytte
- Ikke endre naming/klasser/ID-er (CSS kan targete nye wrappers, men ikke endre HTML)
- Ikke introdusere nye design-tokens eller komponentbibliotek
- Ikke slå sammen/omskrive regler “for å gjøre det penere” (kun flytt)

## Ny filstruktur (MVP)

Opprett følgende filer:

- apps/web/css/base.css
  - reset/typografi/grunnregler og generelle elementregler
  - generelle utils hvis de allerede finnes (ikke legg til nye)

- apps/web/css/toolbar.css
  - toppbar/toolbar
  - .app-toolbar, .toolbar-actions og direkte tilknyttede elementer

- apps/web/css/program.css
  - venstre panel (programbygger)
  - .panel-left, .program-shell, .program-startstate, .program-canvas
  - .program-header, .patient-inline
  - .exercise-list, .exercise-item, .exercise-main-row
  - .exercise-children\* (progresjon/regresjon wrappers)

- apps/web/css/library.css
  - høyre panel (øvelsesbibliotek)
  - .panel-right, .library-header, .library-list
  - #library-grid og tilknyttede bibliotek-regler

## Import / rekkefølge i HTML

Oppdater index.html (eller tilsvarende) slik at CSS lastes i denne rekkefølgen:

1. base.css
2. toolbar.css
3. program.css
4. library.css

Behold ellers alt uendret.

## Flytte-regler

- Flytt eksisterende CSS 1:1 inn i riktig fil
- Behold samme property-verdier
- Behold samme selectors der det er mulig
- Hvis en selector må justeres for å holde den lokal (pga split), er kun følgende tillatt:
  - legge til wrapper-scope foran eksisterende selector, f.eks:
    - `.panel-left .btn { ... }` (dersom `.btn` opprinnelig var global og skapte kollisjon)
  - ingen endring i verdier

## Akseptansekriterier (må bestås)

### Visuelt (før/etter)

- UI ser identisk ut:
  - layout, spacing, font, knapper, borders
  - venstre/høyre panel ser likt ut
  - toolbar ser likt ut
  - progresjon/regresjon-seksjoner ser likt ut

### Funksjonelt (sanity check)

- Starttilstand: "Lag program" fungerer som før
- Legg til/fjern øvelse fungerer
- Dosering kan endres
- Flytt opp/ned fungerer
- Progresjon/regresjon fungerer og vises som barn
- PDF eksport fungerer som før

## Leveranse

- Nye CSS-filer opprettet og inkludert
- Gammel CSS-fil enten:
  - erstattes av små imports, eller
  - beholdes tom/avvikles (velg én tydelig løsning)
- Kort endringslogg i PR/commit-melding:
  - hvilke filer ble laget
  - hva som ble flyttet hvor
  - evt. hvilke selectors som måtte scopes (hvis noen)
