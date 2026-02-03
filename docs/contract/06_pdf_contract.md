# KONTRAKT – PDF eksport

PDF skal kunne genereres uten manuell etterarbeid.

Krav:

- Bruk snapshot-felter (f.eks. ovelseInstans.navn) for stabil eksport.
- Eksporten skal være deterministisk: samme input => samme outputstruktur.
- PDF-laget skal ikke inneholde domene-regler (kun rendering).

# Øvelsesblokk (MVP – LÅST)

Hver øvelse som rendres i PDF **skal alltid inneholde** følgende elementer, i denne rekkefølgen:

1. Øvelsesnavn
2. **Utførelse (obligatorisk)**
   - 2–3 korte setninger
   - Teksten kommer fra øvelsesbiblioteket (snapshot ved innsetting)
   - AI skal ikke generere eller endre teksten i MVP
3. Dosering (sett × reps / tid)
4. Alternativer (progresjon/regresjon), hvis valgt

**Regel:**

- PDF-generatoren skal anta at utførelsestekst alltid finnes.
- Øvelser uten utførelsestekst skal ikke kunne eksporteres.

En øvelse kan ha et visuelt ikon (emoji i MVP) som rendres foran øvelsesnavn.

- Ikonet er metadata og snapshot-tes ved innsetting (samme prinsipp som utførelse).
- PDF-laget skal kun rendre ikon hvis feltet finnes.
- PDF-laget skal ikke velge, generere eller anta ikon.
