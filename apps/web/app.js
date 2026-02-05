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
  startPatientNameInputEl: document.getElementById("start-patient-name-input"),
  startPatientEmailInputEl: document.getElementById("start-patient-email-input"),
  confirmCreateProgramBtn: document.getElementById("confirm-create-program-btn"),
  programStartStateEl: document.getElementById("program-startstate"),
  programBuilderEl: document.getElementById("program-builder"),
  programPatientHeaderEl: document.getElementById("program-patient-header"),
  programPatientNameEl: document.getElementById("program-patient-name"),
  programPatientEmailEl: document.getElementById("program-patient-email"),
  libraryGridEl: document.getElementById("library-grid"),
  searchInputEl: document.getElementById("search-input"),
};

function showToast(message) {
  els.toastEl.textContent = message;
  els.toastEl.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    els.toastEl.classList.remove("show");
  }, 2000);
}

async function loadSeeds() {
  const [programRes, libraryRes] = await Promise.all([
    fetch(DATA_PATHS.program),
    fetch(DATA_PATHS.library),
  ]);

  if (!programRes.ok || !libraryRes.ok) {
    throw new Error("Kunne ikke laste seed-data.");
  }

  state.programTemplate = await programRes.json();
  state.library = await libraryRes.json();
  state.program = loadDraft();
}

async function init() {
  try {
    await loadSeeds();

    let renderer;
    const actions = createProgramActions({
      state,
      saveDraft,
      render: {
        full: () => renderer.full(),
      },
      showToast,
    });

    renderer = createRenderer({
      state,
      els,
      helpers: actions,
    });

    bindEvents({
      state,
      els,
      actions,
      render: renderer,
      showToast,
      renderProgramPdf,
    });

    renderer.full();
  } catch (error) {
    console.error(error);
    showToast("Feil: kunne ikke laste seed-data.");
  }
}

init();
