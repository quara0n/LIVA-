Formål

Gi venstre panel en tydelig starttilstand slik at kliniker eksplisitt oppretter eller henter et program før redigering.

Scope (MVP)

Gjelder kun venstre “Program”-panel sin tomtilstand, oppstart og programtopp (kontroller når programbygger er aktiv).

Ingen redesign av resten av siden.

Ingen endringer i høyre øvelsesbibliotek eller toppheader.

Arkiv/listing/henting av flere programmer er definert i kontrakt 16 (ikke her).

Starttilstand (LÅST)

Når det ikke finnes et aktivt program (første gang / tom state):

Venstre panel viser kun:

To knapper på samme rad:

Primær: “Lag program”

Sekundær: “Hent program”

En “Pasient”-boks rett under knappene med felter:

Pasientnavn (tekst)

E-post (tekst, valgfritt)

(Valgfritt) én kort hjelpelinje under pasientboksen.

Følgende skal IKKE vises i starttilstand

øvelsesliste i programmet

instruksjonsfelt

progresjon/regresjon UI

dosering/redigering

“ingen øvelser lagt til ennå”-tekst (erstattes av starttilstanden)

Opprett / hent program (LÅST)
Når kliniker trykker “Lag program”

Starttilstanden forsvinner

Programbygger-visningen vises (som i dagens løsning)

Programmet initialiseres som et utkast (draft)

Pasientfelter (navn/e-post) fra starttilstanden overføres til programmet

Når kliniker trykker “Hent program”

Starttilstanden forsvinner

“Hent program”-flyten åpnes i venstre panel (ingen modal, ingen ny side)

Selve listing/valg/åpning av andre programmer styres av kontrakt 16

Når et program velges i hent-flyten, blir det aktivt og programbygger-visningen vises

Programtopp (LÅST)

Når programbygger-visningen er aktiv, skal det vises en topprad i toppen av programområdet.

Innhold (rekkefølge fra venstre til høyre)

Navn (pasientnavn, inline editable)

Lagre (knapp)

Nytt program (knapp)

Hent program (knapp)

Interaksjon

Navn kan editeres inline

E-post håndteres i kontrakt 16 dersom den skal vises i builder; denne kontrakten låser kun Navn-feltet i programtoppen

“Lagre”, “Nytt program”, “Hent program”:

funksjonell oppførsel defineres av kontrakt 16

denne kontrakten låser at knappene finnes og hvor de ligger

Viktig

Starttilstanden (knapper + pasientboks) skal ikke vises samtidig som programtoppen (builder aktiv).

Persistens / gjenoppretting (LÅST)

Aktivt program (inkl navn/e-post dersom disse finnes i programdata) skal lagres automatisk (draft/autosave) i MVP.

Ved refresh:

hvis det finnes lagret program i draft → programbygger vises direkte (ikke starttilstand)

hvis ingen lagret program → starttilstand vises

Merk: Arkiv, flere programmer og “Hent program”-innhold er definert i kontrakt 16. Denne kontrakten beskriver kun starttilstand + inngangskontroller + programtopp.

Forbud (MVP)

Ingen modaler

Ingen nye sider/route

Ingen redesign av høyre øvelsesbibliotek eller toppheader

Ingen “arkivvisning” eller programliste defineres her (kontrakt 16)

Acceptance criteria (testbart)

Tom state → venstre panel viser kun:

“Lag program” og “Hent program”

pasientboks (Navn + E-post)

Klikk “Lag program” →

starttilstand forsvinner

programbygger vises

programtopp vises med rekkefølge: Navn | Lagre | Nytt program | Hent program

Klikk “Hent program” i starttilstand →

starttilstand forsvinner

hent-flyt vises i venstre panel (ingen modal / ny side)

Refresh etter at program er opprettet →

programbygger vises igjen (state bevart)

Pasientnavn/e-post persisterer etter refresh (som del av draft)

Ingen andre UI-endringer.
