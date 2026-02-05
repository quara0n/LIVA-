Formal

Gi venstre panel en tydelig starttilstand slik at kliniker eksplisitt oppretter et program for redigering.

Scope (MVP)

Gjelder kun venstre "Program"-panel sin tomtilstand og oppstart. Ingen redesign av resten av siden.

Starttilstand (LAST)

Nar det ikke finnes et aktivt program (forste gang / tom state):

Venstre panel viser kun:

En primarknapp: "Lag program"

(Valgfritt) en kort hjelpelinje

Folgende skal IKKE vises i starttilstand:

ovelsesliste i programmet

instruksjonsfelt

progresjon/regresjon UI

dosering/redigering

"ingen ovelser lagt til enna"-tekst (den erstattes av starttilstanden)

Opprett program (LAST)

Nar kliniker trykker "Lag program":

Starttilstanden forsvinner

Programbygger-visningen vises (som i dagens losning)

Programmet initialiseres som et "utkast".

Pasientinfo (LAST)

Nar programbygger-visningen er aktiv, skal det vises en liten "pasientrad" i toppen av programomradet:

Felt:

Pasientnavn (tekst)

E-post (tekst, valgfritt)

Interaksjon:

Feltene kan editeres inline

E-post er alltid valgfri i MVP

Pasientnavn kan vare tomt under redigering (blokkerer ikke a legge til ovelser)

Krav til "ma vare fylt ut" knyttes kun til senere steg som sending/arkivering.

Persistens / gjenoppretting (LAST)

Ingen draft/autosave i denne flyten.

Ved refresh skal state nullstilles.

Ved refresh vises alltid starttilstand ("Lag program"), uansett hva som var bygget for refresh.

Forbud (MVP)

Ingen modaler

Ingen nye sider/route

Ingen arkiv i denne kontrakten

Ingen e-postsending i denne kontrakten

Ingen redesign av hoyre ovelsesbibliotek eller toppheader

Acceptance criteria (testbart)

Tom state -> venstre panel viser kun "Lag program".

Klikk "Lag program" -> programbygger vises.

Refresh etter opprettelse -> starttilstand vises igjen (state nullstilt).

Pasientnavn/e-post persisterer ikke etter refresh.

Ingen andre UI-endringer.
