Kontrakt 27 – Horisontal rendering av progresjon/regresjon i programbygger

Prosjekt: LIVA
Node: UX/UI – Programbygger
Modus: Implementerbar spesifikasjon (smalt scope)
Status: Aktiv (ny kontrakt)
Avhenger av: Eksisterende progresjon/regresjon-flyt (velg øvelse → sett kriterier → lagre/avbryt)

1. Formål

Når kliniker oppretter en progresjons- eller regresjonsøvelse (via eksisterende flyt), skal den vises horisontalt ved siden av primærøvelsen i samme seksjonsblokk, med identisk doseringsstruktur og diskret visuell differensiering som tydeliggjør rolle (“progresjon/regresjon”).

2. Scope (det som skal endres)

Kun rendering/layout i programbygger etter “Lagre” i eksisterende progresjon/regresjon-dialog:

Instansiert progresjon/regresjon-kort skal rendres til høyre for primærøvelsen (samme seksjonsblokk).

Kortet skal ha:

thumbnail/video

reps/sett/dosering (samme komponenter/inline redigering som primær)

kriterietekst synlig (fordi PDF skal speile builder)

Diskret visuell differensiering:

label (“Progresjon” / “Regresjon”) og/eller svak shade/border (ikke sterke farger)

3. Ikke-scope (skal ikke røres)

Ingen endring i flyten for å opprette progresjon/regresjon:

fortsatt: trykk +/– → velg øvelse → sett kriterium → lagre/avbryt

Ingen endring i data-/rehab-logikk

Ingen endring i PDF/print (annet enn at PDF følger builder slik den allerede gjør)

Ingen endring i video/manifest

Ingen støtte nå for “progresjon av progresjon”, “regresjon-kjede”, eller flere steg (kommer evt. i ny kontrakt)

4. UX-regler (konkret)

Før lagring: ingen progresjon/regresjonskort vises horisontalt.

Etter lagring: kortet vises umiddelbart ved siden av primærøvelsen.

Kriterium må alltid være synlig i kortet (eller i en tydelig “overgangsstripe” mellom kortene – velg én, men det må være konsekvent).

Doseringsfelt (reps/sett) skal være redigerbare inline akkurat som primærøvelsen.

Fjerne/endre progresjon/regresjon:

behold eksisterende “fjern”-mekanisme (uendret),

men rendering skal oppdatere horisontalt når den fjernes.

5. Akseptkriterier (testbare)

AC1: Opprett progresjon (velg øvelse + kriterium + lagre) ⇒ progresjonskort vises til høyre for primær i samme seksjonsblokk.

AC2: Opprett regresjon ⇒ regresjonskort vises til høyre for primær (plassering definert: enten etter progresjon, eller fast rekkefølge Primær | Regresjon | Progresjon — velg én i implementasjonen og gjør den konsekvent).

AC3: Reps/sett/dosering kan endres på progresjon/regresjon-kort uten å påvirke primærøvelsens dosering.

AC4: Kriterietekst er synlig i builder og følger med i PDF (siden PDF speiler builder).

AC5: Ingen layout “skyver” resten av seksjonen på uforutsigbar måte (kortene holder seg innenfor seksjonsblokkens ramme; ved for smal skjerm skal det wrappe kontrollert eller bruke horisontal scroll – velg én strategi og hold den).

AC6: Eksisterende +Progresjon/–Regresjon-lenker under primærøvelsen er uendret og fungerer som før.

6. UI-notater (minstekrav)

Visuell differensiering skal være lav-støy:

svak bakgrunnstone eller tynn venstrekant

liten label/“badge” øverst i kortet: “Progresjon” / “Regresjon”

Ingen nye knapper/handlinger introduseres i denne kontrakten.

7. Fremtid (ikke implementeres her)

Flere progresjonssteg (Primær → Prog1 → Prog2)

Regresjon → progresjon (kjeder/graph)

Flere parallelle progresjoner fra primær
