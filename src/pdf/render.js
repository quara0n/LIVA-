async function loadFontBytes(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Kunne ikke laste PDF-font.");
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

const NOTO_SANS_BYTES = await loadFontBytes(
  new URL("./fonts/NotoSans-Regular.ttf", import.meta.url)
);
async function loadLogoImage() {
  if (typeof document === "undefined" && typeof OffscreenCanvas === "undefined") {
    return null;
  }
  try {
    let response = await fetch("/assets/brand/liva-logo.png");
    if (!response.ok) {
      response = await fetch("/public/assets/brand/liva-logo.png");
    }
    if (!response.ok) return null;
    const blob = await response.blob();
    let bitmap;
    if (typeof createImageBitmap === "function") {
      bitmap = await createImageBitmap(blob);
    } else {
      bitmap = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error("Kunne ikke laste logo."));
        };
        img.src = url;
      });
    }

    const width = bitmap.width;
    const height = bitmap.height;
    const canvas =
      typeof OffscreenCanvas !== "undefined"
        ? new OffscreenCanvas(width, height)
        : document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    const data = ctx.getImageData(0, 0, width, height).data;
    const rgb = new Uint8Array(width * height * 3);
    for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
      const alpha = data[i + 3] / 255;
      rgb[j] = Math.round(255 * (1 - alpha) + data[i] * alpha);
      rgb[j + 1] = Math.round(255 * (1 - alpha) + data[i + 1] * alpha);
      rgb[j + 2] = Math.round(255 * (1 - alpha) + data[i + 2] * alpha);
    }
    return { width, height, data: rgb };
  } catch (_error) {
    return null;
  }
}

const LOGO_IMAGE = await loadLogoImage();
const FONT_NAME = "NotoSans";
const FONT_FIRST_CHAR = 32;
const FONT_LAST_CHAR = 255;

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

function concatChunks(chunks, totalLength) {
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

function readTag(view, offset) {
  return String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3)
  );
}

function readU16(view, offset) {
  return view.getUint16(offset, false);
}

function readS16(view, offset) {
  return view.getInt16(offset, false);
}

function readU32(view, offset) {
  return view.getUint32(offset, false);
}

function getTtfTables(view) {
  const numTables = readU16(view, 4);
  const tables = {};
  let offset = 12;
  for (let i = 0; i < numTables; i += 1) {
    const tag = readTag(view, offset);
    const tableOffset = readU32(view, offset + 8);
    const length = readU32(view, offset + 12);
    tables[tag] = { offset: tableOffset, length };
    offset += 16;
  }
  return tables;
}

function parseCmapFormat4(view, offset, length) {
  const segCount = readU16(view, offset + 6) / 2;
  const endCodesOffset = offset + 14;
  const startCodesOffset = endCodesOffset + segCount * 2 + 2;
  const idDeltaOffset = startCodesOffset + segCount * 2;
  const idRangeOffsetOffset = idDeltaOffset + segCount * 2;
  const glyphIdArrayOffset = idRangeOffsetOffset + segCount * 2;
  return {
    view,
    offset,
    length,
    segCount,
    endCodesOffset,
    startCodesOffset,
    idDeltaOffset,
    idRangeOffsetOffset,
    glyphIdArrayOffset,
  };
}

function findCmapSubtable(view, cmapOffset) {
  const numTables = readU16(view, cmapOffset + 2);
  let recordOffset = cmapOffset + 4;
  for (let i = 0; i < numTables; i += 1) {
    const platformID = readU16(view, recordOffset);
    const encodingID = readU16(view, recordOffset + 2);
    const subtableOffset = readU32(view, recordOffset + 4);
    if (platformID === 3 && encodingID === 1) {
      const tableOffset = cmapOffset + subtableOffset;
      const format = readU16(view, tableOffset);
      const length = readU16(view, tableOffset + 2);
      if (format === 4) return parseCmapFormat4(view, tableOffset, length);
    }
    recordOffset += 8;
  }
  return null;
}

function mapCodeToGlyph(code, cmap) {
  if (!cmap) return 0;
  for (let i = 0; i < cmap.segCount; i += 1) {
    const endCode = readU16(cmap.view, cmap.endCodesOffset + i * 2);
    const startCode = readU16(cmap.view, cmap.startCodesOffset + i * 2);
    if (code < startCode || code > endCode) continue;
    const idDelta = readS16(cmap.view, cmap.idDeltaOffset + i * 2);
    const idRangeOffset = readU16(
      cmap.view,
      cmap.idRangeOffsetOffset + i * 2
    );
    if (idRangeOffset === 0) {
      return (code + idDelta) & 0xffff;
    }
    const glyphOffset =
      cmap.idRangeOffsetOffset + i * 2 + idRangeOffset + (code - startCode) * 2;
    if (glyphOffset >= cmap.offset + cmap.length) return 0;
    const glyphId = readU16(cmap.view, glyphOffset);
    if (glyphId === 0) return 0;
    return (glyphId + idDelta) & 0xffff;
  }
  return 0;
}

let cachedFontInfo = null;
function getFontInfo() {
  if (cachedFontInfo) return cachedFontInfo;

  const view = new DataView(
    NOTO_SANS_BYTES.buffer,
    NOTO_SANS_BYTES.byteOffset,
    NOTO_SANS_BYTES.byteLength
  );
  const tables = getTtfTables(view);
  const head = tables.head;
  const hhea = tables.hhea;
  const maxp = tables.maxp;
  const hmtx = tables.hmtx;
  const cmapTable = tables.cmap;

  const unitsPerEm = readU16(view, head.offset + 18);
  const xMin = readS16(view, head.offset + 36);
  const yMin = readS16(view, head.offset + 38);
  const xMax = readS16(view, head.offset + 40);
  const yMax = readS16(view, head.offset + 42);

  const ascent = readS16(view, hhea.offset + 4);
  const descent = readS16(view, hhea.offset + 6);
  const numberOfHMetrics = readU16(view, hhea.offset + 34);
  const numGlyphs = readU16(view, maxp.offset + 4);

  const glyphWidths = new Array(numGlyphs);
  let hmtxOffset = hmtx.offset;
  let lastAdvance = 0;
  for (let i = 0; i < numGlyphs; i += 1) {
    if (i < numberOfHMetrics) {
      lastAdvance = readU16(view, hmtxOffset);
      hmtxOffset += 4;
    }
    glyphWidths[i] = lastAdvance;
  }

  const cmap = findCmapSubtable(view, cmapTable.offset);
  const spaceGlyph = mapCodeToGlyph(32, cmap);
  const defaultWidth =
    glyphWidths[spaceGlyph] || glyphWidths[0] || unitsPerEm;
  const widths = [];
  for (let code = FONT_FIRST_CHAR; code <= FONT_LAST_CHAR; code += 1) {
    const glyphIndex = mapCodeToGlyph(code, cmap);
    const width = glyphWidths[glyphIndex] || defaultWidth;
    widths.push(Math.round((width * 1000) / unitsPerEm));
  }

  const scale = (value) => Math.round((value * 1000) / unitsPerEm);

  cachedFontInfo = {
    fontBytes: NOTO_SANS_BYTES,
    widths,
    bbox: [scale(xMin), scale(yMin), scale(xMax), scale(yMax)],
    ascent: scale(ascent),
    descent: scale(descent),
    capHeight: scale(ascent),
  };

  return cachedFontInfo;
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
  const rehabMode = Boolean(program?.meta?.rehabTemplate);
  const seksjoner = (program?.seksjoner || [])
    .filter((s) => s.aktiv)
    .filter((s) => {
      if (!rehabMode || s.type === "notater") return true;
      const phaseId = Number(s.phaseId);
      if (Number.isFinite(phaseId)) {
        return phaseId >= 1 && phaseId <= 3;
      }
      return !/^Fase\s*0$/i.test(String(s.tittel || "").trim());
    });
  return {
    tittel: program?.tittel || "Program",
    status: program?.status || "utkast",
    rehabMode,
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

function buildExerciseBlock(ovelse, rehabMode = false) {
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
      {
        label: rehabMode ? "Neste nivå:" : "Progresjon",
        items: alternativer.filter((alt) => alt.retning === "progresjon"),
      },
      {
        label: rehabMode ? "Hvis for tungt:" : "Regresjon",
        items: alternativer.filter((alt) => alt.retning === "regresjon"),
      },
    ];

    for (const gruppe of grupper) {
      if (!gruppe.items.length) continue;
      for (const alt of gruppe.items) {
        const childIcon = alt.ikon || ovelse.ikon;
        const narBrukesText = buildNarBrukesText(alt);
        const altText = alt.utforelse || narBrukesText;
        if (!rehabMode && narBrukesText) {
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

function buildSectionHeaderBlock(title) {
  const lines = [];
  lines.push(String(title || "Fase"));
  lines.push(BLOCK_SEPARATOR);
  lines.push("");
  return { lines, minLines: lines.length };
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
  const headerLines = buildHeaderLines(model, Boolean(LOGO_IMAGE));
  headerLines.push("");

  const blocks = [];

  for (const seksjon of model.seksjoner) {
    if (seksjon.type === "notater") {
      const notatBlock = buildNotaterBlock(seksjon);
      if (notatBlock.lines.length) blocks.push(notatBlock);
      continue;
    }
    if (model.rehabMode) {
      blocks.push(buildSectionHeaderBlock(seksjon.tittel));
    }

    for (const ovelse of seksjon.ovelser) {
      blocks.push(buildExerciseBlock(ovelse, model.rehabMode));
    }
  }

  return paginateBlocks(headerLines, blocks, PAGE_MAX_LINES);
}

function buildHeaderLines(model, hasLogo) {
  if (hasLogo) {
    const titleLines = wrapLine("LIVA", LINE_MAX);
    return titleLines.map(() => "");
  }
  return wrapLine("LIVA", LINE_MAX);
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

function buildContentStream(lines, logoInfo) {
  const startX = 72;
  const startY = 770;
  const lineHeight = 14;
  let stream = "";
  if (logoInfo) {
    const logoHeight = 60;
    const logoWidth = (logoInfo.width / logoInfo.height) * logoHeight;
    const logoY = startY + 6;
    stream +=
      "q\n" +
      `${logoWidth.toFixed(2)} 0 0 ${logoHeight.toFixed(2)} ${startX} ${logoY} cm\n` +
      "/Im1 Do\n" +
      "Q\n";
  }
  stream += "BT\n/F1 11 Tf\n";
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
  const fontInfo = getFontInfo();

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
    const content = buildContentStream(pages[i] || [], LOGO_IMAGE);
    const contentLength = toLatin1Bytes(content).length;

    objects[pageObjNum] =
      `${pageObjNum} 0 obj\n` +
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 ${3 + pageCount * 2} 0 R >>` +
      `${LOGO_IMAGE ? ` /XObject << /Im1 ${3 + pageCount * 2 + 3} 0 R >>` : ""}` +
      ` >> /Contents ${contentObjNum} 0 R >>\n` +
      "endobj\n";

    objects[contentObjNum] =
      `${contentObjNum} 0 obj\n<< /Length ${contentLength} >>\nstream\n` +
      content +
      "\nendstream\nendobj\n";
  }

  const fontObjNum = 3 + pageCount * 2;
  const fontDescriptorObjNum = fontObjNum + 1;
  const fontFileObjNum = fontObjNum + 2;
  const logoObjNum = LOGO_IMAGE ? fontObjNum + 3 : null;

  objects[fontObjNum] =
    `${fontObjNum} 0 obj\n` +
    `<< /Type /Font /Subtype /TrueType /BaseFont /${FONT_NAME} ` +
    `/Encoding /WinAnsiEncoding /FirstChar ${FONT_FIRST_CHAR} /LastChar ${FONT_LAST_CHAR} ` +
    `/Widths [${fontInfo.widths.join(" ")}] /FontDescriptor ${fontDescriptorObjNum} 0 R >>\n` +
    "endobj\n";

  objects[fontDescriptorObjNum] =
    `${fontDescriptorObjNum} 0 obj\n` +
    `<< /Type /FontDescriptor /FontName /${FONT_NAME} /Flags 32 ` +
    `/FontBBox [${fontInfo.bbox.join(" ")}] /ItalicAngle 0 /Ascent ${fontInfo.ascent} ` +
    `/Descent ${fontInfo.descent} /CapHeight ${fontInfo.capHeight} /StemV 80 ` +
    `/FontFile2 ${fontFileObjNum} 0 R >>\n` +
    "endobj\n";

  objects[fontFileObjNum] = {
    header: `${fontFileObjNum} 0 obj\n<< /Length ${fontInfo.fontBytes.length} >>\nstream\n`,
    data: fontInfo.fontBytes,
    footer: "\nendstream\nendobj\n",
  };

  if (LOGO_IMAGE && logoObjNum) {
    objects[logoObjNum] = {
      header:
        `${logoObjNum} 0 obj\n` +
        `<< /Type /XObject /Subtype /Image /Width ${LOGO_IMAGE.width} /Height ${LOGO_IMAGE.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${LOGO_IMAGE.data.length} >>\nstream\n`,
      data: LOGO_IMAGE.data,
      footer: "\nendstream\nendobj\n",
    };
  }

  const totalObjNum = logoObjNum || fontFileObjNum;
  const chunks = [];
  const offsets = [0];
  let pdfLength = 0;

  const pushBytes = (bytes) => {
    chunks.push(bytes);
    pdfLength += bytes.length;
  };

  const pushString = (str) => {
    pushBytes(toLatin1Bytes(str));
  };

  pushString("%PDF-1.4\n");

  for (let i = 1; i <= totalObjNum; i += 1) {
    offsets[i] = pdfLength;
    const obj = objects[i];
    if (!obj) continue;
    if (typeof obj === "string") {
      pushString(obj);
    } else {
      pushString(obj.header);
      pushBytes(obj.data);
      pushString(obj.footer);
    }
  }

  const xrefOffset = pdfLength;
  pushString(`xref\n0 ${totalObjNum + 1}\n`);
  pushString("0000000000 65535 f \n");
  for (let i = 1; i <= totalObjNum; i += 1) {
    const offset = offsets[i] || 0;
    pushString(`${String(offset).padStart(10, "0")} 00000 n \n`);
  }
  pushString(
    `trailer\n<< /Size ${totalObjNum + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  );

  const pdfBytes = concatChunks(chunks, pdfLength);
  return new Blob([pdfBytes], { type: "application/pdf" });
}
