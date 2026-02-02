// Liva – Rehab-logikk (MVP)
// Actions (rene funksjoner som endrer programdata)
// - Ingen sideeffekter (immutability)
// - Ingen validering her (bruk validering.ts etterpå)

import type {
  Program,
  Seksjon,
  Slug,
  OvelseInstans,
  OvelseMaster,
  Dosering,
  OvelseAlternativ,
} from "./modeller";

// ----------------------
// Helpers
// ----------------------

function nowIso(): string {
  return new Date().toISOString();
}

function finnSeksjon(program: Program, seksjonId: Slug): Seksjon | undefined {
  return program.seksjoner.find((s) => s.seksjonId === seksjonId);
}

function ovelseFinnesIProgram(program: Program, ovelseId: Slug): boolean {
  for (const s of program.seksjoner) {
    for (const o of s.ovelser) {
      if (o.ovelseId === ovelseId) return true;
    }
  }
  return false;
}

function oppdaterSeksjon(program: Program, oppdatert: Seksjon): Program {
  return {
    ...program,
    oppdatertTid: nowIso(),
    seksjoner: program.seksjoner.map((s) =>
      s.seksjonId === oppdatert.seksjonId ? oppdatert : s
    ),
  };
}

function lagOvelseInstansId(ovelseId: Slug): Slug {
  return `inst_${ovelseId}_${Date.now()}`;
}

// ----------------------
// Factory
// ----------------------

/**
 * Lager en ny øvelse-instans basert på master-øvelse.
 * - Tar snapshot av navn (PDF-sikkert)
 * - dosering sendes inn fra UI / default-logikk
 * - ovelseInstansId kan sendes inn, men genereres hvis ikke oppgitt (MVP-vennlig)
 */
export function lagNyOvelseInstans(
  master: OvelseMaster,
  dosering: Dosering,
  ovelseInstansId?: Slug
): OvelseInstans {
  return {
    ovelseInstansId: ovelseInstansId ?? lagOvelseInstansId(master.ovelseId),
    ovelseId: master.ovelseId,
    navn: master.navn,
    dosering,
    alternativer: [],
  };
}

// ----------------------
// Actions
// ----------------------

/**
 * Legg til en øvelse i en spesifikk seksjon (typisk "aktiv seksjon" fra UI).
 * MVP-regel: samme ovelseId kan ikke finnes flere ganger i programmet.
 * Returnerer { program, feil[] } i stedet for å kaste exceptions.
 *
 * ovelseInstansId er valgfri:
 * - send den inn hvis UI allerede har en id
 * - ellers genererer domain en id
 */
export function leggTilOvelse(
  program: Program,
  seksjonId: Slug,
  master: OvelseMaster,
  dosering: Dosering,
  ovelseInstansId?: Slug
): { program: Program; feil: string[] } {
  const feil: string[] = [];

  const seksjon = finnSeksjon(program, seksjonId);
  if (!seksjon) {
    feil.push(`Seksjon finnes ikke: ${seksjonId}`);
    return { program, feil };
  }

  if (ovelseFinnesIProgram(program, master.ovelseId)) {
    feil.push(`Øvelsen '${master.navn}' er allerede lagt inn i programmet.`);
    return { program, feil };
  }

  const ny = lagNyOvelseInstans(master, dosering, ovelseInstansId);

  const oppdatertSeksjon: Seksjon = {
    ...seksjon,
    ovelser: [...seksjon.ovelser, ny],
  };

  return { program: oppdaterSeksjon(program, oppdatertSeksjon), feil };
}

/**
 * Fjern en øvelse-instans fra programmet (uansett hvilken seksjon den ligger i).
 */
export function fjernOvelse(
  program: Program,
  ovelseInstansId: Slug
): { program: Program; feil: string[] } {
  const feil: string[] = [];
  let funnet = false;

  const seksjoner = program.seksjoner.map((s) => {
    const før = s.ovelser.length;
    const ovelser = s.ovelser.filter(
      (o) => o.ovelseInstansId !== ovelseInstansId
    );
    if (ovelser.length !== før) funnet = true;
    return { ...s, ovelser };
  });

  if (!funnet) {
    feil.push(`Fant ikke øvelse-instans: ${ovelseInstansId}`);
    return { program, feil };
  }

  return {
    program: { ...program, oppdatertTid: nowIso(), seksjoner },
    feil,
  };
}

/**
 * Legg til et progresjons-/regresjonsalternativ på en øvelse-instans.
 * Merk: Max 3/3 + egendefinert tekst valideres i validering.ts (ikke her).
 */
export function leggTilAlternativ(
  program: Program,
  ovelseInstansId: Slug,
  alternativ: OvelseAlternativ
): { program: Program; feil: string[] } {
  const feil: string[] = [];
  let oppdatert = false;

  const seksjoner = program.seksjoner.map((s) => {
    const ovelser = s.ovelser.map((o) => {
      if (o.ovelseInstansId !== ovelseInstansId) return o;

      const eksisterende = o.alternativer ?? [];
      oppdatert = true;

      return {
        ...o,
        alternativer: [...eksisterende, alternativ],
      };
    });

    return { ...s, ovelser };
  });

  if (!oppdatert) {
    feil.push(`Fant ikke øvelse-instans: ${ovelseInstansId}`);
    return { program, feil };
  }

  return {
    program: { ...program, oppdatertTid: nowIso(), seksjoner },
    feil,
  };
}

/**
 * Oppdater seksjonsnotat (for "Notater"-seksjonen eller andre).
 */
export function settSeksjonNotat(
  program: Program,
  seksjonId: Slug,
  seksjonNotat: string
): { program: Program; feil: string[] } {
  const feil: string[] = [];
  const seksjon = finnSeksjon(program, seksjonId);

  if (!seksjon) {
    feil.push(`Seksjon finnes ikke: ${seksjonId}`);
    return { program, feil };
  }

  const oppdatertSeksjon: Seksjon = { ...seksjon, seksjonNotat };
  return { program: oppdaterSeksjon(program, oppdatertSeksjon), feil };
}
