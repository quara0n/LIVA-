📄 Kontrakt 18 – Send program (E-post / Print)

Status: Aktiv
Node: UX/UI
Gjelder: MVP
Avhenger av: Eksisterende PDF-eksport
Berører ikke: Domene, rehab-logikk, PDF-struktur, persistens

1. Formål

Fullføre MVP-leveransen ved å gjøre det mulig for kliniker å:

sende ferdig program som PDF på e-post

skrive ut ferdig program som PDF

Dette er et avsluttende steg i arbeidsflyten.

2. Plassering (låst UX-beslutning)
   📍 Plassering

Nederst i programbyggeren

Egen seksjon tydelig adskilt fra redigering

Mental modell

Bygge program → ferdig → sende / skrive ut

3. UI-struktur
   Seksjonstittel

Send program

Knapper

Send på e-post

Skriv ut

Ingen ikoner kreves i MVP.

4. Funksjonell oppførsel
   4.1 Send på e-post

Klikk på Send på e-post åpner modal / panel.

Innhold i modal

Tittel:
Send program på e-post

Felter:

Til

type: e-post

forhåndsutfylles hvis e-post allerede er registrert

Emne

default:

Ditt treningsprogram

Melding

default:

Hei,

Her er treningsprogrammet vi har laget sammen.

Ta kontakt hvis du har spørsmål.

Vennlig hilsen

Knapper:

Send

Avbryt

Etter sending

Vis diskret bekreftelse:

Program sendt på e-post

Ingen navigering bort fra siden

4.2 Skriv ut

Klikk på Skriv ut:

åpner nettleserens print-dialog

bruker eksisterende PDF

ingen modal

ingen ekstra bekreftelse

5. Tilstandshåndtering (må implementeres)
   Tomt program

Hvis ingen øvelser finnes:

disable begge knapper

tooltip / tekst:

Legg til minst én øvelse før du sender eller skriver ut

Feil

Enkel feilmelding ved mislykket sending

Ingen retry-logikk i MVP

6. Bevisste avgrensninger (MVP)

Denne kontrakten inkluderer ikke:

e-posthistorikk

automatisk sending

pasientkonto

oppfølging

preview-modus

lagring av meldinger

7. Definition of Done

Funksjonen er ferdig når:

Send / Print er synlig nederst

PDF kan sendes på e-post

PDF kan skrives ut

Flyten er forutsigbar

Ingen forklaring er nødvendig
