# KONTRAKT – Domenemodell (source of truth)

Domene-objekter (minimum):
- Program:
  - programId, tittel, status, opprettetTid, oppdatertTid
  - seksjoner: Seksjon[]

- Seksjon:
  - seksjonId, tittel, aktiv, rekkefolge
  - ovelser: OvelseInstans[]

- OvelseMaster (bibliotek):
  - ovelseId, navn
  - standardProgresjon?: Slug[]
  - standardRegresjon?: Slug[]

- OvelseInstans (i program):
  - ovelseInstansId
  - ovelseId
  - navn (snapshot for eksport)
  - dosering: Dosering
  - alternativer?: OvelseAlternativ[]

- Dosering:
  - doseringstype: "reps_x_sett" | "varighet" | "egendefinert"
  - felter avhengig av type

- OvelseAlternativ:
  - retning: "progresjon" | "regresjon"
  - ovelseId
  - navn
  - narBrukesPreset + ev. egendefinert tekst

Endringsregel:
- Hvis `modeller.ts` endres, skal dette dokumentet oppdateres i samme PR.
