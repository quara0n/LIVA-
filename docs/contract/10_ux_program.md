# UX – Programdel (MVP)

## Formål

Redusere visuell støy i programdelen og styrke klinisk lesbarhet uten funksjonelle endringer.

## Låst UX-regel: Komprimert øvelsesrad

- Hver øvelse vises som én komprimert rad i programmet.
- Raden inneholder:
  1. Øvelsesnavn (primær informasjon)
  2. Progresjon / regresjon
     - Plassert inline med øvelsesnavn
     - Mindre font enn øvelsesnavn
     - Samme typografiske nivå som annen sekundær metadata i UI
  3. Reps × sett (operativ informasjon)
  4. Et nøytralt “+”-ikon for utvidede parametere

- utvidede parametere (f.eks. vekt, pause) er skjult som standard og åpnes kun via “+” og kommer da opp på samme rad ved siden av reps x sett (operativ informasjon)
- kommentarer vises etter "+" på samme rad

## Avgrensninger (MVP)

- Ingen nye parametere introduseres
- Ingen AI-generert tekst
- Ingen endring i domenemodell
- Ingen endring i PDF-innhold
- Ingen redesign – kun komprimering og hierarki

## Implisert UI-ansvar

- Flytte progresjon/regresjon til øvelseslinjen
- Justere typografisk hierarki
- Skjule sekundære parametere bak “+”

### Progresjon/Regresjon (MVP)

- I komprimert rad vises progresjon/regresjon som handlinger ( + Progresjon / − Regresjon ) inline ved siden av øvelsesnavn.
- Ikke vis status/tellere eller tom-tilstander i komprimert visning (f.eks. “Progresjon 0 · Regresjon 0”).
- Detaljvisning (liste, “når brukes”, valg) er skjult som standard og vises kun etter eksplisitt åpning via inline-trigger.
- Når detaljvisning er åpen for en øvelse, skal den andre retningen være lukket (kun én retning om gangen).
