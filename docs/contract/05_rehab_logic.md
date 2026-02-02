# KONTRAKT – Rehab-logikk (MVP)

Regler:
- Ingen duplikate øvelser (samme ovelseId) i ett program.
- Alternativer per øvelse:
  - maks 3 progresjon
  - maks 3 regresjon
- Program kan ikke ha status "klar" uten minst én øvelse.
- Actions er rene funksjoner og immutable.
- Validering returnerer menneskelesbare feil (ingen sideeffekter).
