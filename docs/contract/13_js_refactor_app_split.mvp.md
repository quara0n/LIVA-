Formål

Splitte apps/web/app.js i tydelige moduler etter ansvar for å øke kontroll, redusere feil-endringer og gjøre videre integrasjoner (f.eks. AI/arkiv/export) enklere.

Scope (MVP)

Gjelder kun frontend-kode i apps/web/.

Kun refactor (flytting/organisering), ingen feature-endringer.

Ingen endringer i UI/UX, tekst, validering, PDF-format, HTML-struktur eller CSS-klasser.

LÅST: Ingen funksjonelle endringer

Etter refactor skal alt oppføre seg identisk:

Samme state-endringer ved samme handling

Samme DOM-resultat for samme handlinger

Samme PDF-eksport-resultat

Samme startstate-/programflyt (inkl. kontrakt 12)

Målstruktur (LÅST)

Opprett og bruk følgende filer:

apps/web/state/program.actions.js
Ansvar:

Opprettelse og mutasjon av program-state (ingen DOM)

Flytt hit: createEmptyDraft, addExercise, removeExercise, moveExercise, updateDosering, updateSekundar,
alt-flyt: toggleAltSection, toggleShowMore, openAltPicker, cancelAltPicker, saveAltPicker, toggleDetails,

datatunge hjelpere: getSection, getHoveddelSection, getNotaterSection, isInProgram, finnOvelserUtenUtforelse, getMasterById (om ønskelig).

apps/web/state/program.storage.js
Ansvar:

Persistens (draft): saveDraft, loadDraft, storage keys

Kun serialisering/deserialisering (ingen DOM)

apps/web/ui/render.js
Ansvar:

Rendering/templating og DOM-oppdatering

Flytt hit: render, renderProgram, renderLibrary, renderAlternativer, renderAltPickerControls

Render skal kun lese state og skrive til DOM (ingen state-mutasjon)

apps/web/ui/events.js
Ansvar:

Alle addEventListener(...) bindings og event-delegation

Kaller actions + render() (ingen HTML-templates her)

apps/web/app.js (bootstrap)
Ansvar:

Init: last seeds, init state, kall bindEvents(...), kall render()

Skal ikke inneholde store templates eller store eventblokker etter refactor

Import/Export-regler (LÅST)

Ingen sirkulære imports.

Eksisterende funksjonsnavn beholdes der mulig for minimal diff.

state kan fortsatt være ett delt objekt (eksportert fra app.js eller egen state/index.js hvis nødvendig), men:

actions muterer state

render leser state

events binder UI til actions/render

storage lagrer/loader state

Forbud (MVP)

Ikke endre HTML-struktur eller CSS-klassenavn.

Ikke endre tekster, labels, toasts, valideringslogikk.

Ikke endre PDF-logikk eller filplasseringer.

Ikke introduser framework/bundler.

Akseptansekriterier (må verifiseres manuelt)

Etter refactor skal følgende virke identisk:

Seed-load og initial visning

Søk i bibliotek

Legg til øvelse

Endre dosering (reps/sett)

Flytt opp/ned

Fjern øvelse

Progresjon/regresjon: åpne panel, velg, lagre, vis valgte

Eksporter PDF

Program startstate/opprett program (kontrakt 12)

Leveransekrav

Én PR/commit med refactor.

Oppsummer:

filer opprettet/endrede

hva som ble flyttet hvor

hvilke acceptance-punkter som ble testet
