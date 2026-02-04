function escapePdfText(text) {
  return String(text || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function toLatin1Bytes(input) {
  const str = String(input || "");
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i += 1) {
    const code = str.charCodeAt(i);
    bytes[i] = code > 255 ? 63 : code;
  }
  return bytes;
}

function wrapLine(text, maxLen) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i += 1) {
    const next = `${current} ${words[i]}`;
    if (next.length > maxLen) {
      lines.push(current);
      current = words[i];
    } else {
      current = next;
    }
  }
  lines.push(current);
  return lines;
}

function pushWrapped(target, text, maxLen) {
  const wrapped = wrapLine(text, maxLen);
  for (const line of wrapped) target.push(line);
}

function pushWrappedPrefixed(target, text, maxLen, prefix) {
  const wrapped = wrapLine(text, maxLen);
  for (const line of wrapped) target.push(`${prefix}${line}`);
}

function formatDosering(dosering) {
  if (!dosering || !dosering.doseringstype) return "Ukjent";
  if (dosering.doseringstype === "reps_x_sett") {
    return `${dosering.sett || 0} x ${dosering.reps || 0}`;
  }
  if (dosering.doseringstype === "varighet") {
    const base = `${dosering.varighetSek || 0} sek`;
    return dosering.sett ? `${dosering.sett} x ${base}` : base;
  }
  if (dosering.doseringstype === "egendefinert") {
    return dosering.egendefinertTekst || "Egendefinert";
  }
  return "Ukjent";
}

const LINE_MAX = 90;
const PAGE_MAX_LINES = 48;
const BLOCK_SEPARATOR = "------------------------------------------------------------";
const CHILD_SEPARATOR = "----------------------------------------";
const CHILD_INDENT = "  ";

export function buildPdfModel(program) {
  const seksjoner = (program?.seksjoner || []).filter((s) => s.aktiv);
  return {
    tittel: program?.tittel || "Program",
    status: program?.status || "utkast",
    seksjoner: seksjoner.map((s) => ({
      tittel: s.tittel,
      type: s.type,
      seksjonNotat: s.seksjonNotat || "",
      ovelser: (s.ovelser || []).map((o) => ({
        navn: o.navn,
        utforelse: o.utforelse,
        ikon: o.ikon,
        dosering: o.dosering,
        alternativer: (o.alternativer || []).map((a) => ({
          retning: a.retning,
          navn: a.navn,
          ikon: a.ikon,
          utforelse: a.utforelse,
          dosering: a.dosering,
          narBrukesPreset: a.narBrukesPreset,
          narBrukesEgendefinertTekst: a.narBrukesEgendefinertTekst,
        })),
      })),
    })),
  };
}

function formatTitleLine(navn, ikon) {
  return ikon ? `${ikon} ${navn}` : navn;
}

function buildNarBrukesText(alt) {
  if (!alt) return "";
  const narBrukes = alt.narBrukesEgendefinertTekst
    ? `${alt.narBrukesPreset}: ${alt.narBrukesEgendefinertTekst}`
    : alt.narBrukesPreset;
  return narBrukes || "";
}

function buildExerciseBlock(ovelse) {
  const lines = [];
  const utforelseText = ovelse.utforelse || "";
  const wrappedUtf = wrapLine(utforelseText, LINE_MAX - 2);

  lines.push(formatTitleLine(ovelse.navn, ovelse.ikon));
  lines.push(`Dosering: ${formatDosering(ovelse.dosering)}`);
  lines.push("Utførelse:");
  pushWrappedPrefixed(lines, utforelseText, LINE_MAX - 2, "  ");
  lines.push(" ");

  const alternativer = ovelse.alternativer || [];
  if (alternativer.length) {
    const grupper = [
      { label: "Progresjon", items: alternativer.filter((alt) => alt.retning === "progresjon") },
      { label: "Regresjon", items: alternativer.filter((alt) => alt.retning === "regresjon") },
    ];

    for (const gruppe of grupper) {
      if (!gruppe.items.length) continue;
      for (const alt of gruppe.items) {
        const childIcon = alt.ikon || ovelse.ikon;
        const narBrukesText = buildNarBrukesText(alt);
        const altText = alt.utforelse || narBrukesText;
        if (narBrukesText) {
          lines.push(`${CHILD_INDENT}${gruppe.label}: ${narBrukesText}`);
        } else {
          lines.push(`${CHILD_INDENT}${gruppe.label}`);
        }
        lines.push(`${CHILD_INDENT}${CHILD_SEPARATOR}`);
        lines.push(`${CHILD_INDENT}${formatTitleLine(alt.navn, childIcon)}`);
        lines.push(`${CHILD_INDENT}Dosering: ${formatDosering(alt.dosering)}`);
        lines.push(`${CHILD_INDENT}Utførelse:`);
        pushWrappedPrefixed(
          lines,
          altText,
          LINE_MAX - CHILD_INDENT.length - 2,
          `${CHILD_INDENT}  `
        );
        lines.push(" ");
      }
    }
  }

  lines.push(BLOCK_SEPARATOR);
  lines.push("");

  const minLines =
    1 + // top separator
    1 + // name
    1 + // dosering
    1 + // "Utførelse:"
    Math.max(1, wrappedUtf.length) + // at least one line of utførelse
    1; // bottom separator

  return { lines, minLines };
}

function buildNotaterBlock(seksjon) {
  const lines = [];
  if (!seksjon?.seksjonNotat) return { lines, minLines: 0 };
  lines.push("Notater til pasient");
  pushWrapped(lines, seksjon.seksjonNotat, LINE_MAX);
  lines.push("");
  return { lines, minLines: lines.length };
}

function buildPages(model) {
  const headerLines = [];
  pushWrapped(headerLines, model.tittel, LINE_MAX);
  headerLines.push("");

  const blocks = [];

  for (const seksjon of model.seksjoner) {
    if (seksjon.type === "notater") {
      const notatBlock = buildNotaterBlock(seksjon);
      if (notatBlock.lines.length) blocks.push(notatBlock);
      continue;
    }

    for (const ovelse of seksjon.ovelser) {
      blocks.push(buildExerciseBlock(ovelse));
    }
  }

  return paginateBlocks(headerLines, blocks, PAGE_MAX_LINES);
}

function paginateBlocks(headerLines, blocks, maxLines) {
  const pages = [];
  let current = [...headerLines];
  let remaining = maxLines - current.length;

  const pushPage = () => {
    pages.push(current);
    current = [];
    remaining = maxLines;
  };

  for (const block of blocks) {
    if (block.lines.length > maxLines) {
      if (remaining < block.minLines) {
        pushPage();
      }
      for (const line of block.lines) {
        if (current.length >= maxLines) {
          pushPage();
        }
        current.push(line);
        remaining -= 1;
      }
      continue;
    }

    if (remaining < block.minLines || remaining < block.lines.length) {
      pushPage();
    }

    for (const line of block.lines) {
      current.push(line);
      remaining -= 1;
    }
  }

  if (current.length) pages.push(current);
  return pages;
}

function buildContentStream(lines) {
  const startX = 72;
  const startY = 770;
  const lineHeight = 14;
  let stream = "BT\n/F1 11 Tf\n";
  stream += `${startX} ${startY} Td\n`;
  lines.forEach((line, index) => {
    if (index > 0) stream += `0 -${lineHeight} Td\n`;
    stream += `(${escapePdfText(line)}) Tj\n`;
  });
  stream += "ET";
  return stream;
}

export function renderProgramPdf(program) {
  const model = buildPdfModel(program);
  const pages = buildPages(model);

  const objects = [];
  const pageObjects = [];
  const contentObjects = [];

  const pageCount = pages.length || 1;

  for (let i = 0; i < pageCount; i += 1) {
    const pageObjNum = 3 + i * 2;
    const contentObjNum = pageObjNum + 1;
    pageObjects.push(pageObjNum);
    contentObjects.push(contentObjNum);
  }

  objects[1] = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjects
    .map((n) => `${n} 0 R`)
    .join(" ")}] /Count ${pageCount} >>\nendobj\n`;

  for (let i = 0; i < pageCount; i += 1) {
    const pageObjNum = pageObjects[i];
    const contentObjNum = contentObjects[i];
    const content = buildContentStream(pages[i] || []);
    const contentLength = content.length;

    objects[pageObjNum] =
      `${pageObjNum} 0 obj\n` +
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 5 0 R >> >> /Contents ${contentObjNum} 0 R >>\n` +
      "endobj\n";

    objects[contentObjNum] =
      `${contentObjNum} 0 obj\n<< /Length ${contentLength} >>\nstream\n` +
      content +
      "\nendstream\nendobj\n";
  }

  const fontObjNum = 5 + (pageCount - 1) * 2;
  objects[fontObjNum] = `${fontObjNum} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (let i = 1; i <= fontObjNum; i += 1) {
    offsets[i] = pdf.length;
    pdf += objects[i] || "";
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${fontObjNum + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= fontObjNum; i += 1) {
    const offset = offsets[i] || 0;
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${fontObjNum + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([toLatin1Bytes(pdf)], { type: "application/pdf" });
}
