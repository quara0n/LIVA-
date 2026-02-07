📄 Kontrakt 20 – Pasientdetaljer ved “Nytt program” + Unsaved-guard + Synlighet (MVP) (revidert)

Fil: docs/contract/20_patient_details_and_unsaved_guard.md
Node: Programbygger / UI-flyt
Underordnet: Prosjektkontrakt v1.0
Avhengig av: 12 (startstate), 13 (ansvarsdeling), 17 (templates)

1. Formål

Når kliniker trykker “Nytt program” skal systemet alltid hente inn Pasientnavn + e-post før program startes.

Hindre tap av arbeid med en tydelig “ikke lagret”-bekreftelse før overskriving/forlat.

Gjøre det synlig i programbyggeren om e-post finnes eller mangler.

2. Omfang

Gjelder kun UI/state/event-flyt i apps/web/:

“Nytt program”

“Start fra mal”

“Hent program” / arkiv-åpning

Pasientinfo-visning i programbygger (navn + e-post status)

3. Avgrensninger (ikke lov)

Ingen endring i domene/rehab-logikk

Ingen endring i PDF

Ingen ny persistens utover eksisterende (lokal lagring/arkiv som allerede finnes)

Ingen redesign (kun minimale UI-elementer i eksisterende stil)

4. Definisjoner

Pasientdetaljer = name (min 1 tegn) + email (kan være tom)

E-post status:

hvis tom: “E-post: mangler”

hvis satt: vis e-post

Unsaved = aktivt program har endringer siden sist lagring/last/initialisering

Krav A – “Nytt program” krever pasientdetaljer først

Når bruker trykker “Nytt program”:

Hvis hasUnsavedChanges === true → vis dialog (Krav C)

Åpne Pasientdetaljer-visning

“Start” er disabled til navn har minst 1 tegn

E-post kan være tom

Når bekreftet → initier nytt tomt program

Viktig: “Nytt program” skal aldri starte program uten at pasientdetaljer er bekreftet.

Krav B – “Start fra mal” håndterer ny pasient uten ekstra mellomskjerm

Når bruker trykker “Start fra mal”:

Hvis hasUnsavedChanges === true → vis dialog (Krav C)

Åpne Pasientdetaljer-visning, men med en enkel toggle:

Toggle (låst):

Bruk samme pasient (default: PÅ dersom navn allerede finnes i state)

Ny pasient (toggle AV → bruker kan skrive nytt navn/epost)

Regler:

Hvis “Bruk samme pasient” er PÅ:

behold eksisterende navn + e-post

applyTemplate erstatter programinnhold

Hvis “Ny pasient”:

navn må settes (min 1 tegn)

e-post kan settes (kan være tom)

applyTemplate etter bekreftelse

Resultat: Mal-start gir aldri “skjult e-post”. Enten vises e-post eller “mangler”.

Krav C – Unsaved-guard (låste triggere + tekst)

Dialog skal vises når bruker forsøker å:

starte nytt program

starte fra mal

hente program / åpne fra arkiv

Tekst (låst):

Tittel: Fortsette uten å lagre?

Brødtekst: Du har endringer som ikke er lagret. Hvis du fortsetter, blir de fjernet.

Knapper:

Avbryt

Fortsett uten å lagre

Krav D – Pasientinfo synlig i programbygger

I programbygger (øverst / toolbar-området, uten redesign):

Vis: Pasient: {navn} (eller “Ingen pasient valgt” hvis tomt – bør i praksis ikke skje etter Krav A)

Vis: E-post: {epost} eller E-post: mangler

Valgfritt (MVP-godkjent): en liten “Rediger”/klikk for å åpne pasientdetaljer og legge inn e-post.

Suksesskriterier

“Nytt program” → alltid pasientdetaljer først

“Start fra mal” → pasientdetaljer med toggle “samme/ny pasient” (ingen ekstra mellomskjerm)

E-post er alltid synlig som verdi eller “mangler”

Unsaved-dialog trigges konsekvent på de låste handlingene

Ingen endring i PDF/domene/rehab
