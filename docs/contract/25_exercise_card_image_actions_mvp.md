# Kontrakt 25 – Øvelseskort: bildebaserte handlinger (MVP)

**Prosjekt:** LIVA  
**Node:** UX / Øvelsesbibliotek  
**Status:** Foreslått → Klar for implementering  
**Avhengigheter:**

- Kontrakt 23 – Video manifest + preview (LÅST)
- Kontrakt 24 – Video i øvelsesbibliotek (LÅST)

---

## Formål

Redusere visuell støy og øke effektivitet i øvelsesbiblioteket ved å samle alle primære handlinger direkte på øvelsens thumbnail (referansebilde).

Øvelseskortet skal oppleves som et **verktøy**, ikke en app-komponent med mange knapper.

---

## Overordnet prinsipp

- Thumbnail (JPG) er **primær interaksjonsflate**
- Handlinger legges **oppå bildet** som tydelige, men diskrete ikoner
- Antall UI-elementer per kort minimeres

---

## Handlinger på øvelseskort

Følgende handlinger skal være tilgjengelige direkte på bildet:

### 1) ➕ Legg til i program (primær handling)

- Representert med **pluss-ikon (+)**
- Trigger eksisterende “legg til”-logikk
- Endrer ikke domene eller programstruktur

### 2) ▶ Spill av video (sekundær handling)

- Representert med **play-ikon**
- Åpner eksisterende video-overlay (Kontrakt 24)
- Ingen autoplay i kort

---

## Plassering og visuell utforming

- Ikoner plasseres **sentrert på bildet**
  - enten side-ved-side
  - eller vertikalt stablet
- Ikoner skal:
  - ligge på semi-transparent bakgrunn (overlay)
  - være tydelige uten hover-avhengighet (touch-first)
  - ikke dekke hele bildet
- Thumbnail skal fortsatt være synlig og gjenkjennelig

---

## UI-elementer som fjernes

Følgende elementer skal **ikke lenger vises** på øvelseskortet:

- ❌ Separat “Legg til”-knapp under bildet
- ❌ “Video”-badge
- ❌ Separat “Spill av”-knapp under bildet

Disse funksjonene erstattes fullt ut av bilde-overlay-handlinger.

---

## Tekstinnhold i kortet

- Øvelsesnavn vises fortsatt under bildet
- Beskrivelse kan vises hvis allerede standardisert
- Ingen ny tekst legges til som del av denne kontrakten

---

## Avgrensninger (viktig)

Denne kontrakten:

- ❌ Endrer ikke:
  - video-overlay (størrelse, oppførsel)
  - video-manifest eller filstruktur
  - domene / rehab-logikk
  - PDF / eksport
- ❌ Introduserer ikke:
  - nye handlinger
  - nye datakoblinger
  - ny persistens
- ✅ Gjenbruker eksisterende events og funksjoner

Hvis noe utover dette kreves → ny kontrakt.

---

## Akseptkriterier (MVP)

- Øvelseskort viser kun:
  - thumbnail
  - øvelsesnavn
  - bilde-overlay med ➕ og ▶
- Ingen layout-reflow ved interaksjon
- Legg til / Spill av fungerer identisk som før
- UI oppleves ryddigere enn tidligere løsning

---

## Status

- Kontrakt ferdig skrevet
- Klar for eksplisitt godkjenning
- Skal ikke implementeres før godkjenning er gitt
