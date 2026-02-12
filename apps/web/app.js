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

function buildRehabProgramPayload({
  templateId,
  templateName,
  subtype,
  subtypeLabel,
  status,
  statusLabel,
}) {
  const title = `${templateName} – ${subtypeLabel} – ${statusLabel}`;
  return {
    title,
    meta: {
      rehabTemplate: true,
      rehabTemplateId: templateId,
      rehabSubtype: subtype,
      rehabStatus: status,
      rehabLabel: title,
    },
    sections: [
      {
        title: "Fase 0",
        phaseGoal: "Dempe smerte og etablere trygg belastning.",
        phaseFocusBullets: ["Kontrollert tempo", "Tåle lett belastning"],
        phaseProgressionRule: "24t-respons uten forverring",
        phaseClinicianNote: "",
        exercises: [
          {
            name: "Isometrisk tåhev",
            execution: "Hold topposisjon i rolig tempo.",
            dosage: { reps: 5, sett: 3 },
          },
        ],
      },
      {
        title: "Fase 1",
        phaseGoal: "Bygge grunnstyrke i sene.",
        phaseFocusBullets: ["Toleranse for økt volum"],
        phaseProgressionRule: "Smerte ≤ 3/10",
        phaseClinicianNote: "",
        exercises: [
          {
            name: "Tåhev på ett ben",
            execution: "Kontrollert opp og ned.",
            dosage: { reps: 8, sett: 3 },
          },
        ],
      },
      {
        title: "Fase 2",
        phaseGoal: "Øke kapasitet og eksentrisk kontroll.",
        phaseFocusBullets: ["Eksentrisk fokus", "Jevn progresjon"],
        phaseProgressionRule: "24t-respons stabil",
        phaseClinicianNote: "",
        exercises: [
          {
            name: "Eksentrisk tåhev",
            execution: "Senk rolig ned på ett ben.",
            dosage: { reps: 6, sett: 4 },
          },
        ],
      },
      {
        title: "Fase 3",
        phaseGoal: "Returnere til høyere belastning.",
        phaseFocusBullets: ["Kontrollert kraftutvikling"],
        phaseProgressionRule: "Smertefri respons",
        phaseClinicianNote: "",
        exercises: [
          {
            name: "Hopp/plyometrisk belastning",
            execution: "Lett belastning, fokus på kontroll.",
            dosage: { reps: 10, sett: 2 },
          },
        ],
      },
    ],
  };
}

const REHAB_TEMPLATES = [
  {
    id: "achilles_tendinopathy",
    name: "Achilles tendinopati",
    variants: {
      midportion: {
        label: "Midportion",
        statuses: {
          acute: {
            label: "Akutt",
            programPayload: buildRehabProgramPayload({
              templateId: "achilles_tendinopathy",
              templateName: "Achilles",
              subtype: "midportion",
              subtypeLabel: "Midportion",
              status: "acute",
              statusLabel: "Akutt",
            }),
          },
          chronic: {
            label: "Kronisk",
            programPayload: buildRehabProgramPayload({
              templateId: "achilles_tendinopathy",
              templateName: "Achilles",
              subtype: "midportion",
              subtypeLabel: "Midportion",
              status: "chronic",
              statusLabel: "Kronisk",
            }),
          },
        },
      },
      insertional: {
        label: "Insertional",
        statuses: {
          acute: {
            label: "Akutt",
            programPayload: buildRehabProgramPayload({
              templateId: "achilles_tendinopathy",
              templateName: "Achilles",
              subtype: "insertional",
              subtypeLabel: "Insertional",
              status: "acute",
              statusLabel: "Akutt",
            }),
          },
          chronic: {
            label: "Kronisk",
            programPayload: buildRehabProgramPayload({
              templateId: "achilles_tendinopathy",
              templateName: "Achilles",
              subtype: "insertional",
              subtypeLabel: "Insertional",
              status: "chronic",
              statusLabel: "Kronisk",
            }),
          },
        },
      },
    },
  },
];

const state = {
  program: null,
  programTemplate: null,
  archive: [],
  library: [],
  templates: [],
  rehabTemplates: REHAB_TEMPLATES,
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
    altCriteriaOpen: {},
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
    activeSectionId: "",
    activePhaseId: null,
    progressionCriteriaOpen: null,
    rehabOverlay: {
      isOpen: false,
      step: 1,
      search: "",
      selectedTemplateId: "",
      selectedSubtype: "",
      selectedStatus: "",
    },
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
  rehabTemplatesBtn: document.getElementById("rehab-templates-btn"),
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
  state.ui.activeSectionId =
    draft?.seksjoner?.find((seksjon) => seksjon.aktiv && seksjon.type !== "notater")
      ?.seksjonId || "";
  const hasPhases =
    draft?.seksjoner?.some((seksjon) => Number.isFinite(seksjon.phaseId)) ||
    draft?.seksjoner?.some((seksjon) => /^Fase\s*\d+/i.test(seksjon.tittel || ""));
  state.ui.activePhaseId =
    draft?.meta?.rehabTemplate && hasPhases ? 0 : state.ui.activePhaseId;
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


