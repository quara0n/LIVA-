Kontrakt 23 – Videointegrasjon (Manifest + Preview) – MVP

Prosjekt: LIVA
Status: Aktiv / Lås
Gjelder: apps/web
Gjelder ikke: domene, rehab-logikk, PDF, persistens
Forutsetninger:

Video-noden er etablert

videos.manifest.json finnes

Minst én MP4-video er produsert

1. Formål

Denne kontrakten definerer hvordan treningsvideoer skal integreres i LIVA i MVP-fasen, basert på:

statiske video-filer

et eksplisitt video-manifest

enkel forhåndsvisning i UI

Målet er å:

støtte skalering til 1000+ videoer

holde video som innholdslag, ikke domene

unngå redesign, refaktor eller scope-glidning

2. Overordnede prinsipper (låst)

Video er valgfritt innhold, aldri en forutsetning

Video skal aldri påvirke:

øvelseslogikk

progresjon

PDF

arkiv

UI skal fungere identisk med og uten video

Implementasjon skal være minimal og eksplisitt

3. Avgrensninger (kritisk)

Følgende er ikke tillatt under denne kontrakten:

❌ Endringer i src/domain/

❌ Endringer i src/pdf/

❌ Ny persistensmodell

❌ Refaktorering

❌ UI-redesign

❌ Autoplay av video

❌ Preloading av hele video-filer

❌ “Optimalisering” utover det som kreves for å fungere

4. Video-assets (struktur)

Alle videoer lagres som statiske filer i:

apps/web/public/videos/

Videoer skal være tilgjengelige via public path:

/videos/<filename>.mp4

Ingen andre plasseringer er tillatt.

5. Video-manifest (source of truth)

Kobling mellom øvelse og video styres utelukkende av manifestet.

Fil:

src/data/videos.manifest.json

Minimum schema (låst)
{
"id": "string",
"title": "string",
"exerciseKey": "string",
"url": "string"
}

exerciseKey må samsvare med nøkkel brukt i biblioteket

url må peke til public video-path (/videos/...)

Manifestet skal ikke berikes eller omstruktureres

6. Import og state

Video-manifest lastes ved app-oppstart

Manifest lagres i UI-state

Manifest skal ikke inn i domene

Tillatte filer:

apps/web/app.js

apps/web/state/program.actions.js

7. UI-oppførsel i bibliotek

Dersom en øvelse har matchende exerciseKey:

vis en diskret indikator for tilgjengelig video

Øvelser uten video:

skal fungere helt uendret

skal ikke ha tomme placeholders

8. Preview-modal

Video åpnes kun etter eksplisitt brukerhandling

Bruk HTML <video>-element med:

<video controls preload="metadata">

❌ Ingen autoplay

❌ Ingen full preload

❌ Ingen grafikk, overlays eller ekstra UI

Tillatte filer:

apps/web/ui/render.js

apps/web/ui/events.js

9. Feilhåndtering

Hvis video mangler eller ikke kan lastes:

vis enkel, ikke-blokkerende UI-feilmelding

applikasjonen skal ikke krasje

Ingen retries eller fallback-videoer

10. Ferdigkriterier

Denne kontrakten er oppfylt når:

En MP4 i apps/web/public/videos/ kan forhåndsvises i UI

Video kan nås direkte via /videos/...

Øvelser uten video påvirkes ikke

Ingen andre deler av systemet er endret

11. Videre arbeid (låst rekkefølge)

Etter at denne kontrakten er implementert:

Kun legge til flere videoer

Kun utvide videos.manifest.json

Ingen endringer i integrasjonslogikk uten ny kontrakt

12. Effekt av kontrakten

Denne kontrakten:

låser video-integrasjon for MVP

muliggjør produksjon av 1000+ videoer

beskytter UI og domene mot scope-glidning

gir Codex tydelige rammer for videre arbeid

Status:
Denne kontrakten er aktiv og bindende.
Avvik regnes som implementasjonsfeil, ikke designvalg.
