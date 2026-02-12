📜 KONTRAKT A — Rehab-maler i programbygger (bibliotek + generering)

Node: UX/UI → Programbygger
Formål: Én inngang til rehab-maler som genererer ferdig programstruktur (Plan A).
Pilot: 1 diagnose (Achilles) med varianter.

A0. Definisjoner

Rehab-mal: Ferdig strukturert programmal (faser/øvelser/kriterier) som kan generere et nytt program.

Systemmal: Leveres av LIVA (CPG-basert). (Referanse: Midportion Achilles CPG 2024).

A1. Topbar

SKAL

Fjerne eksisterende handling/knapp: “Start fra mal”

Legge til ny knapp: “Rehab-maler”

“Rehab-maler” skal ha samme visuelle hierarki som øvrige topbar-handlinger (ikke mer fremtredende enn “Lagre”, “Hent”).

SKAL IKKE

Legge til flere nye topbar-knapper i denne kontrakten.

A2. Rehab-maler overlay

SKAL

Klikk på “Rehab-maler” åpner en bred overlay (modal), ikke ny side.

Overlay skal inneholde:

Søkefelt med placeholder: “Søk rehab-mal…”

Liste over rehab-maler (pilot: minst 1)

Overlay skal kunne lukkes med:

X-knapp

ESC

SKAL IKKE

Full side-navigasjon (route-bytt) for å velge mal.

Smalt sidepanel (skal være bred overlay).

A3. Valgflyt i overlay (stegvis)

SKAL

Bruker skal velge i denne rekkefølgen:

Rehab-mal (pilot: Achilles tendinopati)

Subtype: Midportion / Insertional

Status: Akutt / Kronisk

Bruk mal

Flyten skal være stegvis (ikke vise alle kombinasjoner som en flat liste).

A4. “Bruk mal” (Plan A: generering)

SKAL

“Bruk mal” genererer et ferdig program i programbygger:

Programtittel som reflekterer valg (f.eks. “Achilles – Midportion – Akutt”)

Seksjoner: Fase 0, Fase 1, Fase 2, Fase 3 (klassisk struktur)

Innhold kan være seeded (øvelser/dosering/kriterier) for pilot

Program-header viser status: “Rehab-mal aktiv”

Hvis nåværende program ikke er tomt:

Vis bekreftelse: “Dette vil erstatte eksisterende program. Fortsette?”

Avbryt = ingen endring

Fortsett = overskriv og generer

SKAL IKKE

Rediger/Åpne mal (Kontrakt B).

Lagre personlige rehab-maler (Kontrakt B).

“Mine rehab-maler”-seksjon (Kontrakt B).

Automatisk “Tilpasset rehab-mal” ved manuell endring (Kontrakt B).

A5. Pilotinnhold

SKAL

Biblioteket skal ha minst 1 rehab-mal:

Achilles tendinopati

Varianter: Midportion/Insertional × Akutt/Kronisk

A6. Akseptansekriterier

“Start fra mal” er fjernet, “Rehab-maler” er synlig i topbar.

“Rehab-maler” åpner bred overlay med søk og minst 1 mal.

Bruker kan velge Achilles → subtype → status → “Bruk mal”.

Ved eksisterende innhold får man bekreftelse før overskriving.

Etter apply finnes Fase 0–3 og “Rehab-mal aktiv” i programmet.
