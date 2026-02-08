Kontrakt 24 – Video i Øvelsesbibliotek (Thumbnail + Avspilling) – MVP

Prosjekt: LIVA
Status: Aktiv / Lås
Avhenger av: Kontrakt 23 – Video Manifest & Preview (MVP)
Gjelder: apps/web – øvelsesbibliotek (UI)
Gjelder ikke: domene, rehab-logikk, PDF, persistens

1. Formål

Denne kontrakten definerer hvordan treningsvideoer skal presenteres og brukes i øvelsesbiblioteket, gitt at:

video allerede er integrert via manifest (Kontrakt 23)

video er sekundært hjelpemiddel

øvelse er primær handling

Målet er å:

gjøre video raskt tilgjengelig

uten å forstyrre arbeidsflyt

uten å endre eksisterende programlogikk

2. Forutsetninger

Denne kontrakten forutsetter at følgende allerede fungerer:

videos.manifest.json er lastet i UI-state

video-preview fungerer via eksplisitt handling

øvelser kan eksistere med eller uten video

Denne kontrakten endrer ikke noe av dette.

3. Overordnede prinsipper (låst)

Øvelse er primær enhet

“Legg til i program” er primær handling

Video er sekundær støtte

UI skal fungere identisk med og uten video

Video skal aldri blokkere, erstatte eller dominere øvelsesvalg

4. Thumbnail / visuell representasjon

Øvelser med tilgjengelig video kan vise:

thumbnail / snapshot

eller statisk placeholder (ingen autoplay)

Thumbnail skal:

være nøytral

ikke animert

ikke ta fokus fra øvelsesnavn og handlinger

❌ Ikke tillatt:

autoplay

hover-play

GIF/video i liste

fullbredde video i biblioteket

5. Play / avspilling (ankret, forstørret, lukkbar)

Video skal startes ved klikk på et Play-ikon på øvelseskortet/raden.

Video skal åpnes som en forstørret visning fra samme plassering i listen (ankret til elementet), ikke som helside-navigasjon.

Når video åpnes:

øvelseskortet/raden “ekspanderer” til en større videoflate

resten av biblioteket skal ikke endre rekkefølge eller hoppe mer enn nødvendig

video vises med <video controls preload="metadata">

Lukk (obligatorisk)

Det skal alltid være en tydelig X / Lukk-knapp øverst til høyre i videoflaten.

Klikk på X:

lukker videoflaten

returnerer elementet til normal størrelse

stoppe avspilling (pause) og nullstill visning (ikke fortsette lyd i bakgrunn)

Interaksjonsregler

Klikk på “Legg til i program” skal ikke starte video.

Klikk på Play skal kun starte/åpne video (ikke legge til).

Kun én video kan være åpen om gangen:

åpning av ny video lukker forrige.

Ikke tillatt

❌ Fullskjerm som default

❌ Autoplay uten klikk

❌ Hover-play

❌ Video som spiller i listen uten ekspandering

Minimal teknisk konsekvens (for Codex)

Dette er fortsatt innen scope:

Render: ekspander/kontraher for valgt exerciseKey eller videoId

Events: openInlineVideo(videoId) + closeInlineVideo()

State: ui.videoPreviewOpenId (eller tilsvarende)

Kontrakt 23 brukes fortsatt for å hente URL fra manifestet.

6. Legg til i program (primær handling)

“Legg til i program” skal:

alltid være tilgjengelig

fungere likt uavhengig av video

Video-relaterte handlinger skal ikke påvirke:

add-to-program

rekkefølge

fokus

7. Samspill mellom handlinger

Ved øvelser med video skal UI tydelig kommunisere:

Primær: legg til øvelse i program

Sekundær: se video

Det skal være umulig å:

forveksle play med add

trigge feil handling ved klikk

8. Tillatte filer å endre

Kun følgende filer kan endres under denne kontrakten:

apps/web/ui/render.js

apps/web/ui/events.js

ev. mindre justeringer i eksisterende UI-state

❌ Ikke tillatt:

endringer i manifest

endringer i domene

endringer i programstruktur

redesign av hele biblioteket

9. Feilhåndtering

Hvis video finnes i manifest, men ikke kan lastes:

øvelsen skal fortsatt kunne legges til

vis diskret feilmelding ved play

Ingen blokkering av øvrig UI

10. Ferdigkriterier

Denne kontrakten er oppfylt når:

Øvelser med video viser thumbnail eller tydelig video-indikator

Play åpner video i eksisterende preview

“Legg til i program” fungerer uendret

Øvelser uten video oppfører seg identisk som før

Ingen andre deler av systemet er endret

Kun én video kan være åpen i biblioteket samtidig.

11. Videre arbeid (låst)

Etter implementasjon av denne kontrakten:

Video-presentasjon i biblioteket anses som ferdig for MVP

Endringer krever ny kontrakt

Videre forbedringer parkeres (f.eks. captions, chapters, filters)

12. Effekt av kontrakten

Denne kontrakten:

fullfører video-opplevelsen i øvelsesbiblioteket

beskytter arbeidsflyt for kliniker

gjør systemet skalerbart til 1000+ videoer

sikrer tydelig hierarki mellom handlinger

Status:
Denne kontrakten er aktiv og bindende.
Avvik regnes som implementasjonsfeil, ikke UX- eller designvalg.
