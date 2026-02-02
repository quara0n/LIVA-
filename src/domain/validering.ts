validering.ts : // Liva – Rehab-logikk (MVP)
// Validering (returnerer menneskelesbare feil)
// KUN regler – ingen state-endringer

import type { Dosering, OvelseAlternativ, Program, Slug } from "./modeller";

// ----------------------
// Helpers
// ----------------------

function erPositivInt(x: unknown): x is number {
  return typeof x === "number" && Number.isInteger(x) && x > 0;
}

function erTall(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function trimOrEmpty(s: unknown): string {
  return typeof s === "string" ? s.trim() : "";
}

function finnDuplikater(ids: string[]): string[] {
  const sett = new Set<string>();
  const dup = new Set<string>();
  for (const id of ids) {
    if (sett.has(id)) dup.add(id);
    sett.add(id);
  }
  return Array.from(dup);
}

// ----------------------
// Dosering
// ----------------------

export function validerDosering(d: Dosering): string[] {
  const feil: string[] = [];

  if (!d || !d.doseringstype) {
    return ["Dosering: doseringstype mangler."];
  }

  if (d.doseringstype === "reps_x_sett") {
    if (!erPositivInt(d.sett)) feil.push("Dosering: 'sett' må være et positivt heltall for reps x sett.");
    if (!erPositivInt(d.reps)) feil.push("Dosering: 'reps' må være et positivt heltall for reps x sett.");
  }

  if (d.doseringstype === "varighet") {
    if (!erPositivInt(d.varighetSek)) feil.push("Dosering: 'varighetSek' må være et positivt heltall for varighet.");
    // MVP-lås: varighet kan ha sett (optional)
    if (d.sett !== undefined && !erPositivInt(d.sett)) {
      feil.push("Dosering: 'sett' må være et positivt heltall når oppgitt.");
    }
  }

  if (d.doseringstype === "egendefinert") {
    if (trimOrEmpty(d.egendefinertTekst).length === 0) {
      feil.push("Dosering: 'egendefinertTekst' er påkrevd for egendefinert dosering.");
    }
  }

  // Generelle felt (valgfritt)
  if (d.pauseSek !== undefined && !erPositivInt(d.pauseSek)) {
    feil.push("Dosering: 'pauseSek' må være et positivt heltall når oppgitt.");
  }
  if (d.belastningKg !== undefined && !erTall(d.belastningKg)) {
    feil.push("Dosering: 'belastningKg' må være et tall når oppgitt.");
  }

  return feil;
}

// ----------------------
// Alternativer (progresjon/regresjon)
// ----------------------

export function validerAlternativer(alternativer: OvelseAlternativ[] | undefined): string[] {
  if (!alternativer || alternativer.length === 0) return [];

  const feil: string[] = [];
  let progresjonAntall = 0;
  let regresjonAntall = 0;

  for (const a of alternativer) {
    if (!a) {
      feil.push("Alternativ: tomt alternativ-objekt.");
      continue;
    }

    if (a.retning === "progresjon") progresjonAntall++;
    if (a.retning === "regresjon") regresjonAntall++;

    if (trimOrEmpty(a.navn).length === 0) {
      feil.push("Alternativ: 'navn' mangler.");
    }
    if (trimOrEmpty(a.ovelseId).length === 0) {
      feil.push(`Alternativ '${a.navn || "(ukjent)"}': 'ovelseId' mangler.`);
    }

    // MVP-lås: preset B + egendefinert tekst kun ved "Egendefinert"
    if (!a.narBrukesPreset) {
      feil.push(`Alternativ '${a.navn || "(ukjent)"}': 'narBrukesPreset' mangler.`);
    } else if (a.narBrukesPreset === "Egendefinert") {
      if (trimOrEmpty(a.narBrukesEgendefinertTekst).length === 0) {
        feil.push(`Alternativ '${a.navn || "(ukjent)"}': egendefinert tekst mangler.`);
      }
    }
  }

  // MVP-lås: maks 3 + 3
  if (progresjonAntall > 3) feil.push("MVP: maks 3 progresjonsalternativer per øvelse.");
  if (regresjonAntall > 3) feil.push("MVP: maks 3 regresjonsalternativer per øvelse.");

  return feil;
}

// ----------------------
// Program
// ----------------------

export function validerProgram(program: Program): string[] {
  const feil: string[] = [];

  if (!program) return ["Program: program mangler."];

  if (trimOrEmpty(program.tittel).length === 0) {
    feil.push("Program: 'tittel' mangler.");
  }

  if (!program.seksjoner || program.seksjoner.length === 0) {
    feil.push("Program: 'seksjoner' mangler eller er tom.");
    return feil;
  }

  const aktiveSeksjoner = program.seksjoner.filter((s) => s.aktiv);
  if (aktiveSeksjoner.length === 0) {
    feil.push("Program: minst én seksjon må være aktiv.");
  }

  // Samle alle ovelseId i aktive seksjoner (for duplikat-sjekk + "minst én øvelse")
  const alleOvelseId: Slug[] = [];
  for (const s of program.seksjoner) {
    if (!s.aktiv) continue;
    if (!s.ovelser) continue;
    for (const o of s.ovelser) {
      if (o?.ovelseId) alleOvelseId.push(o.ovelseId);
    }
  }

  // MVP-lås: ingen duplikater av samme øvelse i hele programmet
  const duplikater = finnDuplikater(alleOvelseId);
  if (duplikater.length > 0) {
    feil.push(`Program: øvelser kan ikke legges inn flere ganger: ${duplikater.join(", ")}.`);
  }

  // MVP-lås: kan ikke være "klar" uten minst én øvelse
  if (program.status === "klar" && alleOvelseId.length === 0) {
    feil.push("Program: kan ikke være 'klar' uten minst én øvelse.");
  }

  // Valider dosering + alternativer per øvelse
  for (const s of program.seksjoner) {
    if (!s.aktiv) continue;
    if (!s.ovelser) continue;

    for (const o of s.ovelser) {
      if (!o) {
        feil.push(`Seksjon '${s.tittel}': tom øvelse-instans.`);
        continue;
      }

      if (trimOrEmpty(o.navn).length === 0) {
        feil.push(`Seksjon '${s.tittel}': en øvelse mangler navn.`);
      }

      // Dosering
      const dosFeil = validerDosering(o.dosering);
      for (const f of dosFeil) {
        feil.push(`Øvelse '${o.navn || "(ukjent)"}': ${f}`);
      }

      // Alternativer
      const altFeil = validerAlternativer(o.alternativer);
      for (const f of altFeil) {
        feil.push(`Øvelse '${o.navn || "(ukjent)"}': ${f}`);
      }
    }
  }

  return feil;
}
