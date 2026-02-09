# Kontrakt 26 – Øvelse i programbygger: visuell representasjon (MVP)

**Prosjekt:** LIVA  
**Node:** Programbygger / UI  
**Status:** Foreslått → Klar for implementering  
**Avhengigheter:**

- Kontrakt 23 – Video manifest + preview (LÅST)
- Kontrakt 24 – Video i øvelsesbibliotek (LÅST)
- Kontrakt 25 – Øvelseskort: bildebaserte handlinger (MVP)

---

## Formål

Sikre at en øvelse som legges til fra øvelsesbiblioteket til programbyggeren
beholder samme visuelle representasjon (thumbnail + video-tilgang),
slik at systemet oppleves konsistent og forutsigbart.

Øvelsen flyttes konseptuelt **direkte** fra øvelsesbiblioteket til programbyggeren,
uten å endre identitet, innhold eller logikk.

---

## Overordnet prinsipp

> En øvelse er den samme uansett hvor den vises i systemet.

Det betyr:

- samme øvelse
- samme video
- samme thumbnail
- samme video-overlay

Kun tilgjengelige handlinger endres basert på kontekst.

---

## Visuell representasjon i programbygger

Når en øvelse er lagt til i programbyggeren:

### Thumbnail

- Hvis øvelsen har JPG-thumbnail:
  - vis thumbnail i øvelsesraden/kortet i programbyggeren
- Hvis øvelsen ikke har thumbnail:
  - bruk eksisterende fallback (ikon/emoji)

### Video

- Hvis øvelsen har video:
  - vis ▶ spill av-ikon på thumbnail
  - klikk åpner eksisterende video-overlay (Kontrakt 24)
- Ingen autoplay

---

## Handlinger i programbygger (viktig)

### ➕ Legg til

- ➕-ikonet **skal ikke vises** i programbyggeren
- Begrunnelse:
  - øvelsen er allerede lagt til
  - handlingen har ingen funksjon i denne konteksten

### ▶ Spill av

- ▶-ikonet beholdes
- Funksjon identisk med øvelsesbiblioteket:
  - åpner video-overlay
  - samme oppførsel, samme lukking

---

## Hva denne kontrakten **ikke** gjør

Denne kontrakten:

- ❌ Endrer ikke:
  - domene / rehab-logikk
  - hvordan øvelsen lagres i programmet
  - sett/reps/progresjon
  - PDF / utskrift
- ❌ Introduserer ikke:
  - nye handlinger
  - nye datafelter
  - ny persistens
- ❌ Endrer ikke video-overlay (størrelse, oppførsel)

Dette er en ren UI-presentasjonskontrakt.

---

## Akseptkriterier (MVP)

- Øvelse i programbygger:
  - viser thumbnail hvis tilgjengelig
  - viser ▶ spill av-ikon hvis video finnes
- ➕-ikon er fjernet i programbygger-kontekst
- ▶ åpner video-overlay uten layout-reflow
- Oppførsel er konsistent med øvelsesbiblioteket

---

## Status

- Kontrakt ferdig skrevet
- Klar for eksplisitt godkjenning
- Skal ikke implementeres før godkjenning er gitt
