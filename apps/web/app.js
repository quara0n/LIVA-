import { renderProgramPdf } from "../../src/pdf/render.js";
import { createProgramActions } from "./state/program.actions.js";
import { loadDraft, saveDraft } from "./state/program.storage.js";
import { bindEvents } from "./ui/events.js";
import { createRenderer } from "./ui/render.js";

const DATA_PATHS = {
  program: "../../src/data/program.seed.json",
  library: "../../src/data/ovelsesbibliotek.seed.json",
};

const state = {
  program: null,
  programTemplate: null,
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

const els = {
  toastEl: document.getElementById("toast"),
  programTitleEl: document.getElementById("program-title"),
  programStatusEl: document.getElementById("program-status"),
  exportBtn: document.getElementById("export-btn"),
  hoveddelListEl: document.getElementById("hoveddel-list"),
  notaterInputEl: document.getElementById("notater-input"),
  libraryGridEl: document.getElementById("library-grid"),
  searchInputEl: document.getElementById("search-input"),
  programStartStateEl: document.getElementById("program-startstate"),
  programBuilderEl: document.getElementById("program-builder"),
  startPatientNameInputEl: document.getElementById("start-patient-name"),
  startPatientEmailInputEl: document.getElementById("start-patient-email"),
  confirmCreateProgramBtn: document.getElementById("confirm-create-program"),
  loadProgramFromStartBtn: document.getElementById("load-program-from-start"),
  programNameInputEl: document.getElementById("program-name-input"),
  saveProgramBtn: document.getElementById("save-program-btn"),
  newProgramBtn: document.getElementById("new-program-btn"),
  loadProgramBtn: document.getElementById("load-program-btn"),
};

function showToast(message) {
  if (!els.toastEl) return;
  els.toastEl.textContent = message;
  els.toastEl.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    els.toastEl.classList.remove("show");
  }, 2000);
}

const render = createRenderer({
  state,
  els,
  helpers: {},
});

const actions = createProgramActions({
  state,
  saveDraft,
  loadDraft,
  render,
  showToast,
});

render.setHelpers(actions);

async function loadSeeds() {
  const [programRes, libraryRes] = await Promise.all([
    fetch(DATA_PATHS.program),
    fetch(DATA_PATHS.library),
  ]);

  if (!programRes.ok || !libraryRes.ok) {
    throw new Error("Kunne ikke laste seed-data.");
  }

  state.programTemplate = await programRes.json();
  const draft = loadDraft();
  state.program = draft || null;
  state.library = await libraryRes.json();
}

async function init() {
  try {
    await loadSeeds();
    bindEvents({
      state,
      els,
      actions,
      render,
      showToast,
      renderProgramPdf,
    });
    render.full();
  } catch (error) {
    console.error(error);
    showToast("Feil: kunne ikke laste seed-data.");
  }
}

init();


