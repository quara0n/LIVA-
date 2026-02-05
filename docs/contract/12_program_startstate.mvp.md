Formål

Gi venstre panel en tydelig og ryddig starttilstand slik at kliniker alltid eksplisitt velger å lage eller hente et program før redigering.

Scope (MVP)

Gjelder kun venstre “Program”-panel:

starttilstand (tomtilstand)

overgang til programbygger

programtopp når builder er aktiv

Ikke i scope

Ingen redesign av resten av siden

Ingen endringer i høyre øvelsesbibliotek

Ingen endringer i toppheader

Arkiv/listing/innhold i “Hent program”-flyt er definert i kontrakt 16 (ikke her)

Definisjoner (LÅST)

Starttilstand: Venstre panel viser kun “Lag program” + “Hent program” + pasientboks.

Programbygger (builder): Redigering av øvelser/dosering/progresjon osv.

Ny sesjon: Appen åpnes etter innlogging / nytt besøk (f.eks. etter logout/login, ny fane, ny nettleserøkt).

Refresh: Reload av siden (F5 / browser refresh).

Starttilstand (LÅST)

Starttilstand skal vises når:

det ikke finnes et aktivt program eller

appen lastes (ny sesjon eller refresh) — se Persistens-regler

I starttilstand skal venstre panel vise kun:

To knapper på samme rad

Primær: “Lag program”

Sekundær: “Hent program”

“Pasient”-boks rett under knappene med felter

Pasientnavn (tekst)

E-post (tekst, valgfritt)

(Valgfritt) én kort hjelpelinje under pasientboksen

Dette skal IKKE vises i starttilstand (LÅST)

øvelsesliste i programmet

instruksjonsfelt

progresjon/regresjon UI

dosering/redigering

“ingen øvelser lagt til ennå”-tekst (erstattes av starttilstanden)

programtopp (builder topbar)

Opprett / hent program (LÅST)
Når kliniker trykker “Lag program”

Starttilstanden forsvinner

Programbygger-visningen vises (som i dagens løsning)

Programmet initialiseres som et utkast (draft)

Pasientfelter (navn/e-post) fra starttilstanden overføres til programmet

Når kliniker trykker “Hent program”

Starttilstanden forsvinner

“Hent program”-flyten åpnes i venstre panel (ingen modal, ingen ny side)

Selve listing/valg/åpning av programmer styres av kontrakt 16

Når et program velges i hent-flyten, blir det aktivt og programbygger-visningen vises

Programtopp (LÅST)

Når programbygger-visningen er aktiv, skal det vises en topprad i toppen av programområdet.

Innhold (rekkefølge fra venstre til høyre):

Navn (pasientnavn, inline editable)

Lagre (knapp)

Nytt program (knapp)

Hent program (knapp)

Interaksjon (LÅST)

Navn kan editeres inline

E-post håndteres i kontrakt 16 dersom den skal vises i builder; denne kontrakten låser kun Navn-feltet i programtoppen

“Lagre”, “Nytt program”, “Hent program”: funksjonell oppførsel defineres av kontrakt 16
(denne kontrakten låser at knappene finnes og hvor de ligger)

Viktig (LÅST)
Starttilstanden (knapper + pasientboks) skal ikke vises samtidig som programtoppen (builder aktiv).

Persistens / gjenoppretting (LÅST)

MVP-oppførsel skal være “ryddig start”:

Ny sesjon (LÅST)

Ved ny sesjon skal venstre panel alltid starte i starttilstand.
Appen skal ikke automatisk gå rett inn i builder basert på tidligere draft.

Refresh (LÅST)

Ved refresh skal venstre panel alltid starte i starttilstand.
Draft skal ignoreres ved refresh.

Draft (LÅST)

Program kan fortsatt opprette/oppdatere “draft” som datastruktur under arbeid (f.eks. for senere arkivering), men:

draft skal ikke brukes til automatisk gjenoppretting ved refresh eller ny sesjon i MVP.

Merk: Arkiv, flere programmer og “Hent program”-innhold er definert i kontrakt 16. Denne kontrakten beskriver kun starttilstand + inngangskontroller + programtopp.

Forbud (MVP)

Ingen modaler

Ingen nye sider/routes

Ingen redesign av høyre øvelsesbibliotek eller toppheader

Ingen “arkivvisning” eller programliste defineres her (kontrakt 16)

Acceptance criteria (testbart)

Ved app-load (ny sesjon) → venstre panel viser kun:

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

starttilstand vises (ikke builder)

Ny sesjon (logout/login, ny nettleserøkt) etter at program er opprettet →

starttilstand vises (ikke builder)

Ingen andre UI-endringer.

Viktig konsekvens (for Codex)

Denne kontrakten overstyrer enhver tidligere regel om “draft → builder ved refresh”.
Hvis kontrakt 16 har refresh-regel som sier noe annet, må 16 oppdateres for konsistens.
