Formål

Gjør DOM-en tydeligere og mer robust for videre CSS-splitt – uten å endre layout, tekst, rekkefølge eller interaksjon.

Låste regler (anti-redesign)

Ingen endring i visuell layout (skal se identisk ut).

Ingen endring i copy/labels/knapper.

Ingen nye features / ingen fjerning av features.

Kun wrappers / semantiske seksjoner / klasse-navn (for CSS-targeting).

Eksisterende hooks brukt av ui/events.js må fortsatt fungere.

Krav (konkret)

Legg inn tydelige “wrappers” for:

App shell (hele siden)

Venstre panel: programbygger (inkl. startstate “Lag program”)

Høyre panel: øvelsesbibliotek

Program header: pasientinfo (navn + e-post) inline (ingen endring i innhold)

Program liste/innhold: øvelser + progresjon/regresjon som barn

Kontroller/toolbar: eksportknapp(er), evt relevante actions (uten endring i funksjon)

Kun klasse-navn som gjør CSS-splitt mulig senere, f.eks.:

.app-shell, .panel-left, .panel-right

.program-header, .patient-inline

.program-canvas, .exercise-list

.library-header, .library-list

Verifisering (må bestås)

Man kan fortsatt:

starte program via “Lag program”

legge til/fjerne øvelser

endre dosering

flytte rekkefølge

legge til progresjon/regresjon og de vises som barn

eksportere PDF og innholdet er uendret

Visuelt: “før/etter” skal være identisk.

Steg 2 (etter HTML): CSS splitt etter ansvar (ingen layoutendring)
Ny kontraktfil

15_css_split_responsibility.mvp.md

Formål

Gjør CSS vedlikeholdbar uten å endre utseende.

Låste regler

Pixel/visuelt identisk (innenfor rimelighet).

Ingen nye farger, spacing, fonts, borders.

Kun flytting/organisering og ev. små “selector”-justeringer for å matche nye wrappers.

Krav (konkret)

Splitt CSS i 3 filer (eller 4 hvis du vil):

css/base.css (reset, typografi, tokens/variabler, generelle utils)

css/program.css (venstre panel, programbygger, øvelsesrader, progresjon/regresjon)

css/library.css (høyre panel, søk/filter hvis eksisterer, liste)

(valgfri) css/components.css (knapper, inputs, småkomponenter) – kun hvis dere allerede har repetisjon

index.html (eller tilsvarende) inkluderer filene i stabil rekkefølge (base først).

Verifisering

Samme funksjons-sjekkliste som over.

Ingen “cleanup” utover det kontrakten sier.
