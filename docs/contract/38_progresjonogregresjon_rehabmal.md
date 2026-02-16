📜 Kontrakt 38 – Rydd rehab-mal til Fase 1–3 + prog/reg-øvelser (ingen instruks-system)

Prosjekt: LIVA
Node: Programbygger (UX/UI)
Status: Aktiv
Type: Endring
Avhenger av: Kontrakt 37 + Kontrakt 36 (rehab-mal generering)

1. Formål

Forenkle rehab-mal programbygger slik at rehab-mal genererer Fase 1–3 direkte, fjerner fase-infoblokker og fjerner “progresjon i samme øvelse”-instruksjoner, og bruker kun progresjonsøvelse og regresjonsøvelse per primærøvelse. Tilpasning ligger i øvelsens eksisterende tekst (bulletpoints), ikke som egen UI.

2. Endringens omfang (SCOPE)
2.1 Rehab-mal generering: Fase 1–3 (ingen Fase 0)

Ved “Bruk mal” skal programmet genereres med:

Seksjoner: Fase 1, Fase 2, Fase 3

Ingen Fase 0 skal opprettes i payload eller programstate

2.2 Fase-switcher i programbygger

Vis kun: Fase 1 Fase 2 Fase 3

Aktiv fase markeres visuelt (ingen “Aktiv: …”-tekst)

Single-phase view beholdes (kun valgt fase vises)

2.3 Fjern Phase Header per fase (UI)

Fjern rendering/redigering i UI av:

Mål

Prinsipp/fokus

Standard progresjonsregel

Klinikernotat

(Om data allerede finnes i state fra tidligere, skal det ikke vises.)

2.4 Fjern “Progresjon i samme øvelse” (instruks-system)

I rehab-mal-kontekst skal følgende fjernes fra øvelsekort:

“Progresjon i samme øvelse”

Instruks-liste og “Legg til”-knapper

Kriterie multi-select dropdown for instruksene

2.5 Øvelsekort: progresjons-/regresjonsøvelse

Under primærøvelse skal det kun være to relevante handlinger:

+ Legg til progresjonsøvelse

+ Legg til regresjonsøvelse

Valgte øvelser vises under primærøvelsen med labels:

Neste nivå: (progresjonsøvelse)

Hvis for tungt: (regresjonsøvelse)

2.6 PDF: Rehab-modus rendering

Når Rehab-mal aktiv = true:

Render program med Fase 1–3 som seksjoner

Øvelsetekst renderes som i dag (inkl. bulletpoints for tilpasning)

Render “Neste nivå” / “Hvis for tungt” dersom prog/reg øvelse finnes

3. Utenfor scope (IKKE RØR)

Rehab-mal overlay/valgflyt (Kontrakt A)

Øvelsesbibliotek-struktur / metadatafelt

Ny regelmotor for toleranse/kriterier

Automatisk forslag av prog/reg

Redesign av layout

4. Funksjonelle regler

Rehab-mal generering skal aldri opprette Fase 0

Fase-switcher skal aldri vise Fase 0

Progresjonsinstruks-system skal ikke være tilgjengelig i rehab-mal

Prog/reg-øvelser skal være uavhengige (man kan ha ingen, én, eller begge)

5. Akseptkriterier

“Bruk mal” genererer kun Fase 1–3, ingen Fase 0 finnes.

Programbygger viser faseknapper kun for Fase 1–3.

Phase Header vises ikke i noen fase.

“Progresjon i samme øvelse” (instruks/kriterier) vises ikke i rehab-mal.

Jeg kan legge til progresjonsøvelse og regresjonsøvelse på en primærøvelse.

PDF i rehab-modus viser “Neste nivå” og “Hvis for tungt” når de finnes.

6. Bevisste avgrensninger

Ingen pasientregelmotor (24t/morgenstivhet) i denne kontrakten.

Ingen standardtekst for tilpasning utover det som allerede ligger i øvelseteksten.