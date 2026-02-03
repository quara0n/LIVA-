# Progresjon/regresjon – MVP

## MVP-regler (UI og flyt)
- Alternativer er skjult som standard
- Vis kun via inline-trigger (+ Progresjon / − Regresjon)
- Kun én retning om gangen
- Top 3 vises, resten bak "Vis flere"
- Valg krever "Når brukes" (ferdige valg + egendefinert)
- Valg = lagring, panel kollapser
- Maks 3 progresjoner + 3 regresjoner per øvelse
- Alternativer er ikke egne øvelser
- Alt valgt innhold skal med i PDF, nedenfor hovedøvelsen

---

## Formål
Progresjon/regresjon skal fungere som komprimerte varianter under en hovedøvelse, slik at kliniker kan:
- velge raskt (inline)
- dokumentere *når varianten brukes*
- tilpasse varianten med samme grunnfelter som en øvelse (MVP)
- få variantene med i PDF med øvelsesbeskrivelse (utførelsestekst)

---

## Redigering / tilpasning (MVP)
Når en progresjon/regresjon er valgt inn på en øvelse-instans, skal den kunne tilpasses med:

1) **Dosering** (samme struktur som for øvelsen)  
2) **Utførelsestekst** (2–3 setninger, obligatorisk)  
3) **Notat til pasient** (valgfritt, kort)  
4) **Når brukes** (obligatorisk; ferdige valg + egendefinert)

**Prinsipp:** gjenbruk eksisterende editor/komponenter der det er mulig. Ikke redesign.

---

## Datakontrakt

### Struktur på øvelse-instans (tillegg)
Øvelse-instans skal kunne lagre varianter:

- `progresjoner: Variant[]`
- `regresjoner: Variant[]`

### Variant (MVP)
Variant er et objekt med:

- `id: string`
- `retning: "progresjon" | "regresjon"`
- `kildeOvelseId: string` (referanse til master/base-øvelse)
- `navn: string` (visningsnavn)
- `ikon: string` (emoji/ikon, valgfritt i UI, men skal kunne rendres i PDF hvis satt)
- `dosering: Dosering` (samme schema som hovedøvelse)
- `utforelseTekst: string` (obligatorisk, 2–3 setninger)
- `notat: string` (valgfritt)
- `narBrukes: string` (obligatorisk; kan være ferdigvalg eller egendefinert)

> Dosering-typen (`Dosering`) skal være identisk med den øvelse-instans bruker i programmet.

---

## Validering (MVP)
- Maks 3 progresjoner og maks 3 regresjoner per øvelse-instans.
- Ved valg/opprettelse av variant:
  - `narBrukes` må være satt før varianten kan lagres.
- For PDF-eksport:
  - hver valgt variant må ha `utforelseTekst` og `narBrukes`
  - mangler dette, skal eksport blokkeres på samme måte som for hovedøvelser uten utførelsestekst.

---

## PDF (datakrav)
All valgt variant-data skal være tilgjengelig for PDF-rendering, slik at PDF-kontrakten kan:
- liste progresjoner/regresjoner under hovedøvelsen
- vise `navn`, `ikon` (hvis finnes), `narBrukes`, `dosering`, `utforelseTekst` og evt. `notat`
