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
          narBrukesPreset: a.narBrukesPreset,
          narBrukesEgendefinertTekst: a.narBrukesEgendefinertTekst,
        })),
      })),
    })),
  };
}

function buildLines(model) {
  const lines = [];
  pushWrapped(lines, model.tittel, 90);
  lines.push("");

  for (const seksjon of model.seksjoner) {
    if (seksjon.type === "notater") {
      if (seksjon.seksjonNotat) {
        lines.push("Notater til pasient");
        pushWrapped(lines, seksjon.seksjonNotat, 90);
        lines.push("");
      }
      continue;
    }

    for (const ovelse of seksjon.ovelser) {
      lines.push(ovelse.ikon ? `${ovelse.ikon} ${ovelse.navn}` : ovelse.navn);
      pushWrapped(lines, `Utførelse: ${ovelse.utforelse}`, 90);
      lines.push(`Dosering: ${formatDosering(ovelse.dosering)}`);

      if (ovelse.alternativer && ovelse.alternativer.length > 0) {
        lines.push("Alternativer:");
        for (const alt of ovelse.alternativer) {
          const narBrukes = alt.narBrukesEgendefinertTekst
            ? `${alt.narBrukesPreset}: ${alt.narBrukesEgendefinertTekst}`
            : alt.narBrukesPreset;
          pushWrapped(
            lines,
            `- ${alt.retning === "progresjon" ? "Progresjon" : "Regresjon"}: ${alt.navn} (${narBrukes})`,
            90
          );
        }
      }

      lines.push("");
    }
  }

  return lines;
}

function chunkLines(lines, maxLines) {
  const pages = [];
  let current = [];
  for (const line of lines) {
    if (current.length >= maxLines) {
      pages.push(current);
      current = [];
    }
    current.push(line);
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
  const lines = buildLines(model);
  const pages = chunkLines(lines, 48);

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
