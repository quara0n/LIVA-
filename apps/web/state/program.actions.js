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
    if (!hoveddel) return false;
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
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
  }

  function removeExercise(instansId) {
    const hoveddel = getHoveddelSection();
    hoveddel.ovelser = hoveddel.ovelser.filter(
      (o) => o.ovelseInstansId !== instansId
    );
    delete state.ui.altSectionOpen[instansId];
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
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
    markUnsavedChanges();
    saveDraft(state.program);
    render.full();
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
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function toggleAltSection(instansId, retning) {
    if (!retning) return;
    state.ui.altSectionOpen[instansId] =
      state.ui.altSectionOpen[instansId] === retning ? null : retning;
    render.full();
  }

  function toggleDetails(instansId) {
    state.ui.detailsOpen[instansId] = !state.ui.detailsOpen[instansId];
    render.full();
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
    render.full();
  }

  function openAltPicker(instansId, retning, ovelseId) {
    state.ui.altPicker = {
      instansId,
      retning,
      ovelseId,
      narBrukesPreset: "Når smerte og funksjon er akseptabel",
      narBrukesEgendefinertTekst: "",
    };
    render.full();
  }

  function cancelAltPicker() {
    state.ui.altPicker = null;
    render.full();
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
    const instans = hoveddel.ovelser.find(
      (o) => o.ovelseInstansId === picker.instansId
    );
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
    state.ui.altPicker.narBrukesPreset = value;
    render.full();
  }

  function updateAltField(instansId, altIndex, field, value) {
    const hoveddel = getHoveddelSection();
    const instans = hoveddel.ovelser.find((o) => o.ovelseInstansId === instansId);
    if (!instans || !instans.alternativer || !instans.alternativer[altIndex]) return;
    const alt = instans.alternativer[altIndex];
    alt.dosering = alt.dosering || { doseringstype: "reps_x_sett", reps: 0, sett: 0 };
    if (field === "reps" || field === "sett") {
      alt.dosering[field] = Number(value) || 0;
    }
    markUnsavedChanges();
    saveDraft(state.program);
  }

  function setSekundar(instansId, field, value) {
    updateSekundar(instansId, field, value);
  }

  function setAltCustom(value) {
    if (!state.ui.altPicker) return;
    state.ui.altPicker.narBrukesEgendefinertTekst = value;
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
    state.ui.detailsOpen = {};
    state.ui.sekundar = {};
    state.ui.nameError = "";
    state.ui.startDetailsPurpose = null;
    state.ui.startDetailsName = "";
    state.ui.startDetailsEmail = "";
    state.ui.startDetailsUseSamePatient = false;
    state.ui.startDetailsTemplateId = "";
    state.ui.patientDetailsOpen = false;
    state.ui.patientEmailError = "";
    state.ui.archiveEditId = null;
    state.ui.archiveEditName = "";
    state.ui.archiveEditEmail = "";
    state.ui.archiveEditError = "";
    state.ui.sendProgram = {
      isOpen: false,
      to: "",
      subject: SEND_PROGRAM_DEFAULT_SUBJECT,
      message: SEND_PROGRAM_DEFAULT_MESSAGE,
    };
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
    getMasterById,
    isInProgram,
    normalize,
    matchesSearch,
    finnOvelserUtenUtforelse,
    addExercise,
    removeExercise,
    moveExercise,
    updateDosering,
    toggleAltSection,
    toggleDetails,
    toggleShowMore,
    openAltPicker,
    cancelAltPicker,
    saveAltPicker,
    setSearch,
    setNotater,
    setAltPreset,
    updateAltField,
    setSekundar,
    setAltCustom,
    setProgramName,
    setProgramEmail,
    setProgramPhone,
    setProgramDiagnosis,
    saveProgram,
    startNewProgram,
    loadProgram,
    createProgramFromStart,
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
  };
}
