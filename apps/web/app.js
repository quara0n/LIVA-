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
  videos: "../../src/data/videos.manifest.json",
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
  patientName: "",
  patientEmail: "",
  patientPhone: "",
  patientDiagnosis: "",
  hasUnsavedChanges: false,
  ui: {
    altSectionOpen: {},
    showMore: {},
    altPicker: null,
    librarySelection: null,
    detailsOpen: {},
    altDetailsOpen: {},
    panelView: "start",
    templateOrigin: null,
    loadOrigin: null,
    startDetailsPurpose: null,
    startDetailsName: "",
    startDetailsEmail: "",
    startDetailsUseSamePatient: false,
    startDetailsTemplateId: "",
    patientDetailsOpen: false,
    patientEmailError: "",
    archiveEditId: null,
    archiveEditName: "",
    archiveEditEmail: "",
    archiveEditError: "",
    videoManifest: null,
    videoPreview: {
      isOpen: false,
      url: "",
      title: "",
    },
    exercisePreview: {
      isOpen: false,
      instansId: "",
      altIndex: null,
      otherOpen: false,
    },
    sendProgram: {
      isOpen: false,
      to: "",
      subject: "Ditt treningsprogram",
      message:
        "Hei,\n\nHer er treningsprogrammet vi har laget sammen.\n\nTa kontakt hvis du har spørsmål.\n\nVennlig hilsen",
    },
  },
};

const els = {
  toastEl: document.getElementById("toast"),
  programTitleEl: document.getElementById("program-title"),
  programStatusEl: document.getElementById("program-status"),
  libraryPanelEl: document.getElementById("library-panel"),
  libraryTitleEl: document.getElementById("library-title"),
  libraryContextEl: document.getElementById("library-context"),
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
  let videoManifest = null;

  if (
    !programRes.ok ||
    !libraryRes.ok ||
    templateRes.some((res) => !res.ok)
  ) {
    throw new Error("Kunne ikke laste seed-data.");
  }
  try {
    const videoRes = await fetch(DATA_PATHS.videos);
    if (videoRes.ok) {
      videoManifest = await videoRes.json();
    }
  } catch (_error) {
    videoManifest = null;
  }

  const draft = loadDraft();
  state.programTemplate = await programRes.json();
  state.program = draft || null;
  state.patientName = draft?.pasientNavn || "";
  state.patientEmail = draft?.pasientEpost || "";
  state.patientPhone = draft?.pasientTelefon || "";
  state.patientDiagnosis = draft?.pasientDiagnose || "";
  state.hasUnsavedChanges = false;
  state.library = await libraryRes.json();
  state.templates = await Promise.all(templateRes.map((res) => res.json()));
  state.ui.videoManifest = videoManifest;
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


