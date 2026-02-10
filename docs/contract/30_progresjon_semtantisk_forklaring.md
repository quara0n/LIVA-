ontrakt 30 – Regresjon/Progresjon: Semantisk forklaring i kort

Prosjekt: LIVA
Node: UX/UI
Status: Aktiv
Type: UX-endring (semantikk)

1. Formål

Gjøre regresjons- og progresjonsøvelser semantisk tydelige for kliniker og pasient, uten å øke visuell tyngde eller kompleksitet.

2. Omfang (SCOPE)

Gjelder:

regresjonsøvelser

progresjonsøvelser
tilknyttet en primærøvelse i programbygger.

3. Endring

Når regresjon/progresjon legges til via eksisterende knapp:

Kortet skal vise en forklarende setning under øvelsesnavn.

Teksten er klinikerdefinert ved opprettelse (fri tekst, kort).

Eksempel:

“Alternativ øvelse – hvis øvelsen er for krevende”

4. Visuell/semantisk regel

Forklaringstekst:

Plassering:

Inline ved siden av øvelsesnavnet

På samme horisontale linje eller samme “header-row”

Ikke som egen blokk

bruker annen font / stil enn primærøvelsens navn

skal ha lavere visuell tyngde enn primærøvelse

Ingen nye ikoner, badges eller farger introduseres.

5. Avgrensninger (IKKE RØR)

Ingen endring i hvordan regresjon/progresjon legges til (knapper beholdes).

Ingen endring i domene-/rehab-logikk.

Ingen ny persistens utover lagring av tekst på øvelsen.

Ingen endring i PDF-struktur (kun tekstinnhold).

6. Akseptkriterier

Regresjons-/progresjonskort viser forklaringstekst under øvelsesnavn.

Teksten er visuelt sekundær til primærøvelse.

Kliniker kan selv bestemme tekst ved opprettelse.

Ingen ekstra handlinger eller UI-elementer er lagt til.

7. Bevisste avgrensninger

Ingen standardiserte tekster.

Ingen validering av innhold.

Ingen logikk for når øvelsen skal brukes.
