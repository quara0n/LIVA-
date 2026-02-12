Kontrakt 34 – Progresjonskriterier: Multi-select i bibliotek + kompakt visning i programbygger

Prosjekt: LIVA
Node: UX/UI
Status: Aktiv
Type: Endring (UI-forbedring)
Avhenger av: Kontrakt 33
Overstyrer: Kontrakt 33 kun der spesifisert (konfigurasjonsrad)

1. Formål

Forenkle og forbedre progresjon/regresjon-flyt ved å:

Fjerne duplisert øvelsesnavn i valgmodus

Endre kriterievalg fra single dropdown til multi-select

Komprimere visning i programbygger

Introdusere klikkbar indikator for kriterier

Dette er en ren UX-forbedring.
Ingen endring i domene- eller rehab-logikk.

2. Endring 1 – Bibliotek valgmodus (kritisk)
   2.1 Hva fjernes

I konfigurasjonskortet i biblioteket fjernes:

Den ekstra raden som viser valgt øvelsesnavn inne i boksen

Fra:

Forslag: Knebøy
Knebøy
[Når smerte og funk ▼]
[Lagre] [Avbryt]

Til:

Forslag: Knebøy
Progresjonskriterier:
☐ Smerte < 4
☐ Funksjon bedre
☐ Ingen forverring 24t
☐ Full ROM

- Eget kriterium

[Lagre] [Avbryt]

Øvelsesnavnet vises allerede i:

Kortet

Forslag-label

Kontekstlinje øverst

Det skal ikke gjentas.

2.2 Kriterievalg – Multi-select

Endre fra:

Single dropdown (ett valg)

Til:

Checkbox-liste (multi-select)

Kliniker kan velge 1 eller flere

Ingen minimumskrav

Ingen automatisk valg

2.3 Lagring

Ved klikk på Lagre:

Alternativ øvelse opprettes som før

Alle valgte kriterier lagres

Bruk eksisterende feltstruktur

Ikke opprett ny progresjonstype

Ikke ny state-struktur

Dette er kun utvidelse fra single til array-basert visning.

3. Endring 2 – Rendering i programbygger
   3.1 Fjerne full kriterietekst i hovedkort

Alternativ øvelse skal ikke vise:

“Når øvelsen kjennes lett og kontrollert …”

Den teksten skal ikke lenger rendres direkte i kortet.

3.2 Ny kompakt indikator (chip)

Ved siden av alternativ øvelsestittel vises:

[ ✓ Progresjonskriterier ▾ ]

Eller:

[ ✓ Regresjonskriterier ▾ ]

Krav:

Chip/pill-stil

Sekundær visuell vekt

Rundede hjørner

Cursor: pointer

Hover-feedback

Vises kun dersom kriterier finnes

Ikke primær-knapp.
Ikke ren tekst.

4. Inline detaljvisning

Når chip trykkes:

Åpne inline under alternativ øvelse:

Primær: Goblet knebøy
↓
Regresjon: Knebøy

Kriterier:
• Smerte < 4
• Funksjon bedre
• Ingen 24t-forverring

Krav:

Ikke modal

Ikke sidebytte

Ikke overlay

Samme struktur for progresjon og regresjon

Klikk igjen lukker.

Kun én åpen av gangen per primærøvelse.

5. Strukturintegritet

Dette skal:

Bruke eksisterende progresjons-/regresjonsrelasjon

Ikke lage ny type node

Ikke lage parallell representasjon

Ikke endre nummerering

Ikke påvirke PDF-layout

6. Akseptkriterier

Duplisert øvelsesnavn i bibliotekets konfigurasjonsboks er fjernet.

Dropdown for kriterier er erstattet med multi-select checkbox-liste.

Flere kriterier kan velges før lagring.

Full kriterietekst vises ikke lenger direkte i programbygger-kortet.

Alternativ øvelse viser en klikkbar chip dersom kriterier finnes.

Klikk på chip åpner inline detaljvisning.

Inline visning påvirker ikke layout av andre seksjoner.

Ingen ny progresjonsmodell er introdusert.

7. Bevisst UX-retning

Denne kontrakten:

Holder programbygger visuelt ren

Hindrer lange tekstblokker

Bevarer progresjonsøvelse-struktur

Gjør kriterier eksplisitt, men sekundært

Åpner for senere redigerbarhet
