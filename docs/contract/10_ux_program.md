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

- Avanserte parametere (f.eks. vekt, pause) er skjult som standard og åpnes kun via “+”.
- Utførelsestekst og kommentarer vises utenfor den komprimerte raden.

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
