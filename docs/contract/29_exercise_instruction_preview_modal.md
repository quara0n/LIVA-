# Kontrakt 29 – Øvelsespreview: Klikk på øvelse åpner instruksjonsvindu (modal)

Prosjekt: LIVA  
Node: UX/UI  
Status: Aktiv  
Type: Ny UX-funksjon (read-only)

---

## 1. Formål

Gi kliniker mulighet til å se kort, konkret instruksjon for en øvelse direkte i programbygger (uten å forlate flyten), via et enkelt popup-vindu.

---

## 2. Omfang (SCOPE)

Gjelder øvelser i:

- programbygger (primærøvelse)
- progresjonsøvelse
- regresjonsøvelse
- øvelsesbibliotek (valgfritt – hvis samme komponent gjenbrukes, men ikke krav)

---

## 3. Interaksjon

### Åpne preview

- Klikk på øvelsens **kort** (eller en definert “info”-handling på kortet) åpner en modal/popup.
- Klikk på interaktive controls (reps/sett/+ / X / plus i bibliotek) skal **ikke** åpne preview.

### Lukke preview

- `X` i modal
- klikk utenfor modal
- `Esc`

---

## 4. Innhold i preview (read-only)

Modal skal vise:

1. Øvelsesnavn
2. Bilde (samme thumbnail/preview som i kortet)
3. Instruksjonstekst (kort tekst)
4. (Valgfritt) Tag / type (“Regresjon”, “Progresjon”) hvis preview åpnes fra slike kort

---

## 5. Avgrensninger (IKKE RØR)

- Ingen redigering av instruksjoner i denne modalen (read-only).
- Ingen endring i PDF-innhold eller PDF-layout.
- Ingen endring i domene-/rehab-logikk.
- Ingen ny lagring/persistens kreves utover eksisterende øvelsesdata.

---

## 6. UX-prinsipper

- Modal skal være rolig, ikke “appete”.
- Fokus på rask avklaring for kliniker, ikke opplæring for pasient.
- Tekst skal være kort og skumbar.

---

## 7. Akseptkriterier

1. Klikk på øvelseskort åpner modal med navn + bilde + instruksjonstekst.
2. Klikk på doseringsfelter, +, eller slett-X åpner ikke modal.
3. Modal kan lukkes via X, outside click og Esc.
4. Preview fungerer identisk for primær/progresjon/regresjon-kort.
5. Ingen påvirkning av PDF eller lagrede data.

## Codex – Instruks (Kontrakt 29)

Implementer Kontrakt 29 som spesifisert.

Krav:

- Read-only modal (ingen edit)
- Åpne ved click på kort (men ikke på interaktive controls)
- Lukk med X, outside click, Esc
- Bruk eksisterende øvelsesdata (navn, thumbnail/bilde, instruksjonstekst)

Avgrensning:

- Ikke endre PDF
- Ikke endre domene-/rehab-logikk
- Ikke bygg ny "details" state som forstyrrer andre flows; hold modal-state lokal (f.eks. `ui.modalExerciseId`)

Leveranse:

- Én branch
- Én commit: `feat(contract-29): exercise instruction preview modal`
- Kort testnotat: bekreft klikk på dosering/X ikke trigget modal
