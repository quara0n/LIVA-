📜 Kontrakt 39 – Fjern “Progresjon i samme øvelse” fra default program

Prosjekt: LIVA
Node: Programbygger (UX/UI)
Status: Aktiv
Type: Endring
Avhenger av: Eksisterende øvelsekort + Kontrakt 38

1. Formål

Fjerne “Progresjon i samme øvelse”-seksjonen (instruks/kriterie-blokk) fra default program, slik at default program kun bruker progresjons- og regresjonsøvelser som egne øvelser.

2. Endringens omfang (SCOPE)
2.1 Default program (ikke rehab-mal)

Når programmet ikke er generert fra rehab-mal:

Ikke render seksjonen:

“Progresjon i samme øvelse”

“Ingen progresjonsinstrukser lagt til”

“Velg kriterier”

“Legg til” (for instruks-systemet)

2.2 Behold prog/reg-øvelser

I default program skal følgende fortsatt være synlig under øvelsen:

+ Legg til progresjonsøvelse

+ Legg til regresjonsøvelse

Eksisterende logikk for disse skal ikke endres.

3. Utenfor scope (IKKE RØR)

Ingen endring i rehab-mal

Ingen endring i PDF-rendering

Ingen endring i fasevisning

Ingen endring i prog/reg-funksjonalitet

Ingen redesign

4. Funksjonelle regler

“Progresjon i samme øvelse”-blokken skal aldri vises i default program.

Den kan fortsatt eksistere i kodebase dersom brukt i annen kontekst, men skal ikke rendres i default program.

5. Akseptkriterier

I default program vises ikke “Progresjon i samme øvelse”.

I default program vises fortsatt + Legg til progresjonsøvelse og + Legg til regresjonsøvelse.

Rehab-mal påvirkes ikke av denne kontrakten.