# KONTRAKT – PDF-eksport (MVP)

PDF skal kunne genereres uten manuell etterarbeid.

Overordnede krav (låst)

- PDF-eksport skal bruke snapshot-felter (f.eks. ovelseInstans.navn, dosering, utforelseTekst, emoji).
- Eksporten skal være deterministisk: samme input => samme output.
- PDF-laget skal kun stå for rendering, ikke domene-/rehab-logikk eller beslutninger.

# Øvelsesblokk (MVP – LÅST)

Hver øvelse som rendres i PDF skal rendres som en samlet blokk med ramme/visuell separasjon og inneholde følgende elementer i denne rekkefølgen:

1. [EMOJI] Øvelsesnavn
2. Dosering (sett × reps / tid)
3. Utførelse (obligatorisk)
4. Alternativer (progresjon/regresjon), hvis valgt

Utførelse (obligatorisk)

- 2–3 korte setninger
- snapshot-tes ved innsetting fra øvelsesbiblioteket
- AI skal ikke generere, endre eller supplere teksten i MVP

Utførelse – eksportregel (kritisk)

- PDF-generatoren skal anta at utførelsestekst alltid finnes.
- Øvelser uten utførelsestekst skal ikke kunne eksporteres.

Ikon / emoji (MVP – LÅST)

- Emoji er metadata og snapshot-tes ved innsetting (samme prinsipp som utførelse).
- PDF-laget skal:
  - kun rendre emoji hvis feltet finnes
  - ikke generere, velge eller anta emoji
  - ikke krasje hvis emoji mangler (tomt ikon er OK)

Progresjon / regresjon (MVP – LÅST)

1. Hierarki (“barn av hovedøvelsen”)

- Progresjon/regresjon rendres som barn under hovedøvelsen (ett undernivå).
- Flere barn skal rendres som søsken på samme nivå (ingen “stige-effekt”):
  - ekstra progresjoner/regresjoner skal ikke gi økende innrykk.
- Strukturmodell (låst):
  - Hovedøvelse
  - Barn 1
  - Barn 2
  - Barn 3

2. Lik utforming som hovedøvelse (innholdsfelter)

- Hver valgt progresjon/regresjon skal rendres med samme felter og rekkefølge som en vanlig øvelse:
  - [EMOJI] Navn
  - Dosering
  - Utførelse (eller alternativtekst dersom kontrakten for progresjon/regresjon sier “Når brukes” – bruk kontraktens felt, men rendres som beskrivelseslinje)
  - (Ingen egne under-alternativer i MVP)
- Poenget: barn ser ut som “mini-øvelse”, men er visuelt underordnet hovedøvelsen.

3. Emoji for barn

- Hvis barnet har egen emoji -> bruk den.
- Hvis barnet mangler emoji -> arv emoji fra hovedøvelsen.
- PDF-laget skal kun bruke snapshot-felter (ingen oppslag i bibliotek i eksport).

Rammer / separasjon (MVP – LÅST)

PDF skal ha tydelig separasjon mellom øvelser uten “design-tema”.

Krav:

- Hver hovedøvelse skal rendres i en tynn ramme eller med en tydelig separator (f.eks. linje + padding).
- Barn (progresjon/regresjon) skal:
  - ligge inne i samme hovedøvelsesblokk
  - rendres med samme ramme/separator-stil, men som undernivå:
    - f.eks. litt mindre padding/innrykk eller en svakere separator
  - aldri flyte “ut” som egne hovedblokker

Forbud:

- Ikke introduser nye farger/tema.
- Ikke bruk store “kortdesign”. Bare enkel ramme/linjer og spacing.

Sidebryt (MVP – LÅST)

- En hovedøvelsesblokk skal ikke splittes over sider dersom mulig.
- Hvis det ikke er plass til minimum:
  - navn + dosering + minst én linje utførelse
  - -> flytt hele hovedøvelsen til neste side.
- Barn (progresjon/regresjon) skal følge hovedøvelsen:
  - hvis hovedøvelsen flyttes, flyttes barna med.
  - hvis mulig: unngå at barn alene havner på neste side uten mor.

Eksplisitte forbud (MVP)

PDF-laget skal ikke:

- endre rekkefølge på elementer
- generere/endre tekst
- anvende rehab-/domene-logikk
- gjøre oppslag i bibliotek ved eksport (bruk snapshot)

Acceptance criteria (MVP – testbar)

- Emoji vises foran navn der felt finnes (ingen krasj hvis mangler).
- Barn (progresjon/regresjon) har samme felter som hovedøvelse (navn, dosering, beskrivelse/utførelse i riktig rekkefølge).
- Flere barn rendres som søsken på samme undernivå (ingen økende innrykk).
- Hver hovedøvelse er visuelt separert med ramme eller linje + padding.
- Barn er visuelt underordnet, men innenfor hovedøvelsens blokk (ikke egne hovedblokker).
- Sidebryt flytter hele hovedøvelsen (med barn) når minimumsplass ikke er oppfylt.
