# Kontrakt 17 – Programmaler (MVP)

**ID:** 17_program_templates_mvp.md
**Status:** MVP – Låst etter implementasjon
**Node:** UX & UI / Programbygger / PDF
**Avhengigheter:** 12, 13, 14, 15, 16 (ingen overlapp i ansvar)

---

## 1. Formål

Denne kontrakten definerer **programmaler (templates)** som et MVP-verktøy for rask oppstart av programbygging.

En programmal er et **prefylt programutkast** som kliniker eksplisitt velger, og som deretter kan redigeres fullt ut før PDF-eksport.

**Ikke formål:**

- Ingen automatisk valg av mal
- Ingen diagnose, anbefaling eller vurdering
- Ingen pasienttilpasning

Kliniker er alltid beslutningstaker.

---

## 2. Omfang (scope)

### Inkludert

- Mulighet til å starte et nytt program basert på en forhåndsdefinert mal
- Et begrenset sett ferdige maler (2 stk i MVP)
- Full redigerbarhet etter at mal er brukt

### Ekskludert (eksplisitt ikke del av denne kontrakten)

- Persistens, autosave eller arkiv (håndteres i kontrakt 16)
- Nye øvelser i biblioteket
- AI-generert innhold
- Pasientlogikk, progresjonsstyring over tid, eller fase-automatisering

---

## 3. Definisjon: Programmal (MVP)

En **programmal** er:

- Et ferdig strukturert programutkast
- Består av øvelser som allerede finnes i øvelsesbiblioteket
- Inneholder default:
  - rekkefølge
  - dosering
  - utførelsestekst
  - evt. progresjon/regresjon som barn av hovedøvelse

Malen er ikke synlig i PDF som konsept – kun resultatet vises.

---

## 4. UX-beslutning

### 4.1 Tilgang

- Funksjonen heter **"Start fra mal"**
- Plasseres i samme header/toolbar-område som:
  - "Nytt program"
  - "Hent program"

### 4.2 Bruksregel

- Ved valg av "Start fra mal":
  - Dersom ingen program er aktivt → malen brukes direkte
  - Dersom et program er aktivt → bruker må eksplisitt bekrefte at nåværende program erstattes

Ingen autosave, ingen gjenoppretting.

---

## 5. Datamodell (låst)

### 5.1 Filstruktur

- `data/templates/`
  - `tennisalbue.json`
  - `achilles_tendinopati.json`

(Alternativt samlet i én fil dersom eksisterende arkitektur tilsier det. Ingen dynamisk lasting.)

### 5.2 Template-format (MVP)

Hver mal skal minimum inneholde:

- `id`
- `name`
- `description` (kort, kun for UI)
- `exercises[]`

Hver øvelse:

- `exerciseId` (må finnes i biblioteket)
- `dosage`
- `executionText`
- `progressions[]` (valgfritt, som barn)
- `regressions[]` (valgfritt, som barn)

Ingen fase-logikk eller ukeinndeling i MVP.

---

## 6. State- og handlingslogikk

### 6.1 Ny action

- `applyTemplate(templateId)`

### 6.2 Regel

- Når en mal brukes:
  - Nåværende program-state erstattes fullstendig
  - Program går inn i normal redigerbar tilstand
  - Alle eksisterende UI-regler gjelder (samme som manuelt opprettet program)

Ingen forskjell i videre håndtering.

---

## 7. PDF-konsekvens

- PDF-eksport følger eksisterende PDF-kontrakt (06)
- Ingen indikasjon i PDF på at programmet stammer fra en mal
- Innhold behandles identisk med manuelt opprettet program

---

## 8. MVP-maler (låst innhold)

I denne kontrakten skal **kun følgende maler implementeres**:

1. Tennisalbue (lateral epicondylalgia)
2. Achilles tendinopati

Begge:

- Skal bruke eksisterende øvelser
- Skal være konservative og generiske
- Skal fungere som startpunkt, ikke ferdig behandling

---

## 9. Avgrensninger mot andre kontrakter

- Overlapper ikke med kontrakt 12 (starttilstand)
- Overlapper ikke med kontrakt 16 (persistens/arkiv)
- Krever ikke endringer i HTML-struktur (14)
- Krever ikke CSS-endringer utover evt. minimal knappestil lik eksisterende
- Følger JS-ansvarssplitt fra kontrakt 13

---

## 10. Verifisering (manuell)

Implementasjon er korrekt når:

1. "Start fra mal" er synlig i header
2. Valg av mal fyller programbygger med korrekt innhold
3. Alle øvelser er redigerbare som normalt
4. Progresjon/regresjon vises korrekt som barn
5. PDF-eksport fungerer uten avvik

---

## 11. Låsepunkt

Når denne kontrakten er implementert og verifisert:

- Ingen nye maler legges til uten ny kontrakt
- Ingen utvidelse av datamodell uten ny kontrakt
- Ingen automatisering eller intelligens legges på maler i MVP

---

**Slutt på kontrakt 17**
