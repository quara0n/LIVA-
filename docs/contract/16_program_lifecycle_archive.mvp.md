Formål

Gi kliniker mulighet til å lagre programmer i arkiv, hente et program for redigering, og PDF-eksportere lagrede programmer.

Scope (MVP)

Gjelder kun venstre panel (Program) sin livssyklus:

Lag nytt program

Lagre program til arkiv

Hent program fra arkiv (liste i venstre panel)

Bytte aktivt program

PDF-eksport fra arkiv (og aktivt program)

Ingen redesign av høyre bibliotek eller toppheader.

Begreper (LÅST)

Aktivt program: programmet som vises i programbygger (venstre panel).

Draft: autosavet kopi av aktivt program (for refresh/gjenoppretting).

Arkiv: liste over lagrede programmer (flere) i localStorage.

Datamodell (LÅST)

Et “program” i arkiv består av:

id (unik)

patientName (string, påkrevd ved lagring)

email (string, valgfritt)

createdAt (timestamp)

updatedAt (timestamp)

content (øvelser, dosering, utførelse, progresjon/regresjon – samme datastruktur som PDF bruker)

Persistensnøkler (localStorage, navngis i kode men konseptet er låst):

archive[] (liste med programmer)

activeProgramId (id for sist aktive arkiverte program, hvis valgt/lagret)

draft (aktivt program for refresh, uavhengig av arkiv)

Navnkrav (LÅST)

Ved “Lagre” til arkiv må:

patientName.trim().length >= 1

Hvis ikke oppfylt:

lagring stoppes

vis enkel inline-feil ved navnefelt (ingen modal)

E-post er alltid valgfri.

Samspill med kontrakt 12 (LÅST)

Kontrakt 12 definerer starttilstand og programtopp-UI.

Kontrakt 16 definerer oppførsel for knappene: Lagre, Nytt program, Hent program, samt arkivlisten.

Starttilstand (LÅST)

I starttilstand skal:

“Lag program” opprette nytt aktivt program (draft)

“Hent program” vise arkivlisten i venstre panel (ikke modal)

Pasientfelter kan fylles før opprettelse og overføres til aktivt program

Programtopp når aktivt program er åpent (LÅST)

Når programbygger-visning er aktiv:

Pasientnavn + e-post er inline editable (plassering i UI følger kontrakt 12; kontrakt 16 låser at data finnes og oppdateres)

Knapper:

Lagre

Nytt program

Hent program

Lagre (LÅST)

Valider navnkravet (minst 1 tegn).

Hvis aktivt program ikke har arkiv-id:

opprett ny arkivpost med ny id

sett aktivt program sin id til denne (kobler aktivt program til arkivposten)

Hvis aktivt program har arkiv-id:

oppdater eksisterende arkivpost

Oppdater updatedAt ved hver lagring.

Nytt program (LÅST)

Starter alltid et blankt aktivt program (draft).

Ingen modal/advarsel i MVP.

Ingen auto-arkivering.

Hent program (LÅST)

Viser arkivlisten i venstre panel (ikke modal).

Åpning av et program i arkiv setter det som aktivt program i builder.

Arkivliste (LÅST)

Arkivliste vises i venstre panel (ikke modal) og viser:

Liste med programmer med minst:

patientName

“Sist oppdatert” (fra updatedAt)

Hver rad har:

Åpne: setter programmet som aktivt program for redigering

PDF: eksporterer PDF for det programmet

PDF fra arkiv (LÅST)

“PDF” på en arkivrad eksporterer valgt program direkte fra arkivdata

Skal ikke endre aktivt program (MVP)

MVP: ingen søk, ingen filter, ingen sletting.

Persistens / refresh (LÅST)
Draft autosave (LÅST)

Aktivt program autosaves som “draft” (inkl pasientinfo) for å overleve refresh.

Draft er det som lastes ved refresh hvis tilgjengelig.

Refresh-regel (LÅST)

Ved refresh:

Hvis draft finnes → last draft og vis programbygger direkte

Hvis ingen draft → vis starttilstand

activeProgramId brukes for “hvilket arkivprogram er koblet til aktivt program” når det finnes, men refresh gjenoppretting styres av draft.

Forbud (MVP)

Ingen modaler

Ingen nye sider/routes

Ingen e-postsending

Ingen sletting i arkiv

Acceptance criteria (testbart)

Kan lagre program kun hvis navn har minst 1 tegn (trim).

Lagret program dukker opp i arkivlisten.

“Hent program” viser arkivlisten i venstre panel.

“Åpne” laster valgt program inn i builder for redigering.

“PDF” eksporterer PDF fra valgt program uten å bytte aktivt program.

Refresh: hvis draft finnes → builder vises igjen (state bevart). Hvis ikke → starttilstand.
