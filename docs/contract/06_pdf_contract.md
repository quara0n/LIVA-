# KONTRAKT – PDF eksport

PDF skal kunne genereres uten manuell etterarbeid.

Krav:
- Bruk snapshot-felter (f.eks. ovelseInstans.navn) for stabil eksport.
- Eksporten skal være deterministisk: samme input => samme outputstruktur.
- PDF-laget skal ikke inneholde domene-regler (kun rendering).
