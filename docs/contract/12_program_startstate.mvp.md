Formål

Gi venstre panel en tydelig starttilstand slik at kliniker eksplisitt oppretter et program før redigering.

Scope (MVP)

Gjelder kun venstre “Program”-panel sin tomtilstand og oppstart. Ingen redesign av resten av siden.

Starttilstand (LÅST)

Når det ikke finnes et aktivt program (første gang / tom state):

Venstre panel viser kun:

En primærknapp: “Lag program”

(Valgfritt) én kort hjelpelinje

Følgende skal IKKE vises i starttilstand:

øvelsesliste i programmet

instruksjonsfelt

progresjon/regresjon UI

dosering/redigering

“ingen øvelser lagt til ennå”-tekst (den erstattes av starttilstanden)

Opprett program (LÅST)

Når kliniker trykker “Lag program”:

Starttilstanden forsvinner

Programbygger-visningen vises (som i dagens løsning)

Programmet initialiseres som et “utkast”.

Pasientinfo (LÅST)

Når programbygger-visningen er aktiv, skal det vises en liten “pasientrad” i toppen av programområdet:

Felt:

Pasientnavn (tekst)

E-post (tekst, valgfritt)

Interaksjon:

Feltene kan editeres inline

E-post er alltid valgfri i MVP

Pasientnavn kan være tomt under redigering (blokkerer ikke å legge til øvelser)

Krav til “må være fylt ut” knyttes kun til senere steg som sending/arkivering.

Persistens / gjenoppretting (LÅST)

Aktivt program (inkl pasientnavn/e-post) skal lagres automatisk (draft/autosave).

Ved refresh:

hvis det finnes lagret program i draft → programbygger vises direkte (ikke starttilstand)

hvis ingen lagret program → starttilstand vises

Forbud (MVP)

Ingen modaler

Ingen nye sider/route

Ingen arkiv i denne kontrakten

Ingen e-postsending i denne kontrakten

Ingen redesign av høyre øvelsesbibliotek eller toppheader

Acceptance criteria (testbart)

Tom state → venstre panel viser kun “Lag program”.

Klikk “Lag program” → programbygger vises.

Refresh etter opprettelse → programbygger vises igjen (state bevart).

Pasientnavn/e-post persisterer etter refresh.

Ingen andre UI-endringer.
