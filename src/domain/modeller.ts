// Liva – Rehab-logikk (MVP)
// Domain-modeller (source of truth)
// Alt på norsk

export type ProgramStatus = "utkast" | "klar";
export type SeksjonType = "hovedovelser" | "tillegg" | "notater";
export type Doseringstype = "reps_x_sett" | "varighet" | "egendefinert";
export type AlternativRetning = "progresjon" | "regresjon";

export type NarBrukesPreset =
  | "Når smerte og funksjon er akseptabel"
  | "Når øvelsen kjennes lett og kontrollert"
  | "Ved økt smerte eller redusert kontroll"
  | "Ved behov for enklere variant"
  | "Egendefinert";

export type Slug = string;
export type ISODateTime = string;

// ---------- Øvelsesbibliotek (master-øvelse) ----------

export interface OvelseMaster {
  ovelseId: Slug; // f.eks. "kneboy"
  navn: string;
  utforelseTekst: string;
  ikon?: string;
  alias?: string[];
  tagger?: string[];
  anbefaltDoseringstyper: Doseringstype[];

  // Sortert: 1–3 = vanligste
  standardProgresjon?: Slug[];
  standardRegresjon?: Slug[];
}

// ---------- Program ----------

export interface Program {
  programId: Slug;
  tittel: string;
  status: ProgramStatus;

  seksjoner: Seksjon[];

  opprettetTid: ISODateTime;
  oppdatertTid: ISODateTime;
}

// ---------- Seksjon ----------

export interface Seksjon {
  seksjonId: Slug;
  type: SeksjonType;
  tittel: string;
  aktiv: boolean;
  rekkefolge: number;

  // Enkel notatlinje (inkl. Notater-seksjonen)
  seksjonNotat?: string;

  ovelser: OvelseInstans[];
}

// ---------- Øvelse-instans (i programmet) ----------

export interface OvelseInstans {
  ovelseInstansId: Slug;
  ovelseId: Slug; // peker til OvelseMaster
  navn: string;   // snapshot for PDF
  utforelse: string; // snapshot for PDF
  ikon?: string; // snapshot for PDF
  dosering: Dosering;

  kommentar?: string;

  alternativer?: OvelseAlternativ[];
}

// ---------- Progresjon / regresjon ----------

export interface OvelseAlternativ {
  retning: AlternativRetning;
  ovelseId: Slug;
  navn: string;
  tagger?: string[];

  narBrukesPreset: NarBrukesPreset;
  narBrukesEgendefinertTekst?: string;
}

// ---------- Dosering ----------

export interface Dosering {
  doseringstype: Doseringstype;

  // reps_x_sett
  sett?: number;
  reps?: number;

  // varighet (sett optional)
  varighetSek?: number;

  // felles valgfritt
  pauseSek?: number;
  belastningKg?: number;

  // egendefinert
  egendefinertTekst?: string;
}
