Kontrakt 19 – PDF Font (MVP)

Fil: docs/contract/19_pdf_font.md
Node: PDF
Status: Aktiv
Underordnet: Liva – Prosjektkontrakt v1.0
Gjelder: Kun font-implementering i PDF-output

1. Formål

Sikre én konsekvent, eksplisitt definert font i all PDF-generering i LIVA.

Dette er et teknisk stabilitetstiltak, ikke et visuelt redesign.

2. Omfang (hva kontrakten dekker)

Kontrakten dekker kun:

Registrering av font i PDF-motoren

Bruk av font som default font for all tekst

Sikring av deterministisk font-lasting

3. Avgrensninger (strengt)

Denne kontrakten tillater ikke:

Endring av fontstørrelser

Endring av spacing, margins eller layout

Endring av typografisk hierarki

Innføring av flere fonter eller font-varianter

CSS-endringer

Refaktorering av PDF-kode utover det som er strengt nødvendig

Alt ovenfor krever egen kontrakt.

4. Valgt font (låst)

Font: Noto Sans

Variant: Regular

Fil: notosans-regular.ttf

Status: Filen finnes allerede i repo og er source of truth

Ingen fallback-fonter skal introduseres.

5. Teknisk krav

Fonten skal:

registreres eksplisitt i PDF-laget

settes som standard font for all tekst

Fontdefinisjon skal være:

samlet

entydig

ikke duplisert på tvers av filer

PDF-motorens implicit default-font skal ikke brukes

6. Suksesskriterier

PDF rendres funksjonelt og visuelt identisk som før

Endringen påvirker kun font

Ingen regresjoner, warnings eller nye sideeffekter

7. Ikke-mål

Denne kontrakten har eksplisitt ikke som mål:

Å gjøre PDF “penere”

Å forbedre lesbarhet gjennom designgrep

Å optimalisere typografi

Dette er bevisst utenfor MVP.

8. Avvikshåndtering

Hvis eksisterende PDF-kode:

allerede setter font implisitt

eller har flere hardkodede font-referanser

→ dette skal samles, men ikke endre oppførsel utover fontvalg.

Ved tvil: stopp og avklar før implementering.

🔒 Kontraktslås (kort)

Denne kontrakten endrer kun font, og ingenting annet.
