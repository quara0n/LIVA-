import { renderProgramPdf } from "../../src/pdf/render.js";

const DATA_PATHS = {
  program: "../../src/data/program.seed.json",
  library: "../../src/data/ovelsesbibliotek.seed.json",
};

const state = {
  program: null,
  library: [],
  search: "",
  ui: {
    altSectionOpen: {},
    showMore: {},
    altPicker: null,
    detailsOpen: {},
    sekundar: {},
  },
};

const toastEl = document.getElementById("toast");
const programTitleEl = document.getElementById("program-title");
const programStatusEl = document.getElementById("program-status");
const exportBtn = document.getElementById("export-btn");
const hoveddelListEl = document.getElementById("hoveddel-list");
const notaterInputEl = document.getElementById("notater-input");
const libraryGridEl = document.getElementById("library-grid");
const searchInputEl = document.getElementById("search-input");

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2000);
}

function makeId(prefix) {
  if (crypto && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSection(type) {
  return state.program.seksjoner.find((s) => s.type === type);
}

function getHoveddelSection() {
  return getSection("hovedovelser");
}

function getNotaterSection() {
  return getSection("notater");
}

function getMasterById(id) {
  return state.library.find((item) => item.ovelseId === id);
}

function isInProgram(ovelseId) {
  const hoveddel = getHoveddelSection();
  return hoveddel.ovelser.some((o) => o.ovelseId === ovelseId);
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function matchesSearch(item, query) {
  if (!query) return true;
  const haystack = [
    item.navn,
    item.ovelseId,
    ...(item.alias || []),
    ...(item.tagger || []),
  ]
    .map(normalize)
    .join(" ");
  return haystack.includes(query);
}

function finnOvelserUtenUtforelse(program) {
  if (!program || !program.seksjoner) return [];
  const mangler = [];
  for (const seksjon of program.seksjoner) {
    if (!seksjon.aktiv) continue;
    for (const ovelse of seksjon.ovelser || []) {
      if (!ovelse || !String(ovelse.utforelse || "").trim()) {
        mangler.push(ovelse?.navn || "(ukjent)");
      }
    }
  }
  return mangler;
}

function addExercise(master) {
  const hoveddel = getHoveddelSection();
  if (isInProgram(master.ovelseId)) {
    showToast("Øvelsen finnes allerede i programmet.");
    return;
  }

  const instans = {
    ovelseInstansId: makeId("instans"),
    ovelseId: master.ovelseId,
    navn: master.navn,
    utforelse: master.utforelseTekst,
    dosering: {
      doseringstype: "reps_x_sett",
      reps: 10,
      sett: 3,
    },
    kommentar: "",
    alternativer: [],
  };

  hoveddel.ovelser.push(instans);
  render();
}

function removeExercise(instansId) {
  const hoveddel = getHoveddelSection();
  hoveddel.ovelser = hoveddel.ovelser.filter(
    (o) => o.ovelseInstansId !== instansId
  );
  delete state.ui.altSectionOpen[instansId];
  render();
}

function moveExercise(instansId, direction) {
  const hoveddel = getHoveddelSection();
  const index = hoveddel.ovelser.findIndex(
    (o) => o.ovelseInstansId === instansId
  );
  if (index < 0) return;
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= hoveddel.ovelser.length) return;
  const clone = [...hoveddel.ovelser];
  const [item] = clone.splice(index, 1);
  clone.splice(nextIndex, 0, item);
  hoveddel.ovelser = clone;
  render();
}

function updateDosering(instansId, field, value) {
  const hoveddel = getHoveddelSection();
  const instans = hoveddel.ovelser.find((o) => o.ovelseInstansId === instansId);
  if (!instans) return;
  if (field === "reps" || field === "sett") {
    instans.dosering[field] = Number(value) || 0;
  } else if (field === "kommentar") {
    instans.kommentar = value;
  }
}

function toggleAltSection(instansId, retning) {
  if (!retning) return;
  state.ui.altSectionOpen[instansId] =
    state.ui.altSectionOpen[instansId] === retning ? null : retning;
  render();
}

function toggleDetails(instansId) {
  state.ui.detailsOpen[instansId] = !state.ui.detailsOpen[instansId];
  render();
}

function updateSekundar(instansId, field, value) {
  state.ui.sekundar[instansId] = state.ui.sekundar[instansId] || {
    vekt: "",
    pause: "",
  };
  state.ui.sekundar[instansId][field] = value;
}

function toggleShowMore(instansId, retning) {
  state.ui.showMore[instansId] = state.ui.showMore[instansId] || {
    progresjon: false,
    regresjon: false,
  };
  state.ui.showMore[instansId][retning] =
    !state.ui.showMore[instansId][retning];
  render();
}

function openAltPicker(instansId, retning, ovelseId) {
  state.ui.altPicker = {
    instansId,
    retning,
    ovelseId,
    narBrukesPreset: "Når smerte og funksjon er akseptabel",
    narBrukesEgendefinertTekst: "",
  };
  render();
}

function cancelAltPicker() {
  state.ui.altPicker = null;
  render();
}

function saveAltPicker() {
  const picker = state.ui.altPicker;
  if (!picker) return;

  if (
    picker.narBrukesPreset === "Egendefinert" &&
    !picker.narBrukesEgendefinertTekst.trim()
  ) {
    showToast("Skriv en kort egendefinert linje.");
    return;
  }

  const hoveddel = getHoveddelSection();
  const instans = hoveddel.ovelser.find((o) => o.ovelseInstansId === picker.instansId);
  if (!instans) return;

  const altCount = (instans.alternativer || []).filter(
    (a) => a.retning === picker.retning
  ).length;
  if (altCount >= 3) {
    showToast("Maks 3 per retning.");
    return;
  }

  const master = getMasterById(picker.ovelseId);
  if (!master) return;

  instans.alternativer = instans.alternativer || [];
  instans.alternativer.push({
    retning: picker.retning,
    ovelseId: picker.ovelseId,
    navn: master.navn,
    tagger: master.tagger || [],
    utforelse: master.utforelseTekst,
    dosering: {
      doseringstype: "reps_x_sett",
      reps: 10,
      sett: 3,
    },
    narBrukesPreset: picker.narBrukesPreset,
    narBrukesEgendefinertTekst:
      picker.narBrukesPreset === "Egendefinert"
        ? picker.narBrukesEgendefinertTekst.trim()
        : undefined,
  });

  state.ui.altPicker = null;
  state.ui.altSectionOpen[picker.instansId] = null;
  render();
}

function renderAlternativer(instans, master, retning, label) {
  const slugs = retning === "progresjon" ? master.standardProgresjon || [] : master.standardRegresjon || [];
  const showMore =
    state.ui.showMore[instans.ovelseInstansId]?.[retning] || false;
  const visible = showMore ? slugs : slugs.slice(0, 3);
  const hasMoreToggle = slugs.length > 3;

  const existingCount = (instans.alternativer || []).filter(
    (a) => a.retning === retning
  ).length;

  const list = visible
    .map((slug) => {
      const altMaster = getMasterById(slug);
      if (!altMaster) return "";
      const isPicking =
        state.ui.altPicker &&
        state.ui.altPicker.instansId === instans.ovelseInstansId &&
        state.ui.altPicker.retning === retning &&
        state.ui.altPicker.ovelseId === slug;
      const addDisabled = existingCount >= 3;

      return `
        <div class="alt-item">
          <strong>${altMaster.navn}</strong>
          ${altMaster.tagger && altMaster.tagger[0] ? `<span class="tag">${altMaster.tagger[0]}</span>` : ""}
          <div class="alt-actions">
            <button class="action-btn" data-action="add-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="${retning}" data-alt-id="${slug}" ${addDisabled ? "disabled" : ""}>Legg til</button>
            ${isPicking ? renderAltPickerControls(instans.ovelseInstansId) : ""}
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="alt-section">
      <div class="alt-header">
        <strong>${label}</strong>
        ${hasMoreToggle ? `
          <button class="action-btn" data-action="toggle-more" data-instans-id="${instans.ovelseInstansId}" data-retning="${retning}">
            ${showMore ? "Vis færre" : "Vis flere"}
          </button>
        ` : ""}
      </div>
      <div class="alt-list">
        ${list || `<span class="tag">Ingen foreslåtte ${label.toLowerCase()}.</span>`}
      </div>
    </div>
  `;
}

function renderAltPickerControls(instansId) {
  const picker = state.ui.altPicker;
  if (!picker || picker.instansId !== instansId) return "";

  const preset = picker.narBrukesPreset;
  const egendefinertVisible = preset === "Egendefinert";

  return `
    <select class="select" data-action="alt-preset">
      <option${preset === "Når smerte og funksjon er akseptabel" ? " selected" : ""}>Når smerte og funksjon er akseptabel</option>
      <option${preset === "Når øvelsen kjennes lett og kontrollert" ? " selected" : ""}>Når øvelsen kjennes lett og kontrollert</option>
      <option${preset === "Ved økt smerte eller redusert kontroll" ? " selected" : ""}>Ved økt smerte eller redusert kontroll</option>
      <option${preset === "Ved behov for enklere variant" ? " selected" : ""}>Ved behov for enklere variant</option>
      <option${preset === "Egendefinert" ? " selected" : ""}>Egendefinert</option>
    </select>
    ${egendefinertVisible ? `<input class="inline-input wide" data-action="alt-custom" placeholder="Kort, konkret linje" value="${picker.narBrukesEgendefinertTekst}" />` : ""}
    <button class="action-btn" data-action="alt-save">Lagre</button>
    <button class="action-btn" data-action="alt-cancel">Avbryt</button>
  `;
}

function renderProgram() {
  const hoveddel = getHoveddelSection();
  if (!hoveddel) return;

  const items = hoveddel.ovelser
    .map((instans, index) => {
      const master = getMasterById(instans.ovelseId);
      const emoji = master?.emoji || "🏃";
      const altOpen = state.ui.altSectionOpen[instans.ovelseInstansId] || null;
      const detailsOpen = state.ui.detailsOpen[instans.ovelseInstansId] || false;
      const sekundar = state.ui.sekundar[instans.ovelseInstansId] || {
        vekt: "",
        pause: "",
      };

      const altItems = (instans.alternativer || []).map((alt, altIndex) => {
        const narBrukes = `${alt.narBrukesPreset}${alt.narBrukesEgendefinertTekst ? ": " + alt.narBrukesEgendefinertTekst : ""}`;
        return `
          <div class="alt-item child">
            <strong>${alt.navn}</strong>
            <span class="tag">${alt.retning} · ${narBrukes}</span>
            <div class="alt-meta">
              <span>Dosering</span>
              <input class="inline-input" type="number" min="0" value="${alt.dosering?.reps || 0}" data-action="edit-alt-field" data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}" data-field="reps" />
              <span>x</span>
              <input class="inline-input" type="number" min="0" value="${alt.dosering?.sett || 0}" data-action="edit-alt-field" data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}" data-field="sett" />
              <span>sett</span>
            </div>
            <div class="alt-desc">${alt.utforelse || ""}</div>
          </div>
        `;
      });

      const valgtProgresjon = altItems
        .filter((_, index) => (instans.alternativer || [])[index]?.retning === "progresjon")
        .join("");
      const valgtRegresjon = altItems
        .filter((_, index) => (instans.alternativer || [])[index]?.retning === "regresjon")
        .join("");

      return `
        <div class="exercise-card">
          <div class="exercise-row">
            <div class="exercise-title">
              <span class="emoji">${emoji}</span>
              <h4>${instans.navn}</h4>
              <div class="inline-actions">
                <button class="inline-btn" data-action="toggle-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="progresjon">+ Progresjon</button>
                <button class="inline-btn" data-action="toggle-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="regresjon">− Regresjon</button>
              </div>
            </div>
            <input class="inline-input" type="number" min="0" value="${instans.dosering.reps || 0}" data-action="edit-field" data-instans-id="${instans.ovelseInstansId}" data-field="reps" />
            <span class="times">×</span>
            <input class="inline-input" type="number" min="0" value="${instans.dosering.sett || 0}" data-action="edit-field" data-instans-id="${instans.ovelseInstansId}" data-field="sett" />
            <button class="expand-btn" data-action="toggle-details" data-instans-id="${instans.ovelseInstansId}" aria-expanded="${detailsOpen}">+</button>
            ${detailsOpen ? `
              <input class="inline-input compact" placeholder="Vekt" value="${sekundar.vekt}" data-action="edit-sekundar" data-instans-id="${instans.ovelseInstansId}" data-field="vekt" />
              <input class="inline-input compact" placeholder="Pause" value="${sekundar.pause}" data-action="edit-sekundar" data-instans-id="${instans.ovelseInstansId}" data-field="pause" />
            ` : ""}
            <div class="actions">
              <button class="action-btn" data-action="move-up" data-instans-id="${instans.ovelseInstansId}" ${index === 0 ? "disabled" : ""}>↑</button>
              <button class="action-btn" data-action="move-down" data-instans-id="${instans.ovelseInstansId}" ${index === hoveddel.ovelser.length - 1 ? "disabled" : ""}>↓</button>
              <button class="action-btn" data-action="remove" data-instans-id="${instans.ovelseInstansId}">Fjern</button>
            </div>
          </div>
          ${altOpen ? `
            <div class="expand">
              ${altOpen === "progresjon" ? renderAlternativer(instans, master || { standardProgresjon: [], standardRegresjon: [] }, "progresjon", "Progresjon") : ""}
              ${altOpen === "regresjon" ? renderAlternativer(instans, master || { standardProgresjon: [], standardRegresjon: [] }, "regresjon", "Regresjon") : ""}
            </div>
          ` : ""}
          ${valgtProgresjon ? `<div class="alt-section compact"><strong>Valgte progresjoner</strong><div class="alt-list">${valgtProgresjon}</div></div>` : ""}
          ${valgtRegresjon ? `<div class="alt-section compact"><strong>Valgte regresjoner</strong><div class="alt-list">${valgtRegresjon}</div></div>` : ""}
        </div>
      `;
    })
    .join("");

  hoveddelListEl.innerHTML = items || "<p class=\"hint\">Ingen øvelser lagt til ennå.</p>";
}

function renderLibrary() {
  const query = normalize(state.search);
  const filtered = state.library.filter((item) => matchesSearch(item, query));

  libraryGridEl.innerHTML = filtered
    .map((item) => {
      const disabled = isInProgram(item.ovelseId);
      return `
        <div class="library-card">
          <div class="emoji">${item.emoji || "💪"}</div>
          <h4>${item.navn}</h4>
          ${item.tagger && item.tagger[0] ? `<span class="tag">${item.tagger[0]}</span>` : ""}
          <button class="add-btn" data-action="add-exercise" data-ovelse-id="${item.ovelseId}" ${disabled ? "disabled" : ""}>Legg til</button>
        </div>
      `;
    })
    .join("");
}

function render() {
  if (!state.program) return;
  programTitleEl.textContent = state.program.tittel || "Program";
  programStatusEl.textContent =
    state.program.status === "klar" ? "Klar" : "Utkast";

  const hoveddel = getHoveddelSection();
  const manglerUtforelse = finnOvelserUtenUtforelse(state.program);
  exportBtn.disabled =
    !hoveddel || hoveddel.ovelser.length === 0 || manglerUtforelse.length > 0;

  const notater = getNotaterSection();
  notaterInputEl.value = notater?.seksjonNotat || "";

  renderProgram();
  renderLibrary();
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function loadSeeds() {
  const [programRes, libraryRes] = await Promise.all([
    fetch(DATA_PATHS.program),
    fetch(DATA_PATHS.library),
  ]);

  if (!programRes.ok || !libraryRes.ok) {
    throw new Error("Kunne ikke laste seed-data.");
  }

  state.program = await programRes.json();
  state.library = await libraryRes.json();
}

async function init() {
  try {
    await loadSeeds();
    render();
  } catch (error) {
    console.error(error);
    showToast("Feil: kunne ikke laste seed-data.");
  }
}

searchInputEl.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderLibrary();
});

exportBtn.addEventListener("click", () => {
  const mangler = finnOvelserUtenUtforelse(state.program);
  if (mangler.length > 0) {
    showToast("Eksport stoppet: utførelse mangler på én eller flere øvelser.");
    return;
  }
  const tittel = (state.program?.tittel || "program")
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/gi, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
  const blob = renderProgramPdf(state.program);
  downloadBlob(blob, `${tittel || "program"}.pdf`);
});

notaterInputEl.addEventListener("input", (event) => {
  const notater = getNotaterSection();
  if (!notater) return;
  notater.seksjonNotat = event.target.value;
});

hoveddelListEl.addEventListener("input", (event) => {
  const target = event.target;
  if (!target.matches("[data-action='edit-field']")) return;
  const instansId = target.dataset.instansId;
  const field = target.dataset.field;
  updateDosering(instansId, field, target.value);
});

hoveddelListEl.addEventListener("click", (event) => {
  const target = event.target;
  const action = target.dataset.action;
  if (!action) return;

  const instansId = target.dataset.instansId;
  if (action === "remove") removeExercise(instansId);
  if (action === "move-up") moveExercise(instansId, -1);
  if (action === "move-down") moveExercise(instansId, 1);
  if (action === "toggle-alt") toggleAltSection(instansId, target.dataset.retning);
  if (action === "toggle-more") toggleShowMore(instansId, target.dataset.retning);
  if (action === "add-alt") openAltPicker(instansId, target.dataset.retning, target.dataset.altId);
  if (action === "alt-cancel") cancelAltPicker();
  if (action === "alt-save") saveAltPicker();
  if (action === "toggle-details") toggleDetails(instansId);
});

hoveddelListEl.addEventListener("change", (event) => {
  const target = event.target;
  const action = target.dataset.action;
  if (action === "alt-preset") {
    if (!state.ui.altPicker) return;
    state.ui.altPicker.narBrukesPreset = target.value;
    render();
  }
});

hoveddelListEl.addEventListener("input", (event) => {
  const target = event.target;
  if (!target.matches("[data-action='edit-alt-field']")) return;
  const instansId = target.dataset.instansId;
  const altIndex = Number(target.dataset.altIndex);
  const field = target.dataset.field;
  const hoveddel = getHoveddelSection();
  const instans = hoveddel.ovelser.find((o) => o.ovelseInstansId === instansId);
  if (!instans || !instans.alternativer || !instans.alternativer[altIndex]) return;
  const alt = instans.alternativer[altIndex];
  alt.dosering = alt.dosering || { doseringstype: "reps_x_sett", reps: 0, sett: 0 };
  if (field === "reps" || field === "sett") {
    alt.dosering[field] = Number(target.value) || 0;
  }
});

hoveddelListEl.addEventListener("input", (event) => {
  const target = event.target;
  if (!target.matches("[data-action='edit-sekundar']")) return;
  const instansId = target.dataset.instansId;
  const field = target.dataset.field;
  updateSekundar(instansId, field, target.value);
});

hoveddelListEl.addEventListener("input", (event) => {
  const target = event.target;
  if (target.dataset.action === "alt-custom") {
    if (!state.ui.altPicker) return;
    state.ui.altPicker.narBrukesEgendefinertTekst = target.value;
  }
});

libraryGridEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!target.matches("[data-action='add-exercise']")) return;
  const ovelseId = target.dataset.ovelseId;
  const master = getMasterById(ovelseId);
  if (!master) return;
  addExercise(master);
});

init();


