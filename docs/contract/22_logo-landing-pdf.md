Bakgrunn

Vi har en PNG-logo som skal brukes i MVP for å gi tydelig avsender i både web og PDF, uten redesign.

Mål

Vise LIVA-logo i landings-/top-header i web UI (der programtittel står nå).

Vise samme LIVA-logo i PDF-header ved eksport.

Ingen øvrige endringer i funksjon eller layout utover det som trengs for plassering.

Source asset

Logo skal ligge i repo på fast path:

public/assets/brand/liva-logo.png

Hvis public/assets/brand/ ikke finnes, skal den opprettes.

Web UI — krav
Plassering

I top-header (området som i dag viser programtittel, f.eks. “Kne-rehab uke 1”).

Erstatt programtittelen med logo.

Rendering

Bruk <img>:

src="/assets/brand/liva-logo.png"

alt="LIVA"

Høyde: 32px (auto bredde)

Ingen filter/effekter (ingen CSS-fargeendring, skygge, drop-shadow etc.)

Skal ikke være klikkbar (kun visuell identitet)

Status-chip

Status-chip (f.eks. “UTKAST”) kan beholdes.

Hvis den beholdes: plasser den visuelt tett ved logo (samme headerlinje).

Ikke-scope (UI)

Ikke flytt “Eksporter PDF”-knappen.

Ikke legg til ny teksttittel et annet sted.

Ingen redesign av header, spacing globalt, farger eller typografi.

PDF — krav
Plassering

Legg logo i PDF-header (øverst), venstrejustert (samme “avsenderplass” på alle PDF-er).

Rendering

Bruk samme asset (liva-logo.png)

Høyde: 20px (auto bredde) — kan justeres ±2px for å passe eksisterende PDF-margins.

Ingen effekter, ingen stretching.

Ikke-scope (PDF)

Ikke endre layout på resten av PDF utover det som trengs for å få plass til logoen.

Ikke endre innhold, rekkefølge eller typografi i programmet.

Fallback (begge flater)

Hvis logo ikke kan lastes/rendres:

vis tekst LIVA i samme posisjon (enkel, nøytral tekst, ingen styling utover eksisterende header-font).

Akseptansekriterier

 public/assets/brand/liva-logo.png finnes i repo.

 Programtittel i web-header er erstattet av logo.

 Logo vises i PDF-header ved eksport.

 “Eksporter PDF” og øvrig UI oppfører seg identisk som før.

 Ingen andre UI-/PDF-endringer utover beskrevet scope.

Test

Web: Last side, verifiser at logo vises i header og at resten av UI er uendret.

PDF: Eksporter og verifiser at logo vises øverst til venstre, skarp og uten forvrengning