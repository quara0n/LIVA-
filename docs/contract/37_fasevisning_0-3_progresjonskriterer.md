Prosjekt: LIVA

Node: Programbygger

Status: Aktiv

Type: Endring

Avhenger av: Kontrakt 36 (Rehab-mal generering med Fase 0–3)

---

## 1. Formål

Gi programbygger støtte for å jobbe fasevis (Fase 0–3) som egne visninger med tydelig aktiv fase, og seede fase-spesifikk standardinfo. I tillegg skal øvelser kunne ha progresjon via **instrukser** uten å måtte legge til progresjonsøvelse.

---

## 2. Endringens omfang (SCOPE)

### 2.1 Fase-navigasjon (trykkbare faser)

I programbygger-kolonnen skal det over faseinnholdet vises en fase-switcher:

- `Fase 0` `Fase 1` `Fase 2` `Fase 3`
- Aktiv fase markeres tydelig
- Det skal alltid være synlig hvilken fase som er aktiv (“Aktiv: Fase X” eller tilsvarende)

### 2.2 Single-phase view

Når en fase er valgt:

- Kun valgt fase vises i programbyggeren
- De andre fasene skjules (ikke slettes)
- Bytte fase skal ikke endre data, kun visning

### 2.3 Fase-template / standardinfo per fase

Hver fase-seksjon skal ha en “Phase Header” (fast plass øverst i fasen) med:

- `Mål` (kort tekst)
- `Prinsipp/fokus` (1–3 bullets)
- `Standard progresjonsregel` (kort tekst, f.eks. 24t-respons)
- `Klinikernotat` (valgfritt fritekstfelt, default tomt)

Ved generering fra rehab-mal (Kontrakt 35) kan disse feltene være seedet med standardinfo for Fase 0–3.

### 2.4 Progresjonsinstrukser (uten progresjonsøvelse)

Hvert øvelseskort (primærøvelse) skal støtte:

- “Progresjon i samme øvelse” (liste med korte instruksjoner)
- Instruksjonene kan ha egne progresjonskriterier (multi-select dropdown)

Dette er uavhengig av progresjonsøvelse. Det skal være mulig å ha:

- kun instruksjoner
- kun progresjonsøvelse
- begge

---

## 3. Utenfor scope (IKKE RØR)

- Ingen route-/side-navigasjon (kun visning i samme builder)
- Ingen endring i overlay for Rehab-maler (Kontrakt 35)
- Ingen endring i PDF-rendering i denne kontrakten
- Ingen ny logikk for regresjon/progresjon utover å legge til instruksjonsfeltet + kriterier
- Ingen klinikkdeling / bibliotekdeling

---

## 4. Funksjonelle regler

- Fase-switcher skal kun bytte “aktiv fase” i UI
- Aktiv fase skal persistere i programstate mens programmet er åpent (refresh-krav valgfritt)
- Phase Header-felter lagres i programdata (så de følger programmet)
- Progresjonsinstrukser lagres per øvelse, og kriterier knyttes eksplisitt til instruks-pakken
- Hvis både progresjonsinstrukser og progresjonsøvelse finnes:
  - instruksjoner vises først
  - progresjonsøvelse vises etterpå

---

## 5. Struktur / Rendering / UX

- Fase-switcher skal ligge øverst i programbygger-kolonnen, over faseinnhold
- Phase Header skal ligge øverst inne i fase-seksjonen
- “Progresjon i samme øvelse” skal være en kompakt del under øvelsens dosering (samme visuelle nivå som kriterier)

---

## 6. Akseptkriterier (OBLIGATORISK)

1. Jeg kan klikke Fase 0/1/2/3 og kun valgt fase vises i builder.
2. Det er alltid tydelig hvilken fase som er aktiv.
3. Hver fase viser Phase Header med feltene Mål, Prinsipp/fokus, Standard progresjonsregel, Klinikernotat.
4. Når program er generert fra rehab-mal, kan Phase Header være seedet for hver fase.
5. På en øvelse kan jeg legge til progresjonsinstrukser uten å legge til progresjonsøvelse.
6. Jeg kan velge progresjonskriterier for instruksjonene via dropdown multi-select.
7. Hvis progresjonsøvelse også finnes, vises instruksjoner før progresjonsøvelse.

---

## 7. Bevisste avgrensninger

- Ikke “malbibliotek” for fase-headers som egen feature nå; seeding skjer via rehab-mal payload.
- Ikke avansert regelmotor for progresjon (kun felter + visning).
- Ikke PDF-tilpasning nå.

---

