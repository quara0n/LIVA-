# Kontrakt 33 – Progresjon/Regresjon: Valgmodus i øvelsesbibliotek med forslag + søk + kriterietekst

Prosjekt: LIVA  
Node: UX/UI  
Status: Aktiv  
Type: Endring (UX-flyt)  
Avhenger av: (valgfritt) Kontrakt 30, 31, 32, 29 (hvis relevant)  
Overstyrer: Eksisterende progresjon/regresjon-kontrakt(er) for valgflyt i bibliotek (oppdater med korrekt kontrakt-ID i repo)

---

## 1. Formål

Gjøre det raskt og intuitivt å legge til progresjons- og regresjonsøvelser ved å bruke øvelsesbiblioteket i en tydelig “valgmodus”, med 3–5 forslag knyttet til primærøvelsen og alltid tilgjengelig fritt søk, samt valg av kriterietekst som forklarer når alternativet brukes.

---

## 2. Endringens omfang (SCOPE)

Gjelder i programbygger:

- Klikk på `+ Progresjon` og `– Regresjon` på en primærøvelse
- Øvelsesbibliotek-panelet (høyre) bytter til valgmodus
- Valg av alternativ øvelse via:
  - 3–5 forslag knyttet til primærøvelsen
  - fritt søk i hele biblioteket
- Etter valg: kliniker velger kriterietekst (preset + ev. egendefinert tekst)
- Når lagret: alternativ øvelse legges inn visuelt som sekundær øvelse knyttet til primærøvelsen

---

## 3. Utenfor scope (IKKE RØR)

- Ingen endring i PDF-layout/struktur (kun tekstinnhold kan speiles dersom det allerede støttes)
- Ingen endring i domene-/rehab-logikk (ingen “smart” anbefaling, ingen automatikk)
- Ingen ny pasient-app eller onboarding
- Ingen drag&drop / reordering-funksjoner i denne kontrakten
- Ingen endring i øvelsesdata utover eksisterende felt (se regler for tekstfelt)

---

## 4. Funksjonelle regler

### 4.1 Inngang til valgmodus

Når kliniker klikker `+ Progresjon` eller `– Regresjon` på primærøvelse X:

- Øvelsesbibliotek-panelet går i “valgmodus”
- Panelets tittel byttes fra `Øvelsesbibliotek` til:
  - `Progresjonsøvelser` eller `Regresjonsøvelser`
- Det skal alltid vises en tydelig kontekstlinje:
  - `Velg <progresjon/regresjon> for: <navn på primærøvelse>`
- Fokus settes til bibliotek-panelet (ingen routing / ny side)
- Programbygger skal fortsatt være synlig (ingen full-screen modal)

### 4.2 Forslag (3–5) + fritt søk (obligatorisk)

I valgmodus:

- Øverst i biblioteket vises 3–5 forslag knyttet til primærøvelsen
- Under forslagene skal vanlig søkefelt være tilgjengelig
- Søk skal søke i hele øvelsesbiblioteket (ikke begrenset til forslag)
- Forslag er hjelp, aldri en begrensning

Krav til “forslag”:

- Må være deterministisk (f.eks. mapping/tag-basert) – ingen AI-språk, ingen “anbefalt”
- Hvis ingen forslag finnes: vis ingen forslagseksjon (ingen placeholder)

### 4.3 Valg av øvelse → kriterietekst før lagring

Når kliniker klikker “Legg til” på en øvelse i valgmodus:

- Biblioteket viser en kort “konfigurasjonsrad” for valget (samme panel):
  - Valgt øvelse-navn (read-only)
  - Dropdown med preset-kriterier (read-only liste)
  - Valgfritt felt for egendefinert tekst
  - Knapper: `Lagre` og `Avbryt`
- `Avbryt` forlater konfigurasjon uten å legge til alternativ øvelse
- `Lagre` oppretter koblingen (progresjon/regresjon) på primærøvelsen

Tekstfelt (skal bruke eksisterende felt):

- Kriterietekst skal lagres/representeres via eksisterende:
  - `narBrukesPreset`
  - `narBrukesEgendefinertTekst`
- Visningsstreng i UI = sammensatt tekst (preset + ev. egendefinert)

### 4.4 Exit fra valgmodus

Valgmodus avsluttes når:

- Kliniker lagrer et valg (etter `Lagre`)
- Kliniker trykker `Avbryt` i valgmodus
- Kliniker trykker `Esc`

Ved exit:

- Bibliotek-panelet går tilbake til normal visning med tittel `Øvelsesbibliotek`
- Eventuell konfigurasjonsrad lukkes

### 4.5 Strukturintegritet (kritisk)

- Progresjons- og regresjonsøvelser valgt via bibliotekets valgmodus
  skal opprettes ved å bruke samme datastruktur, relasjon og rendering
  som eksisterende progresjon/regresjon i programbygger.

- Valg via biblioteket skal være en alternativ INNGANG
  til eksisterende progresjon/regresjonslogikk,
  ikke en ny implementasjon.

- Etter lagring skal alternativ øvelse:
  - rendres på samme plass i programbygger
  - med samme visuelle hierarki
  - og samme interaksjonsregler
    som dagens progresjon/regresjon.

- Det skal ikke eksistere to parallelle måter å representere
  progresjon/regresjon på i state eller UI.

---

## 5. Struktur / Rendering / UX

### 5.1 Rendering i programbygger

Når progresjon/regresjon er lagt til på primærøvelse X:

- Alternativ øvelse rendres rett under primærøvelsen X i programsekvensen (inline)
- Alternativ øvelse skal ha sekundær visuell stil (lavere tyngde enn primær)
- Alternativ øvelse skal vise kriterietekst (preset + ev. egendefinert) som forklaring
- Alternativ øvelse skal ikke få eget hovednummer hvis Kontrakt 32 (nummerering) er aktiv

### 5.2 “Stille” fokusmarkering (valgfritt)

I valgmodus kan programbygger de-emphasiseres subtilt (ikke full fade, ikke blokkering med overlay).
Dette er valgfritt og skal ikke introdusere modal-følelse.

---

## 6. Akseptkriterier (OBLIGATORISK)

1. Klikk på `+ Progresjon` bytter bibliotek-tittel til `Progresjonsøvelser` og viser kontekst “Velg progresjon for: <primærnavn>”.
2. Klikk på `– Regresjon` gjør tilsvarende med `Regresjonsøvelser`.
3. I valgmodus vises 3–5 forslag når tilgjengelig, og fritt søk er alltid tilgjengelig.
4. Valg av øvelse krever `Lagre` etter at kriterietekst (preset + ev. egendefinert) er satt.
5. `Avbryt` og `Esc` forlater valgmodus uten å legge til alternativ øvelse.
6. Ved `Lagre` legges alternativ øvelse inn rett under tilhørende primærøvelse og vises visuelt sekundært.
7. Kriterietekst vises på alternativ-øvelsen som sammensatt tekst av `narBrukesPreset` + ev. `narBrukesEgendefinertTekst`.
8. Ingen endring i PDF-layout/struktur, domene-/rehab-logikk eller persistens utover eksisterende feltbruk.

---

## 7. Bevisste avgrensninger

- Ingen “smart” anbefaling eller AI-basert rangering av forslag i MVP
- Ingen auto-utfylling av kriterietekst uten klinikerens valg
- Ingen støtte for flere alternativer per primær utover det som allerede finnes i data/UI
