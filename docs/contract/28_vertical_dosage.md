# Kontrakt 28 – Programbygger: Vertikal dosering ved øvelsesbilde + én slett (X) + drag affordance + skjul prog/reg-beskrivelse

Prosjekt: LIVA  
Node: UX/UI  
Status: Aktiv  
Type: Endring  
Avhenger av: Kontrakt 23–27 (eksisterende øvelseskort/video/thumbnail-mønster)

---

## 1. Formål

Standardisere øvelseskort i programbygger slik at:

- dosering ligger tett ved øvelsesbilde i vertikal stack
- kun én slettemekanisme (rød X) brukes
- rekkefølge håndteres kun med drag-and-drop (med tydelig cursor-affordance)
- progresjon/regresjon-beskrivelse ikke vises i programbygger (kun i PDF)

---

## 2. Endringens omfang (SCOPE)

Gjelder alle øvelseskort som vises i programbyggeren, for:

- primærøvelse
- progresjonsøvelse
- regresjonsøvelse

Endringer:

1. Dosering UI ved øvelsesbilde/ramme

- Plasser doseringskontroller tett inntil øvelsesbilde/ramme
- Vis dosering i vertikal stack (rad nedover)

2. Dosering rekkefølge og labels

- Øverst: reps-input med label "reps" rett over input
- Deretter: statisk tekst "×" (ikke klikkbar)
- Deretter: sett-input med label "sett" rett over input
- Under reps/sett: en "+" som åpner ekstra dosering
- Når "+" er åpnet: vis vekt-input med label "vekt" over, og tid-input med label "tid" over
- Når "+" er lukket: vekt/tid er skjult

3. Handlinger (slett / flytt)

- Fjern "Fjern"-knapp
- Fjern pil opp/ned (flytting via knapper)
- Behold kun én rød "X" i øvre høyre hjørne av hvert øvelseskort som sletter øvelsen

4. Drag-and-drop affordance

- Øvelseskort skal indikere draggable ved cursor:
  - normal: `cursor: grab`
  - aktiv dragging: `cursor: grabbing`
- Gjelder samme for primær/progresjon/regresjon-kort

5. Progresjon/regresjon-beskrivelse i programbygger

- Fjern visning av progresjon/regresjon-beskrivelse/tekst i programbygger
- Beskrivelse skal fortsatt eksistere for PDF (ingen endring i PDF her)

---

## 3. Utenfor scope (IKKE RØR)

- Ikke endre PDF-rendering eller PDF-layout (bortsett fra at teksten allerede skal finnes der)
- Ikke endre domene-/rehab-logikk (hvordan øvelser/progresjon/regresjon fungerer)
- Ikke endre video-manifest, video-preview eller thumbnail-logikk
- Ikke endre persistens/arkivformat
- Ikke endre globale toolbar-knapper (Lagre/Nytt program/Start fra mal/Hent program)

---

## 4. Funksjonelle regler

- Dosering skal alltid være synlig for reps og sett på øvelseskort
- "×" er kun visuell separator, aldri interaktiv
- "+" toggler kun visning av vekt/tid (ingen sideeffekter)
- Sletting skjer kun via rød X på kortet
- Rekkefølgeendring skjer kun via drag-and-drop (ingen flytteknapper)
- UI-reglene over skal være identiske for primær/progresjon/regresjon-kort

---

## 5. Struktur / Rendering / UX (hvis relevant)

- Doseringens vertikale stack skal være forankret ved øvelsesbilde/ramme, ikke flytende i kortets hovedflate
- Labels ("reps", "sett", "vekt", "tid") ligger tett over tilhørende input
- Progresjon/regresjon-beskrivelse skal ikke oppta plass i programbygger-kortet

---

## 6. Akseptkriterier (OBLIGATORISK)

1. Alle øvelseskort (primær/progresjon/regresjon) viser dosering som vertikal stack ved øvelsesbildet:
   - reps(label over) → "×" → sett(label over) → "+" under
2. "+" toggler visning av vekt(label over) og tid(label over) uten å påvirke reps/sett
3. "Fjern"-knapp finnes ikke i UI
4. Pil opp/ned for flytting finnes ikke i UI
5. Hvert kort har én rød X i øvre høyre hjørne som sletter kortet
6. Kort er draggable og viser `cursor: grab` / `cursor: grabbing` ved dragging
7. Progresjon/regresjon-beskrivelse vises ikke i programbygger (men ingen endring gjort i PDF)

---

## 7. Bevisste avgrensninger

- Ingen ny visuell “drag-handle” (kun cursor-affordance)
- Ingen endring i rekkefølge-regler utover eksisterende drag-and-drop
- Ingen ny funksjonalitet for dosering utover reps/sett + togglet vekt/tid
