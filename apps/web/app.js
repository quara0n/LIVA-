import { renderProgramPdf } from "../../src/pdf/render.js";
import { createProgramActions } from "./state/program.actions.js";

import {
  loadArchive,
  loadDraft,
  saveActiveProgramId,
  saveArchive,
  saveDraft,
} from "./state/program.storage.js";

import { bindEvents } from "./ui/events.js";
import { createRenderer } from "./ui/render.js";

const DATA_PATHS = {
  program: "../../src/data/program.seed.json",
  library: "../../src/data/ovelsesbibliotek.seed.json",
  templates: [
    "../../src/data/templates/tennisalbue.json",
    "../../src/data/templates/achilles_tendinopati.json",
  ],
};

const state = {
  program: null,
  programTemplate: null,
  archive: [],
  library: [],
  templates: [],
  search: "",
  ui: {
    altSectionOpen: {},
    showMore: {},
    altPicker: null,
    detailsOpen: {},
    sekundar: {},
    panelView: "start",
    templateOrigin: null,
    loadOrigin: null,
    startDetailsMode: null,
    startDetailsName: "",
    startDetailsEmail: "",
  },
};

const els = {
  toastEl: document.getElementById("toast"),
  programTitleEl: document.getElementById("program-title"),
  programStatusEl: document.getElementById("program-status"),
  exportBtn: document.getElementById("export-btn"),
  libraryGridEl: document.getElementById("library-grid"),
  searchInputEl: document.getElementById("search-input"),
  programRootEl: document.getElementById("program-root"),
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
  saveArchive,
  loadArchive,
  saveActiveProgramId,
  saveDraft,
  loadDraft,
  render,
  showToast,
});

render.setHelpers(actions);

async function loadSeeds() {
  const templateRequests = DATA_PATHS.templates.map((path) => fetch(path));
  const [programRes, libraryRes, ...templateRes] = await Promise.all([
    fetch(DATA_PATHS.program),
    fetch(DATA_PATHS.library),
    ...templateRequests,
  ]);

  if (
    !programRes.ok ||
    !libraryRes.ok ||
    templateRes.some((res) => !res.ok)
  ) {
    throw new Error("Kunne ikke laste seed-data.");
  }

  const draft = loadDraft();
  state.programTemplate = await programRes.json();
  state.program = draft || null;
  state.library = await libraryRes.json();
  state.templates = await Promise.all(templateRes.map((res) => res.json()));
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


