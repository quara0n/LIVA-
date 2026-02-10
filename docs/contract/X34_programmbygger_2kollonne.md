# Kontrakt 34 – Programbygger: Valgfri 2-kolonne-visning (eksperimentell)

Prosjekt: LIVA  
Node: UX/UI  
Status: Eksperimentell / Post-MVP  
Type: Rendering / Layout  
Avhenger av: Kontrakt 33 – Progresjon/Regresjon: Valgmodus i bibliotek  
Overstyrer: Ingen (ny, valgfri visning)

---

## 1. Formål
Redusere vertikal scrolling og øke oversikt i programbygger ved å tilby
en valgfri 2-kolonne-visning for primærøvelser, uten å endre programstruktur,
rekkefølge eller progresjon/regresjonslogikk.

---

## 2. Endringens omfang (SCOPE)

Gjelder kun:
- visuell rendering av programbygger
- presentasjon av primærøvelser i to kolonner

Denne kontrakten:
- introduserer **ingen ny funksjonalitet**
- endrer **ikke** hvordan øvelser legges til, flyttes eller lagres

---

## 3. Grunnregler for 2-kolonne-visning (KRITISK)

### 3.1 Valgfri visning
- 2-kolonne-visning er et **valg** (toggle / modus)
- Standardvisning er fortsatt 1 kolonne
- Bytte av visning skal ikke endre data eller state

---

### 3.2 Rekkefølge (må være entydig)

- Programsekvensen er alltid:
  - kolonne 1: topp → bunn
  - deretter kolonne 2: topp → bunn
- Rekkefølgen skal være identisk med 1-kolonne-visning
- Nummerering (hvis aktiv via Kontrakt 32) er source of truth

---

### 3.3 Progresjon / Regresjon i 2 kolonner

- Progresjons- og regresjonsøvelser:
  - rendres **rett etter sin primærøvelse**
  - i **samme kolonne**
- Alternativ-øvelser skal aldri:
  - flyttes til annen kolonne
  - rendres separat
  - samles nederst

Dette gjelder uavhengig av høyde.

---

## 4. Layout-regler

- Maksimalt **2 kolonner**
- Ingen 3-kolonne-visning
- Kolonnene skal ha lik bredde
- Kort-høyde kan variere, men:
  - primær + alternativ-øvelser må alltid holde sammen
- Ingen masonry / “flytende” plassering

---

## 5. Utenfor scope (IKKE RØR)

- Ingen endring i:
  - programstruktur
  - øvelsesrekkefølge
  - progresjon/regresjonslogikk
  - dosering
  - PDF-layout eller eksport
- Ingen automatisk aktivering av 2-kolonne-visning
- Ingen optimalisering for spesifikk skjermstørrelse

---

## 6. Akseptkriterier

1. 2-kolonne-visning kan aktiveres/deaktiveres uten tap av data.
2. Rekkefølgen på øvelser er identisk i 1- og 2-kolonne-visning.
3. Progresjon/regresjon rendres alltid rett etter sin primærøvelse.
4. Ingen alternativ-øvelse vises i annen kolonne enn sin primærøvelse.
5. Ingen 3-kolonne-layout eksisterer.
6. PDF-output er uendret.

---

## 7. Bevisste avgrensninger

- Ingen “smart” fordeling av øvelser basert på høyde.
- Ingen forsøk på å optimalisere for “4 + 4 øvelser”.
- Ingen automatisk switching basert på antall øvelser.

Denne kontrakten definerer kun et kontrollert,
valgfritt eksperiment for videre evaluering.
