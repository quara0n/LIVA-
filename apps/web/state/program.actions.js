export function createProgramActions({
  state,
  saveArchive,
  loadArchive,
  saveActiveProgramId,
  saveDraft,
  render,
  showToast,
}) {
  function makeId(prefix) {
    if (crypto && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function setHasUnsavedChanges(value) {
    state.hasUnsavedChanges = Boolean(value);
  }

  function markUnsavedChanges() {
    state.hasUnsavedChanges = true;
  }

  const SEND_PROGRAM_DEFAULT_SUBJECT = "Ditt treningsprogram";
  const SEND_PROGRAM_DEFAULT_MESSAGE =
    "Hei,\n\nHer er treningsprogrammet vi har laget sammen.\n\nTa kontakt hvis du har spørsmål.\n\nVennlig hilsen";

  function createEmptyDraft() {
    const template = state.programTemplate;
    const baseSections =
      template?.seksjoner && template.seksjoner.length > 0
        ? template.seksjoner
        : [
            {
              seksjonId: "seksjon-hoveddel",
              type: "hovedovelser",
              tittel: "Hoveddel",
              aktiv: true,
              rekkefolge: 1,
              ovelser: [],
            },
            {
              seksjonId: "seksjon-notater",
              type: "notater",
              tittel: "Notater til pasient",
              aktiv: true,
              rekkefolge: 2,
              seksjonNotat: "",
              ovelser: [],
            },
          ];
    const createdAt = nowIso();
    return {
      ...(template || {
        tittel: "Program",
        status: "utkast",
        seksjoner: baseSections,
      }),
      programId: makeId("program"),
      status: "utkast",
      opprettetTid: createdAt,
      oppdatertTid: createdAt,
      pasientNavn: "",
      pasientEpost: "",
      pasientTelefon: "",
      pasientDiagnose: "",
      archiveId: null,
      seksjoner: baseSections.map((seksjon) => ({
        ...seksjon,
        ovelser: [],
        ...(seksjon.type === "notater" ? { seksjonNotat: "" } : {}),
      })),
    };
  }

  function getSection(type) {
    if (!state.program) return null;
    return state.program.seksjoner.find((s) => s.type === type);
  }

  function parsePhaseId(title) {
    const match = String(title || "").match(/Fase\s*(\d+)/i);
    if (!match) return null;
    const value = Number(match[1]);
    if (!Number.isFinite(value) || value < 0 || value > 3) return null;
    return value;
  }

  function isRehabTemplateProgram() {
    return Boolean(state.program?.meta?.rehabTemplate);
  }

  function getPhaseSections() {
    if (!state.program) return [];
    const baseSections = (state.program.seksjoner || []).filter(
      (seksjon) => seksjon.aktiv && seksjon.type !== "notater"
    );
    const hasPhase =
      baseSections.some((seksjon) => Number.isFinite(seksjon.phaseId)) ||
      baseSections.some((seksjon) => parsePhaseId(seksjon.tittel) !== null);
    if (!hasPhase) return [];
    const phaseSections = baseSections
      .map((seksjon) => {
        const phaseId = Number.isFinite(seksjon.phaseId)
          ? Number(seksjon.phaseId)
          : parsePhaseId(seksjon.tittel);
        return phaseId === null ? null : { seksjon, phaseId };
      })
      .filter(Boolean)
      .sort((a, b) => a.phaseId - b.phaseId);
    if (!isRehabTemplateProgram()) return phaseSections;
    return phaseSections.filter((phase) => phase.phaseId >= 1 && phase.phaseId <= 3);
  }

  function getHoveddelSection() {
    return getActiveExerciseSection();
  }

  function getNotaterSection() {
    return getSection("notater");
  }

  function getExerciseSections() {
    if (!state.program) return [];
    return (state.program.seksjoner || []).filter(
      (seksjon) => seksjon.aktiv && seksjon.type !== "notater"
    );
  }

  function getActiveExerciseSection() {
    const phaseSections = getPhaseSections();
    if (phaseSections.length > 0) {
      const activePhaseId =
        Number.isFinite(state.ui.activePhaseId)
          ? Number(state.ui.activePhaseId)
          : phaseSections[0].phaseId;
      const active = phaseSections.find((phase) => phase.phaseId === activePhaseId);
      if (active) {
        state.ui.activePhaseId = active.phaseId;
        return active.seksjon;
      }
      state.ui.activePhaseId = phaseSections[0].phaseId;
      return phaseSections[0].seksjon;
    }

    const sections = getExerciseSections();
    if (sections.length === 0) return null;
    const activeId = state.ui.activeSectionId;
    const active = sections.find((seksjon) => seksjon.seksjonId === activeId);
    if (active) return active;
    state.ui.activeSectionId = sections[0].seksjonId;
    return sections[0];
  }

  function setActiveSection(seksjonId) {
    if (!seksjonId) return;
    const sections = getExerciseSections();
    if (!sections.some((seksjon) => seksjon.seksjonId === seksjonId)) return;
    state.ui.activeSectionId = seksjonId;
    render.full();
  }

  function setActivePhase(phaseId) {
    const next = Number(phaseId);
    if (!Number.isFinite(next)) return;
    const phases = getPhaseSections();
    if (phases.length === 0) return;
    if (!phases.some((phase) => phase.phaseId === next)) return;
    state.ui.activePhaseId = next;
    render.full();
  }

  function getExerciseContext(instansId) {
    if (!state.program || !instansId) return null;
    for (const seksjon of state.program.seksjoner || []) {
      const index = (seksjon.ovelser || []).findIndex(
        (ovelse) => ovelse.ovelseInstansId === instansId
      );
      if (index >= 0) {
        return {
          seksjon,
          exercise: seksjon.ovelser[index],
          exerciseIndex: index,
        };
      }
    }
    return null;
  }

  function getMasterById(id) {
    return state.library.find((item) => item.ovelseId === id);
  }

  function isInProgram(ovelseId) {
    const sections = getExerciseSections();
    if (sections.length === 0) return false;
    return sections.some((seksjon) =>
      (seksjon.ovelser || []).some((ovelse) => ovelse.ovelseId === ovelseId)
    );
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
    const hoveddel = getActiveExerciseSection();
    if (!hoveddel) {
      showToast("Fant ingen aktiv seksjon.");
      return;
    }
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
      progressionInstructions: [],
      progressionInstructionCriteriaIds: [],
      alternativer: [],
    };

    hoveddel.ovelser.push(instans);
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function removeExercise(instansId) {
    const context = getExerciseContext(instansId);
    if (!context) return;
    context.seksjon.ovelser = context.seksjon.ovelser.filter(
      (o) => o.ovelseInstansId !== instansId
    );
    if (state.ui.librarySelection?.instansId === instansId) {
      state.ui.librarySelection = null;
      state.ui.altPicker = null;
    }
    delete state.ui.altSectionOpen[instansId];
    delete state.ui.detailsOpen[instansId];
    delete state.ui.altDetailsOpen[instansId];
    delete state.ui.altCriteriaOpen[instansId];
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function moveExercise(instansId, direction) {
    const context = getExerciseContext(instansId);
    if (!context) return;
    const hoveddel = context.seksjon;
    const index = context.exerciseIndex;
    if (index < 0) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= hoveddel.ovelser.length) return;
    const clone = [...hoveddel.ovelser];
    const [item] = clone.splice(index, 1);
    clone.splice(nextIndex, 0, item);
    hoveddel.ovelser = clone;
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function updateDosering(instansId, field, value) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans) return;
    if (field === "reps" || field === "sett") {
      instans.dosering[field] = Number(value) || 0;
    } else if (field === "vekt") {
      instans.dosering.belastningKg = Number(value) || 0;
    } else if (field === "tid") {
      instans.dosering.varighetSek = Number(value) || 0;
    } else if (field === "kommentar") {
      instans.kommentar = value;
    }
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function toggleAltSection(instansId, retning) {
    if (!retning) return;
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans) return;
    if (
      state.ui.librarySelection &&
      state.ui.librarySelection.instansId === instansId &&
      state.ui.librarySelection.retning === retning
    ) {
      state.ui.librarySelection = null;
      state.ui.altPicker = null;
      render.full();
      return;
    }
    state.ui.librarySelection = {
      instansId,
      retning,
      primaryExerciseName: instans.navn || "",
      focusPending: true,
    };
    state.ui.altSectionOpen[instansId] = retning;
    state.ui.altPicker = null;
    render.full();
  }

  function toggleDetails(instansId) {
    state.ui.detailsOpen[instansId] = !state.ui.detailsOpen[instansId];
    render.full();
  }

  function toggleAltDetails(instansId, altIndex) {
    state.ui.altDetailsOpen[instansId] = state.ui.altDetailsOpen[instansId] || {};
    state.ui.altDetailsOpen[instansId][altIndex] =
      !state.ui.altDetailsOpen[instansId][altIndex];
    render.full();
  }

  function toggleAltCriteriaPanel(instansId, altIndex) {
    const current = state.ui.altCriteriaOpen[instansId];
    state.ui.altCriteriaOpen[instansId] = current === altIndex ? null : altIndex;
    render.full();
  }

  function removeAlt(instansId, altIndex) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans || !instans.alternativer || !instans.alternativer[altIndex]) return;
    instans.alternativer.splice(altIndex, 1);
    if (state.ui.altDetailsOpen[instansId]) {
      state.ui.altDetailsOpen[instansId] = {};
    }
    state.ui.altCriteriaOpen[instansId] = null;
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function openAltPicker(instansId, retning, ovelseId) {
    state.ui.altPicker = {
      instansId,
      retning,
      ovelseId,
      narBrukesPresetValg: ["Når smerte og funksjon er akseptabel"],
      dropdownOpen: false,
      brukEgendefinertTekst: false,
      narBrukesEgendefinertTekst: "",
    };
    render.full();
  }

  function cancelAltPicker() {
    state.ui.altPicker = null;
    render.full();
  }

  function cancelLibrarySelection() {
    state.ui.librarySelection = null;
    state.ui.altPicker = null;
    render.full();
  }

  function saveAltPicker() {
    const picker = state.ui.altPicker;
    if (!picker) return;

    const presets = Array.isArray(picker.narBrukesPresetValg)
      ? picker.narBrukesPresetValg.filter(Boolean)
      : [];
    if (presets.length === 0) {
      showToast("Velg minst ett kriterium.");
      return;
    }
    if (
      picker.brukEgendefinertTekst &&
      !picker.narBrukesEgendefinertTekst.trim()
    ) {
      showToast("Skriv en kort egendefinert linje.");
      return;
    }

    const context = getExerciseContext(picker.instansId);
    const instans = context?.exercise;
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
      narBrukesPreset: presets.join("\n"),
      narBrukesEgendefinertTekst:
        picker.brukEgendefinertTekst
          ? picker.narBrukesEgendefinertTekst.trim()
          : undefined,
    });

    state.ui.altPicker = null;
    state.ui.altSectionOpen[picker.instansId] = null;
    state.ui.librarySelection = null;
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function setSearch(value) {
    state.search = value;
  }

  function setNotater(value) {
    if (!state.program) return;
    const notater = getNotaterSection();
    if (!notater) return;
    notater.seksjonNotat = value;
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function setAltPreset(value) {
    if (!state.ui.altPicker) return;
    state.ui.altPicker.narBrukesPresetValg = value
      ? String(value)
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    render.full();
  }

  function updateAltField(instansId, altIndex, field, value) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans || !instans.alternativer || !instans.alternativer[altIndex]) return;
    const alt = instans.alternativer[altIndex];
    alt.dosering = alt.dosering || { doseringstype: "reps_x_sett", reps: 0, sett: 0 };
    if (field === "reps" || field === "sett") {
      alt.dosering[field] = Number(value) || 0;
    } else if (field === "vekt") {
      alt.dosering.belastningKg = Number(value) || 0;
    } else if (field === "tid") {
      alt.dosering.varighetSek = Number(value) || 0;
    }
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function setAltCustom(value) {
    if (!state.ui.altPicker) return;
    state.ui.altPicker.narBrukesEgendefinertTekst = value;
  }

  function toggleAltPresetDropdown() {
    if (!state.ui.altPicker) return;
    state.ui.altPicker.dropdownOpen = !state.ui.altPicker.dropdownOpen;
    render.full();
  }

  function closeAltPresetDropdown() {
    if (!state.ui.altPicker || !state.ui.altPicker.dropdownOpen) return;
    state.ui.altPicker.dropdownOpen = false;
    render.full();
  }

  function toggleAltPresetOption(value) {
    if (!state.ui.altPicker || !value) return;
    const current = Array.isArray(state.ui.altPicker.narBrukesPresetValg)
      ? [...state.ui.altPicker.narBrukesPresetValg]
      : [];
    const index = current.indexOf(value);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    state.ui.altPicker.narBrukesPresetValg = current;
    render.full();
  }

  function toggleAltCustomEnabled() {
    if (!state.ui.altPicker) return;
    state.ui.altPicker.brukEgendefinertTekst =
      !state.ui.altPicker.brukEgendefinertTekst;
    if (!state.ui.altPicker.brukEgendefinertTekst) {
      state.ui.altPicker.narBrukesEgendefinertTekst = "";
    }
    render.full();
  }

  function setProgramName(value) {
    if (!state.program) return;
    state.program.pasientNavn = value;
    state.patientName = state.program.pasientNavn || "";
    markUnsavedChanges();
    if (state.ui.nameError) {
      state.ui.nameError = "";
      render.full();
    }
    saveDraft(state.program);
  }

  function setProgramEmail(value) {
    if (!state.program) return;
    state.program.pasientEpost = value;
    state.patientEmail = state.program.pasientEpost || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function setProgramPhone(value) {
    if (!state.program) return;
    state.program.pasientTelefon = value || "";
    state.patientPhone = state.program.pasientTelefon || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function setProgramDiagnosis(value) {
    if (!state.program) return;
    state.program.pasientDiagnose = value || "";
    state.patientDiagnosis = state.program.pasientDiagnose || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function saveProgram() {
    if (!state.program) return;
    const name = String(state.program.pasientNavn || "").trim();
    if (!name) {
      state.ui.nameError = "Navn må fylles ut.";
      render.full();
      return;
    }

    state.ui.nameError = "";
    const now = nowIso();
    const archive = Array.isArray(state.archive) ? [...state.archive] : [];
    const archiveId = state.program.archiveId;
    const content = { ...state.program };

    if (!archiveId) {
      const newId = makeId("archive");
      archive.push({
        id: newId,
        patientName: name,
        email: state.program.pasientEpost || "",
        createdAt: now,
        updatedAt: now,
        content,
      });
      state.program.archiveId = newId;
      saveActiveProgramId(newId);
    } else {
      const index = archive.findIndex((item) => item.id === archiveId);
      if (index >= 0) {
        archive[index] = {
          ...archive[index],
          patientName: name,
          email: state.program.pasientEpost || "",
          updatedAt: now,
          content,
        };
      } else {
        archive.push({
          id: archiveId,
          patientName: name,
          email: state.program.pasientEpost || "",
          createdAt: now,
          updatedAt: now,
          content,
        });
      }
      saveActiveProgramId(archiveId);
    }

    state.archive = archive;
    saveArchive(archive);
    saveDraft(state.program);
    setHasUnsavedChanges(false);
    showToast("Program lagret.");
    render.full();
  }

  function startNewProgram() {
    resetUiState();
    state.program = createEmptyDraft();
    getActiveExerciseSection();
    state.patientName = "";
    state.patientEmail = "";
    state.patientPhone = "";
    state.patientDiagnosis = "";
    setHasUnsavedChanges(false);
    state.ui.panelView = "builder";
    saveDraft(state.program);
    render.full();
  }

  function loadProgram() {
    const archive = typeof loadArchive === "function" ? loadArchive() : [];
    state.archive = Array.isArray(archive) ? archive : [];
    state.ui.loadOrigin =
      state.ui.panelView || (state.program ? "builder" : "start");
    state.ui.panelView = "load";
    render.full();
  }

  function closeLoad() {
    const fallback = state.program ? "builder" : "start";
    state.ui.panelView = state.ui.loadOrigin || fallback;
    state.ui.loadOrigin = null;
    render.full();
  }

  function isValidEmail(value) {
    const email = String(value || "").trim();
    if (!email) return true;
    const validator = document.createElement("input");
    validator.type = "email";
    validator.value = email;
    return validator.checkValidity();
  }

  function openArchiveEdit(entryId) {
    const entry = (state.archive || []).find((item) => item.id === entryId);
    if (!entry) return;
    state.ui.archiveEditId = entryId;
    state.ui.archiveEditName = entry.patientName || "";
    state.ui.archiveEditEmail = entry.email || "";
    state.ui.archiveEditError = "";
    render.full();
  }

  function cancelArchiveEdit() {
    state.ui.archiveEditId = null;
    state.ui.archiveEditName = "";
    state.ui.archiveEditEmail = "";
    state.ui.archiveEditError = "";
    render.full();
  }

  function setArchiveEditName(value) {
    state.ui.archiveEditName = value || "";
  }

  function setArchiveEditEmail(value) {
    state.ui.archiveEditEmail = value || "";
  }

  function saveArchiveEdit() {
    const entryId = state.ui.archiveEditId;
    if (!entryId) return;
    const name = String(state.ui.archiveEditName || "").trim();
    const email = String(state.ui.archiveEditEmail || "").trim();
    if (!name) {
      state.ui.archiveEditError = "Pasientnavn må fylles ut.";
      render.full();
      return;
    }
    if (!isValidEmail(email)) {
      state.ui.archiveEditError = "E-post er ugyldig.";
      render.full();
      return;
    }
    const archive = Array.isArray(state.archive) ? [...state.archive] : [];
    const index = archive.findIndex((item) => item.id === entryId);
    if (index < 0) return;
    archive[index] = {
      ...archive[index],
      patientName: name,
      email,
      updatedAt: nowIso(),
    };
    state.archive = archive;
    saveArchive(archive);
    cancelArchiveEdit();
  }

  function resetUiState() {
    state.ui.altSectionOpen = {};
    state.ui.showMore = {};
    state.ui.altPicker = null;
    state.ui.librarySelection = null;
    state.ui.detailsOpen = {};
    state.ui.altDetailsOpen = {};
    state.ui.altCriteriaOpen = {};
    state.ui.nameError = "";
    state.ui.startDetailsPurpose = null;
    state.ui.startDetailsName = "";
    state.ui.startDetailsEmail = "";
    state.ui.startDetailsUseSamePatient = false;
    state.ui.startDetailsTemplateId = "";
    state.ui.patientDetailsOpen = false;
    state.ui.patientEmailError = "";
    state.ui.activeSectionId = "";
    state.ui.activePhaseId = null;
    state.ui.progressionCriteriaOpen = null;
    state.ui.rehabOverlay = {
      isOpen: false,
      step: 1,
      search: "",
      selectedTemplateId: "",
      selectedSubtype: "",
      selectedStatus: "",
      focusSearch: false,
    };
    state.ui.archiveEditId = null;
    state.ui.archiveEditName = "";
    state.ui.archiveEditEmail = "";
    state.ui.archiveEditError = "";
    state.ui.videoPreview = {
      isOpen: false,
      url: "",
      title: "",
    };
    state.ui.exercisePreview = {
      isOpen: false,
      instansId: "",
      altIndex: null,
      otherOpen: false,
    };
    state.ui.sendProgram = {
      isOpen: false,
      to: "",
      subject: SEND_PROGRAM_DEFAULT_SUBJECT,
      message: SEND_PROGRAM_DEFAULT_MESSAGE,
    };
  }

  function openVideoPreview(payload) {
    if (!payload || !payload.url) return;
    state.ui.videoPreview = {
      isOpen: true,
      url: payload.url,
      title: payload.title || "Forhåndsvis video",
    };
    render.full();
  }

  function closeVideoPreview() {
    if (!state.ui.videoPreview) return;
    state.ui.videoPreview.isOpen = false;
    render.full();
  }

  function openExercisePreview(payload) {
    if (!payload || !payload.instansId) return;
    const altIndex = Number.isFinite(payload.altIndex) ? Number(payload.altIndex) : null;
    const context = getExerciseContext(payload.instansId);
    const instans = context?.exercise;
    let commentText = "";
    if (instans) {
      if (Number.isFinite(altIndex)) {
        commentText = instans.alternativer?.[altIndex]?.kommentar || "";
      } else {
        commentText = instans.kommentar || "";
      }
    }
    state.ui.exercisePreview = {
      isOpen: true,
      instansId: payload.instansId,
      altIndex,
      otherOpen: Boolean(String(commentText || "").trim()),
    };
    render.full();
  }

  function closeExercisePreview() {
    if (!state.ui.exercisePreview) return;
    state.ui.exercisePreview.isOpen = false;
    render.full();
  }

  function toggleExercisePreviewOther() {
    if (!state.ui.exercisePreview) return;
    state.ui.exercisePreview.otherOpen = !state.ui.exercisePreview.otherOpen;
    render.full();
  }

  function updateExerciseInstruction(instansId, value) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans) return;
    instans.utforelse = value || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function normalizePhaseOrder(sections) {
    const exerciseSections = sections.filter(
      (seksjon) => seksjon.type !== "notater" && seksjon.aktiv
    );
    exerciseSections.forEach((seksjon, index) => {
      seksjon.phaseId = index;
      if (!String(seksjon.tittel || "").trim()) {
        seksjon.tittel = `Fase ${index}`;
      }
      seksjon.rekkefolge = index + 1;
    });
    const notater = sections.find((seksjon) => seksjon.type === "notater");
    if (notater) {
      notater.rekkefolge = exerciseSections.length + 1;
    }
  }

  function addPhase() {
    if (!state.program) return;
    if (isRehabTemplateProgram()) return;
    const sections = state.program.seksjoner || [];
    const exerciseSections = sections.filter(
      (seksjon) => seksjon.aktiv && seksjon.type !== "notater"
    );
    if (exerciseSections.length === 0) {
      const newSection = {
        seksjonId: makeId("seksjon"),
        type: "hovedovelser",
        tittel: "Fase 0",
        aktiv: true,
        rekkefolge: 1,
        phaseId: 0,
        phaseGoal: "",
        phaseFocusBullets: [],
        phaseProgressionRule: "",
        phaseClinicianNote: "",
        ovelser: [],
      };
      const notater = sections.find((seksjon) => seksjon.type === "notater");
      state.program.seksjoner = notater
        ? [newSection, notater]
        : [newSection];
      state.ui.activePhaseId = 0;
      markUnsavedChanges();
      saveDraft(state.program);
      render.full();
      return;
    }

    exerciseSections.forEach((seksjon, index) => {
      seksjon.phaseId = Number.isFinite(seksjon.phaseId)
        ? seksjon.phaseId
        : index;
    });

    const nextPhaseId =
      exerciseSections.reduce(
        (max, seksjon) =>
          Math.max(max, Number.isFinite(seksjon.phaseId) ? seksjon.phaseId : -1),
        -1
      ) + 1;
    const newSection = {
      seksjonId: makeId("seksjon"),
      type: "hovedovelser",
      tittel: `Fase ${nextPhaseId}`,
      aktiv: true,
      rekkefolge: nextPhaseId + 1,
      phaseId: nextPhaseId,
      phaseGoal: "",
      phaseFocusBullets: [],
      phaseProgressionRule: "",
      phaseClinicianNote: "",
      ovelser: [],
    };

    const notaterIndex = sections.findIndex((seksjon) => seksjon.type === "notater");
    if (notaterIndex >= 0) {
      state.program.seksjoner = [
        ...sections.slice(0, notaterIndex),
        newSection,
        ...sections.slice(notaterIndex),
      ];
    } else {
      state.program.seksjoner = [...sections, newSection];
    }
    normalizePhaseOrder(state.program.seksjoner);
    state.ui.activePhaseId = newSection.phaseId;
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function removePhase(seksjonId) {
    if (!state.program) return;
    if (isRehabTemplateProgram()) return;
    const sections = state.program.seksjoner || [];
    const exerciseSections = sections.filter(
      (seksjon) => seksjon.aktiv && seksjon.type !== "notater"
    );
    if (exerciseSections.length <= 1) return;
    state.program.seksjoner = sections.filter(
      (seksjon) => seksjon.seksjonId !== seksjonId
    );
    normalizePhaseOrder(state.program.seksjoner);
    const phases = getPhaseSections();
    if (phases.length > 0) {
      const stillExists = phases.some(
        (phase) => phase.phaseId === state.ui.activePhaseId
      );
      if (!stillExists) {
        state.ui.activePhaseId = phases[0].phaseId;
      }
    } else {
      state.ui.activePhaseId = null;
    }
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function updateAltInstruction(instansId, altIndex, value) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans || !instans.alternativer || !instans.alternativer[altIndex]) return;
    instans.alternativer[altIndex].utforelse = value || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function updateExerciseComment(instansId, value) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans) return;
    instans.kommentar = value || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function updateAltComment(instansId, altIndex, value) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans || !instans.alternativer || !instans.alternativer[altIndex]) return;
    instans.alternativer[altIndex].kommentar = value || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function updatePhaseField(seksjonId, field, value) {
    if (!state.program) return;
    const seksjon = state.program.seksjoner.find(
      (item) => item.seksjonId === seksjonId
    );
    if (!seksjon) return;
    if (
      ![
        "phaseGoal",
        "phaseProgressionRule",
        "phaseClinicianNote",
      ].includes(field)
    ) {
      return;
    }
    seksjon[field] = value || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function updatePhaseTitle(seksjonId, value) {
    if (!state.program) return;
    const seksjon = state.program.seksjoner.find(
      (item) => item.seksjonId === seksjonId
    );
    if (!seksjon) return;
    seksjon.tittel = value || "";
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function updatePhaseFocusBullet(seksjonId, index, value) {
    if (!state.program) return;
    const seksjon = state.program.seksjoner.find(
      (item) => item.seksjonId === seksjonId
    );
    if (!seksjon) return;
    const bullets = Array.isArray(seksjon.phaseFocusBullets)
      ? [...seksjon.phaseFocusBullets]
      : [];
    while (bullets.length <= index) {
      bullets.push("");
    }
    bullets[index] = value || "";
    seksjon.phaseFocusBullets = bullets;
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function addProgressionInstruction(instansId) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans) return;
    instans.progressionInstructions = Array.isArray(instans.progressionInstructions)
      ? instans.progressionInstructions
      : [];
    instans.progressionInstructions.push("");
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function updateProgressionInstruction(instansId, index, value) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans) return;
    const list = Array.isArray(instans.progressionInstructions)
      ? instans.progressionInstructions
      : [];
    if (!list[index] && list.length <= index) {
      while (list.length <= index) list.push("");
    }
    list[index] = value || "";
    instans.progressionInstructions = list;
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function removeProgressionInstruction(instansId, index) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans) return;
    const list = Array.isArray(instans.progressionInstructions)
      ? [...instans.progressionInstructions]
      : [];
    if (index < 0 || index >= list.length) return;
    list.splice(index, 1);
    instans.progressionInstructions = list;
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function toggleProgressionCriteriaDropdown(instansId) {
    if (!instansId) return;
    state.ui.progressionCriteriaOpen =
      state.ui.progressionCriteriaOpen === instansId ? null : instansId;
    render.full();
  }

  function closeProgressionCriteriaDropdown() {
    if (!state.ui.progressionCriteriaOpen) return;
    state.ui.progressionCriteriaOpen = null;
    render.full();
  }

  function toggleProgressionCriteriaOption(instansId, value) {
    const context = getExerciseContext(instansId);
    const instans = context?.exercise;
    if (!instans || !value) return;
    const current = Array.isArray(instans.progressionInstructionCriteriaIds)
      ? [...instans.progressionInstructionCriteriaIds]
      : [];
    const index = current.indexOf(value);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(value);
    }
    instans.progressionInstructionCriteriaIds = current;
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function openSendProgram() {
    const pasientEpost = String(state.program?.pasientEpost || "").trim();
    state.ui.sendProgram = {
      isOpen: true,
      to: pasientEpost,
      subject: SEND_PROGRAM_DEFAULT_SUBJECT,
      message: SEND_PROGRAM_DEFAULT_MESSAGE,
    };
    render.full();
  }

  function closeSendProgram() {
    if (!state.ui.sendProgram) return;
    state.ui.sendProgram.isOpen = false;
    render.full();
  }

  function setSendProgramField(field, value) {
    if (!state.ui.sendProgram) {
      state.ui.sendProgram = {
        isOpen: false,
        to: "",
        subject: SEND_PROGRAM_DEFAULT_SUBJECT,
        message: SEND_PROGRAM_DEFAULT_MESSAGE,
      };
    }
    if (!["to", "subject", "message"].includes(field)) return;
    state.ui.sendProgram[field] = value || "";
  }

  function createProgramFromStart(pasientNavn, pasientEpost) {
    resetUiState();
    state.program = createEmptyDraft();
    getActiveExerciseSection();
    state.program.pasientNavn = (pasientNavn || "").trim();
    state.program.pasientEpost = (pasientEpost || "").trim();
    state.program.pasientTelefon = "";
    state.program.pasientDiagnose = "";
    state.patientName = state.program.pasientNavn || "";
    state.patientEmail = state.program.pasientEpost || "";
    state.patientPhone = state.program.pasientTelefon || "";
    state.patientDiagnosis = state.program.pasientDiagnose || "";
    setHasUnsavedChanges(false);
    state.ui.panelView = "builder";
    saveDraft(state.program);
    render.full();
  }

  function isProgramEmpty(program) {
    if (!program) return true;
    const sections = (program.seksjoner || []).filter(
      (seksjon) => seksjon.aktiv && seksjon.type !== "notater"
    );
    return sections.every((seksjon) => (seksjon.ovelser || []).length === 0);
  }

  function openRehabTemplates() {
    state.ui.rehabOverlay = {
      isOpen: true,
      step: 1,
      search: "",
      selectedTemplateId: "",
      selectedSubtype: "",
      selectedStatus: "",
      focusSearch: true,
    };
    render.full();
  }

  function closeRehabTemplates() {
    if (!state.ui.rehabOverlay) return;
    state.ui.rehabOverlay.isOpen = false;
    state.ui.rehabOverlay.step = 1;
    state.ui.rehabOverlay.search = "";
    state.ui.rehabOverlay.selectedTemplateId = "";
    state.ui.rehabOverlay.selectedSubtype = "";
    state.ui.rehabOverlay.selectedStatus = "";
    state.ui.rehabOverlay.focusSearch = false;
    render.full();
  }

  function setRehabSearch(value) {
    if (!state.ui.rehabOverlay) return;
    state.ui.rehabOverlay.search = value || "";
    state.ui.rehabOverlay.focusSearch = true;
    render.full();
  }

  function selectRehabTemplate(templateId) {
    if (!state.ui.rehabOverlay) return;
    state.ui.rehabOverlay.selectedTemplateId = templateId || "";
    state.ui.rehabOverlay.selectedSubtype = "";
    state.ui.rehabOverlay.selectedStatus = "";
    state.ui.rehabOverlay.step = 2;
    render.full();
  }

  function selectRehabSubtype(subtype) {
    if (!state.ui.rehabOverlay) return;
    state.ui.rehabOverlay.selectedSubtype = subtype || "";
    state.ui.rehabOverlay.selectedStatus = "";
    state.ui.rehabOverlay.step = 3;
    render.full();
  }

  function selectRehabStatus(status) {
    if (!state.ui.rehabOverlay) return;
    state.ui.rehabOverlay.selectedStatus = status || "";
    state.ui.rehabOverlay.step = 4;
    render.full();
  }

  function rehabStepBack() {
    if (!state.ui.rehabOverlay) return;
    const step = Number(state.ui.rehabOverlay.step) || 1;
    if (step <= 1) return;
    if (step === 4) {
      state.ui.rehabOverlay.selectedStatus = "";
    } else if (step === 3) {
      state.ui.rehabOverlay.selectedSubtype = "";
      state.ui.rehabOverlay.selectedStatus = "";
    } else if (step === 2) {
      state.ui.rehabOverlay.selectedTemplateId = "";
      state.ui.rehabOverlay.selectedSubtype = "";
      state.ui.rehabOverlay.selectedStatus = "";
    }
    state.ui.rehabOverlay.step = step - 1;
    state.ui.rehabOverlay.focusSearch = true;
    render.full();
  }

  function applyRehabTemplate() {
    const overlay = state.ui.rehabOverlay;
    if (!overlay) return;
    const templates = Array.isArray(state.rehabTemplates) ? state.rehabTemplates : [];
    const template = templates.find((item) => item.id === overlay.selectedTemplateId);
    const variant = template?.variants?.[overlay.selectedSubtype];
    const statusEntry = variant?.statuses?.[overlay.selectedStatus];
    const payload = statusEntry?.programPayload;
    if (!template || !variant || !payload) {
      showToast("Fant ikke valgt rehab-mal.");
      return;
    }

    if (!isProgramEmpty(state.program)) {
      const confirmed = window.confirm(
        "Dette vil erstatte eksisterende program. Fortsette?"
      );
      if (!confirmed) return;
    }

    const draft = createEmptyDraft();
    draft.tittel = payload.title || draft.tittel;
    draft.meta = payload.meta || {
      rehabTemplate: true,
      rehabTemplateId: template.id,
      rehabSubtype: overlay.selectedSubtype,
      rehabStatus: overlay.selectedStatus,
    };

    const phaseSections = (payload.sections || []).map((section, index) => {
      const titlePhaseId = parsePhaseId(section.title);
      const phaseId = Number.isFinite(titlePhaseId) ? titlePhaseId : index + 1;
      return {
      seksjonId: makeId("seksjon"),
      type: "hovedovelser",
      tittel: section.title || `Fase ${phaseId}`,
      aktiv: true,
      rekkefolge: index + 1,
      phaseId,
      phaseGoal: section.phaseGoal || "",
      phaseFocusBullets: Array.isArray(section.phaseFocusBullets)
        ? [...section.phaseFocusBullets]
        : [],
      phaseProgressionRule: section.phaseProgressionRule || "",
      phaseClinicianNote: section.phaseClinicianNote || "",
      ovelser: (section.exercises || []).map((exercise) => ({
        ovelseInstansId: makeId("instans"),
        ovelseId: exercise.exerciseId || makeId("rehab-ovelse"),
        navn: exercise.name || "Øvelse",
        utforelse: exercise.execution || "",
        dosering: {
          doseringstype: "reps_x_sett",
          reps: Number(exercise.dosage?.reps) || 0,
          sett: Number(exercise.dosage?.sett) || 0,
          belastningKg: Number(exercise.dosage?.belastningKg) || 0,
          varighetSek: Number(exercise.dosage?.varighetSek) || 0,
        },
        kommentar: "",
        progressionInstructions: Array.isArray(exercise.progressionInstructions)
          ? [...exercise.progressionInstructions]
          : [],
        progressionInstructionCriteriaIds: Array.isArray(
          exercise.progressionInstructionCriteriaIds
        )
          ? [...exercise.progressionInstructionCriteriaIds]
          : [],
        alternativer: [],
      })),
    };
    });

    const notater = draft.seksjoner.find((seksjon) => seksjon.type === "notater");
    if (notater) {
      notater.rekkefolge = phaseSections.length + 1;
    }
    draft.seksjoner = [...phaseSections, ...(notater ? [notater] : [])];

    const existingName = state.program?.pasientNavn || state.patientName || "";
    const existingEmail = state.program?.pasientEpost || state.patientEmail || "";
    const existingPhone = state.program?.pasientTelefon || state.patientPhone || "";
    const existingDiagnosis =
      state.program?.pasientDiagnose || state.patientDiagnosis || "";

    resetUiState();
    state.program = draft;
    getActiveExerciseSection();
    state.ui.activePhaseId = 1;
    state.program.pasientNavn = existingName;
    state.program.pasientEpost = existingEmail;
    state.program.pasientTelefon = existingPhone;
    state.program.pasientDiagnose = existingDiagnosis;
    state.patientName = existingName || "";
    state.patientEmail = existingEmail || "";
    state.patientPhone = existingPhone || "";
    state.patientDiagnosis = existingDiagnosis || "";
    state.ui.panelView = "builder";
    setHasUnsavedChanges(false);
    saveDraft(state.program);
    render.full();
  }

  function openTemplates() {
    state.ui.templateOrigin =
      state.ui.panelView || (state.program ? "builder" : "start");
    state.ui.panelView = "templates";
    render.full();
  }

  function closeTemplates() {
    const fallback = state.program ? "builder" : "start";
    state.ui.panelView = state.ui.templateOrigin || fallback;
    state.ui.templateOrigin = null;
    render.full();
  }

  function openStartDetails(purpose) {
    const nextPurpose = purpose === "template" ? "template" : "newProgram";
    const hasExistingPatient = Boolean(state.patientName || state.program?.pasientNavn);
    state.ui.startDetailsPurpose = nextPurpose;
    state.ui.panelView = "start-details";
    state.ui.startDetailsUseSamePatient = nextPurpose === "template" && hasExistingPatient;
    state.ui.startDetailsTemplateId = "";
    state.ui.startDetailsName = "";
    state.ui.startDetailsEmail = "";
    render.full();
  }

  function closeStartDetails() {
    state.ui.panelView = "start";
    state.ui.startDetailsPurpose = null;
    state.ui.startDetailsName = "";
    state.ui.startDetailsEmail = "";
    state.ui.startDetailsUseSamePatient = false;
    state.ui.startDetailsTemplateId = "";
    render.full();
  }

  function setStartDetailsName(value) {
    state.ui.startDetailsName = value || "";
  }

  function setStartDetailsEmail(value) {
    state.ui.startDetailsEmail = value || "";
  }

  function setPatientDetailsOpen(value) {
    state.ui.patientDetailsOpen = Boolean(value);
    render.full();
  }

  function setPatientEmailError(message) {
    state.ui.patientEmailError = message || "";
    render.full();
  }

  function setStartDetailsUseSamePatient(value) {
    state.ui.startDetailsUseSamePatient = Boolean(value);
    render.full();
  }

  function setStartDetailsTemplateId(value) {
    state.ui.startDetailsTemplateId = value || "";
    render.full();
  }

  function normalizeTemplateDosage(dosage) {
    return {
      doseringstype: dosage?.doseringstype || "reps_x_sett",
      reps: Number(dosage?.reps) || 0,
      sett: Number(dosage?.sett) || 0,
    };
  }

  function mapTemplateAlternatives(items, retning) {
    return (items || [])
      .map((item) => {
        const master = getMasterById(item.exerciseId);
        if (!master) return null;
        return {
          retning,
          ovelseId: item.exerciseId,
          navn: master.navn,
          tagger: master.tagger || [],
          utforelse: item.executionText || master.utforelseTekst || "",
          dosering: normalizeTemplateDosage(item.dosage),
          narBrukesPreset: "Når smerte og funksjon er akseptabel",
        };
      })
      .filter(Boolean);
  }

  function applyTemplate(templateId, patientInfo = {}) {
    const templates = Array.isArray(state.templates) ? state.templates : [];
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      showToast("Fant ikke valgt mal.");
      return;
    }

    const draft = createEmptyDraft();
    draft.tittel = template.name || draft.tittel;
    const hoveddel = draft.seksjoner.find((s) => s.type === "hovedovelser");
    if (!hoveddel) {
      showToast("Kunne ikke opprette program fra mal.");
      return;
    }

    hoveddel.ovelser = (template.exercises || [])
      .map((exercise) => {
        const master = getMasterById(exercise.exerciseId);
        if (!master) return null;
        const alternativer = [
          ...mapTemplateAlternatives(exercise.progressions, "progresjon"),
          ...mapTemplateAlternatives(exercise.regressions, "regresjon"),
        ];
        return {
          ovelseInstansId: makeId("instans"),
          ovelseId: exercise.exerciseId,
          navn: master.navn,
          utforelse: exercise.executionText || master.utforelseTekst || "",
          dosering: normalizeTemplateDosage(exercise.dosage),
          kommentar: "",
          alternativer,
        };
      })
      .filter(Boolean);

    const pendingName = patientInfo.name || state.ui.startDetailsName || "";
    const pendingEmail = patientInfo.email || state.ui.startDetailsEmail || "";
    resetUiState();
    state.program = draft;
    getActiveExerciseSection();
    if (pendingName || pendingEmail) {
      state.program.pasientNavn = pendingName.trim();
      state.program.pasientEpost = pendingEmail.trim();
    }
    state.program.pasientTelefon = "";
    state.program.pasientDiagnose = "";
    state.patientName = state.program.pasientNavn || "";
    state.patientEmail = state.program.pasientEpost || "";
    state.patientPhone = state.program.pasientTelefon || "";
    state.patientDiagnosis = state.program.pasientDiagnose || "";
    state.ui.panelView = "builder";
    state.ui.templateOrigin = null;
    setHasUnsavedChanges(false);
    saveDraft(state.program);
    render.full();
  }
  function openArchivedProgram(archivedProgramOrId) {
    try {
      const archive = Array.isArray(state.archive)
        ? state.archive
        : typeof loadArchive === "function"
          ? loadArchive()
          : [];
      const entry =
        typeof archivedProgramOrId === "string"
          ? archive.find((item) => item.id === archivedProgramOrId)
          : archivedProgramOrId;

      if (!entry || !entry.content) {
        showToast("Kunne ikke åpne arkivert program.");
        return;
      }

      let content;
      try {
        content = JSON.parse(JSON.stringify(entry.content));
      } catch (_error) {
        showToast("Kunne ikke åpne arkivert program.");
        return;
      }

      if (!content || !Array.isArray(content.seksjoner)) {
        showToast("Kunne ikke åpne arkivert program.");
        return;
      }

      state.program = content;
      getActiveExerciseSection();
      if (state.program?.meta?.rehabTemplate) {
        state.ui.activePhaseId = 1;
      }
      state.program.archiveId = entry.id || null;
      state.program.pasientNavn = entry.patientName || state.program.pasientNavn || "";
      state.program.pasientEpost = entry.email || state.program.pasientEpost || "";
      state.program.pasientTelefon = state.program.pasientTelefon || "";
      state.program.pasientDiagnose = state.program.pasientDiagnose || "";
      state.patientName = state.program.pasientNavn || "";
      state.patientEmail = state.program.pasientEpost || "";
      state.patientPhone = state.program.pasientTelefon || "";
      state.patientDiagnosis = state.program.pasientDiagnose || "";
      setHasUnsavedChanges(false);
      state.ui.panelView = "builder";
      saveActiveProgramId(state.program.archiveId);
      saveDraft(state.program);
      render.full();
    } catch (_error) {
      showToast("Kunne ikke åpne arkivert program.");
    }
  }

  return {
    getSection,
    getHoveddelSection,
    getNotaterSection,
    getPhaseSections,
    getExerciseSections,
    getExerciseContext,
    getMasterById,
    isInProgram,
    normalize,
    matchesSearch,
    finnOvelserUtenUtforelse,
    addExercise,
    removeExercise,
    removeAlt,
    moveExercise,
    updateDosering,
    toggleAltSection,
    toggleDetails,
    toggleAltDetails,
    toggleAltCriteriaPanel,
    openAltPicker,
    cancelAltPicker,
    cancelLibrarySelection,
    saveAltPicker,
    setSearch,
    setNotater,
    setAltPreset,
    updateAltField,
    setAltCustom,
    toggleAltPresetDropdown,
    closeAltPresetDropdown,
    toggleAltPresetOption,
    toggleAltCustomEnabled,
    setProgramName,
    setProgramEmail,
    setProgramPhone,
    setProgramDiagnosis,
    saveProgram,
    startNewProgram,
    loadProgram,
    createProgramFromStart,
    openRehabTemplates,
    closeRehabTemplates,
    setRehabSearch,
    selectRehabTemplate,
    selectRehabSubtype,
    selectRehabStatus,
    rehabStepBack,
    applyRehabTemplate,
    setActivePhase,
    setActiveSection,
    openArchivedProgram,
    openTemplates,
    closeTemplates,
    applyTemplate,
    openStartDetails,
    closeStartDetails,
    setStartDetailsName,
    setStartDetailsEmail,
    setStartDetailsUseSamePatient,
    setStartDetailsTemplateId,
    setPatientDetailsOpen,
    setPatientEmailError,
    closeLoad,
    openArchiveEdit,
    cancelArchiveEdit,
    setArchiveEditName,
    setArchiveEditEmail,
    saveArchiveEdit,
    openSendProgram,
    closeSendProgram,
    setSendProgramField,
    openVideoPreview,
    closeVideoPreview,
    openExercisePreview,
    closeExercisePreview,
    toggleExercisePreviewOther,
    updateExerciseInstruction,
    updateAltInstruction,
    updateExerciseComment,
    updateAltComment,
    updatePhaseField,
    updatePhaseTitle,
    updatePhaseFocusBullet,
    addPhase,
    removePhase,
    addProgressionInstruction,
    updateProgressionInstruction,
    removeProgressionInstruction,
    toggleProgressionCriteriaDropdown,
    closeProgressionCriteriaDropdown,
    toggleProgressionCriteriaOption,
  };
}
