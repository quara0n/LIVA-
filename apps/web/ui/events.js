export function bindEvents({
  state,
  els,
  actions,
  render,
  showToast,
  renderProgramPdf,
}) {
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

  function buildProgramFilename(program, fallback = "program") {
    return (program?.tittel || fallback)
      .toLowerCase()
      .replace(/[^a-z0-9\-]+/gi, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 48);
  }

  function printPdfBlob(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const popup = window.open(url, "_blank", "noopener");

      if (!popup) {
        URL.revokeObjectURL(url);
        reject(new Error("Kunne ikke åpne print-dialog."));
        return;
      }

      let printed = false;
      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      const printOnce = () => {
        if (printed || popup.closed) return;
        printed = true;
        popup.focus();
        try {
          popup.print();
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          window.setTimeout(cleanup, 1000);
        }
      };

      const startedAt = Date.now();
      const poll = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(poll);
          cleanup();
          return;
        }
        try {
          if (popup.document?.readyState === "complete") {
            window.clearInterval(poll);
            window.setTimeout(printOnce, 400);
            return;
          }
        } catch (_error) {
          // Access can fail for PDF viewer; fall back to time-based print.
        }
        if (Date.now() - startedAt > 3000) {
          window.clearInterval(poll);
          printOnce();
        }
      }, 200);
    });
  }

  function updateStartDetailsConfirmState() {
    if (!els.programRootEl) return;
    if (state.ui.panelView !== "start-details") return;
    const button = els.programRootEl.querySelector(
      "[data-action='start-details-confirm']"
    );
    if (!button) return;
    const purpose = state.ui.startDetailsPurpose || "newProgram";
    const isTemplate = purpose === "template";
    const templateId = state.ui.startDetailsTemplateId || "";
    const useSamePatient = Boolean(state.ui.startDetailsUseSamePatient);
    const existingName = state.patientName || state.program?.pasientNavn || "";
    const name = useSamePatient ? existingName : state.ui.startDetailsName || "";
    const nameOk = Boolean(String(name || "").trim());
    const canConfirm = isTemplate ? nameOk && Boolean(templateId) : nameOk;
    if (canConfirm) {
      button.removeAttribute("disabled");
    } else {
      button.setAttribute("disabled", "disabled");
    }
  }

  function confirmDiscardChanges() {
    if (!state.hasUnsavedChanges) return true;
    return window.confirm(
      "Fortsette uten å lagre?\n\nDu har endringer som ikke er lagret. Hvis du fortsetter, blir de fjernet."
    );
  }

  async function sendProgramEmailWithPdf(emailData, blob, filename) {
    const to = String(emailData?.to || "").trim();
    const subject =
      String(emailData?.subject || "").trim() || "Ditt treningsprogram";
    const message = String(emailData?.message || "").trim();

    if (!to) {
      throw new Error("Fyll inn e-postadresse i feltet Til.");
    }

    const validator = document.createElement("input");
    validator.type = "email";
    validator.value = to;
    if (!validator.checkValidity()) {
      throw new Error("E-postadressen er ugyldig.");
    }

    const file = new File([blob], filename, { type: "application/pdf" });
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        title: subject,
        text: `${message}\n\nTil: ${to}`,
        files: [file],
      });
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(
      to
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      message
    )}`;
    const mailtoLink = document.createElement("a");
    mailtoLink.href = mailtoUrl;
    mailtoLink.rel = "noopener";
    document.body.appendChild(mailtoLink);
    mailtoLink.click();
    mailtoLink.remove();
    downloadBlob(blob, filename);
  }

  if (els.searchInputEl) {
    els.searchInputEl.addEventListener("input", (event) => {
      actions.setSearch(event.target.value);
      render.renderLibrary();
    });
  }

  if (els.exportBtn) {
    els.exportBtn.addEventListener("click", () => {
      const mangler = actions.finnOvelserUtenUtforelse(state.program);
      if (mangler.length > 0) {
        showToast("Eksport stoppet: utførelse mangler på én eller flere øvelser.");
        return;
      }
      const tittel = buildProgramFilename(state.program, "program");
      const blob = renderProgramPdf(state.program);
      downloadBlob(blob, `${tittel || "program"}.pdf`);
    });
  }

  if (els.rehabTemplatesBtn) {
    els.rehabTemplatesBtn.addEventListener("click", () => {
      actions.openRehabTemplates();
    });
  }

  if (els.programRootEl) {
    els.programRootEl.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-action='edit-field']")) {
        const instansId = target.dataset.instansId;
        const field = target.dataset.field;
        actions.updateDosering(instansId, field, target.value);
        return;
      }
      if (target.matches("[data-action='edit-alt-field']")) {
        const instansId = target.dataset.instansId;
        const altIndex = Number(target.dataset.altIndex);
        const field = target.dataset.field;
        actions.updateAltField(instansId, altIndex, field, target.value);
        return;
      }
      if (target.dataset.action === "alt-custom") {
        actions.setAltCustom(target.value);
        return;
      }
      if (target.dataset.action === "edit-program-name") {
        actions.setProgramName(target.value);
        return;
      }
      if (target.dataset.action === "edit-program-email") {
        actions.setProgramEmail(target.value);
        if (state.ui.patientEmailError) {
          actions.setPatientEmailError("");
        }
        return;
      }
      if (target.dataset.action === "edit-program-phone") {
        actions.setProgramPhone(target.value);
        return;
      }
      if (target.dataset.action === "edit-program-diagnosis") {
        actions.setProgramDiagnosis(target.value);
        return;
      }
      if (target.dataset.action === "edit-exercise-instruction") {
        const instansId = target.dataset.instansId;
        if (!instansId) return;
        actions.updateExerciseInstruction(instansId, target.value);
        return;
      }
      if (target.dataset.action === "edit-alt-instruction") {
        const instansId = target.dataset.instansId;
        const altIndex = Number(target.dataset.altIndex);
        if (!instansId || Number.isNaN(altIndex)) return;
        actions.updateAltInstruction(instansId, altIndex, target.value);
        return;
      }
      if (target.dataset.action === "edit-exercise-comment") {
        const instansId = target.dataset.instansId;
        if (!instansId) return;
        actions.updateExerciseComment(instansId, target.value);
        return;
      }
      if (target.dataset.action === "edit-alt-comment") {
        const instansId = target.dataset.instansId;
        const altIndex = Number(target.dataset.altIndex);
        if (!instansId || Number.isNaN(altIndex)) return;
        actions.updateAltComment(instansId, altIndex, target.value);
        return;
      }
      if (target.dataset.action === "edit-phase-goal") {
        const sectionId = target.dataset.sectionId;
        if (!sectionId) return;
        actions.updatePhaseField(sectionId, "phaseGoal", target.value);
        return;
      }
      if (target.dataset.action === "edit-phase-title") {
        const sectionId = target.dataset.sectionId;
        if (!sectionId) return;
        actions.updatePhaseTitle(sectionId, target.value);
        return;
      }
      if (target.dataset.action === "edit-phase-focus") {
        const sectionId = target.dataset.sectionId;
        const index = Number(target.dataset.index);
        if (!sectionId || Number.isNaN(index)) return;
        actions.updatePhaseFocusBullet(sectionId, index, target.value);
        return;
      }
      if (target.dataset.action === "edit-phase-progression") {
        const sectionId = target.dataset.sectionId;
        if (!sectionId) return;
        actions.updatePhaseField(sectionId, "phaseProgressionRule", target.value);
        return;
      }
      if (target.dataset.action === "edit-phase-clinician") {
        const sectionId = target.dataset.sectionId;
        if (!sectionId) return;
        actions.updatePhaseField(sectionId, "phaseClinicianNote", target.value);
        return;
      }
      if (target.dataset.action === "edit-progression-instruction") {
        const instansId = target.dataset.instansId;
        const index = Number(target.dataset.index);
        if (!instansId || Number.isNaN(index)) return;
        actions.updateProgressionInstruction(instansId, index, target.value);
        return;
      }
      if (target.dataset.action === "rehab-search") {
        actions.setRehabSearch(target.value);
        return;
      }
      if (target.dataset.action === "edit-notater") {
        actions.setNotater(target.value);
      }
      if (target.dataset.action === "send-program-to") {
        actions.setSendProgramField("to", target.value);
      }
      if (target.dataset.action === "send-program-subject") {
        actions.setSendProgramField("subject", target.value);
      }
      if (target.dataset.action === "send-program-message") {
        actions.setSendProgramField("message", target.value);
      }
      if (target.dataset.field === "start-name") {
        actions.setStartDetailsName(target.value);
        updateStartDetailsConfirmState();
      }
      if (target.dataset.field === "start-email") {
        actions.setStartDetailsEmail(target.value);
        updateStartDetailsConfirmState();
      }
      if (target.dataset.action === "edit-archive-name") {
        actions.setArchiveEditName(target.value);
      }
      if (target.dataset.action === "edit-archive-email") {
        actions.setArchiveEditEmail(target.value);
      }
    });

    els.programRootEl.addEventListener("change", (event) => {
      const target = event.target;
      const action = target.dataset.action;
      if (action === "alt-preset") {
        actions.setAltPreset(target.value);
      }
      if (action === "toggle-same-patient") {
        actions.setStartDetailsUseSamePatient(target.checked);
      }
    });

    els.programRootEl.addEventListener("click", async (event) => {
      let target = event.target;
      const actionTarget = target.closest("[data-action]");
      const action = actionTarget?.dataset.action;
      if (!action) return;
      target = actionTarget;

      if (action === "open-send-program") {
        if (state.ui.patientEmailError) {
          actions.setPatientEmailError("");
        }
        actions.openSendProgram();
        return;
      }

      if (action === "send-program-cancel") {
        if (target.classList.contains("send-program-modal-backdrop")) {
          actions.closeSendProgram();
          return;
        }
        if (target.closest(".send-program-modal-actions")) {
          actions.closeSendProgram();
          return;
        }
      }

      if (action === "send-program-submit") {
        const mangler = actions.finnOvelserUtenUtforelse(state.program);
        if (mangler.length > 0) {
          showToast("Eksport stoppet: utførelse mangler på én eller flere øvelser.");
          return;
        }
        try {
          const tittel = buildProgramFilename(state.program, "program");
          const filename = `${tittel || "program"}.pdf`;
          const blob = renderProgramPdf(state.program);
          await sendProgramEmailWithPdf(state.ui.sendProgram || {}, blob, filename);
          actions.closeSendProgram();
          showToast("Program sendt på e-post");
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Kunne ikke sende program på e-post.";
          showToast(message || "Kunne ikke sende program på e-post.");
        }
        return;
      }

      if (action === "print-program") {
        const mangler = actions.finnOvelserUtenUtforelse(state.program);
        if (mangler.length > 0) {
          showToast("Eksport stoppet: utførelse mangler på én eller flere øvelser.");
          return;
        }
        try {
          const blob = renderProgramPdf(state.program);
          await printPdfBlob(blob);
        } catch (_error) {
          showToast("Kunne ikke åpne print-dialog.");
        }
        return;
      }

      if (action === "preview-video") {
        const url = target.dataset.videoUrl || "";
        const title = target.dataset.videoTitle || "Forhåndsvis video";
        if (!url) {
          showToast("Videoen er ikke tilgjengelig.");
          return;
        }
        actions.openVideoPreview({ url, title });
        return;
      }

      if (action === "open-inline-video") {
        const videoFilename = actionTarget.dataset.videoFilename || "";
        const videoTitle = actionTarget.dataset.videoTitle || "";
        if (!videoFilename) {
          showToast("Videoen er ikke tilgjengelig.");
          return;
        }
        const resolvedUrl = videoAssetUrl(videoFilename);
        openVideoOverlay({ title: videoTitle, videoUrl: resolvedUrl });
        return;
      }

      if (action === "open-exercise-preview") {
        const instansId = target.dataset.instansId;
        if (!instansId) return;
        const altIndexValue = target.dataset.altIndex;
        actions.openExercisePreview({
          instansId,
          altIndex:
            altIndexValue === undefined ? null : Number(altIndexValue),
        });
        return;
      }

      if (action === "toggle-exercise-preview-other") {
        actions.toggleExercisePreviewOther();
        return;
      }

      if (action === "close-exercise-preview") {
        actions.closeExercisePreview();
        return;
      }

      if (action === "exercise-preview-modal") {
        return;
      }

      if (action === "close-video-preview") {
        if (target.classList.contains("send-program-modal-backdrop")) {
          actions.closeVideoPreview();
          return;
        }
        if (target.closest(".send-program-modal-actions")) {
          actions.closeVideoPreview();
          return;
        }
      }

      if (action === "open-start-details") {
        actions.openStartDetails(target.dataset.mode);
        return;
      }

      if (action === "start-details-cancel") {
        actions.closeStartDetails();
        return;
      }

      if (action === "start-details-confirm") {
        const purpose = state.ui.startDetailsPurpose || "newProgram";
        const name = state.ui.startDetailsName || "";
        const email = state.ui.startDetailsEmail || "";
        if (purpose === "template") {
          const templateId = state.ui.startDetailsTemplateId || "";
          if (!templateId) {
            showToast("Velg en mal.");
            return;
          }
          const useSamePatient = Boolean(state.ui.startDetailsUseSamePatient);
          const existingName = state.patientName || state.program?.pasientNavn || "";
          const existingEmail = state.patientEmail || state.program?.pasientEpost || "";
          const nextName = useSamePatient ? existingName : name;
          const nextEmail = useSamePatient ? existingEmail : email;
          if (!String(nextName || "").trim()) {
            showToast("Navn må fylles ut.");
            return;
          }
          actions.applyTemplate(templateId, { name: nextName, email: nextEmail });
        } else {
          if (!String(name || "").trim()) {
            showToast("Navn må fylles ut.");
            return;
          }
          actions.createProgramFromStart(name, email);
        }
        return;
      }

      if (action === "start-template") {
        if (!confirmDiscardChanges()) return;
        actions.openStartDetails("template");
        return;
      }

      if (action === "close-rehab-templates") {
        actions.closeRehabTemplates();
        return;
      }

      if (action === "rehab-step-back") {
        actions.rehabStepBack();
        return;
      }

      if (action === "select-rehab-template") {
        const templateId = target.dataset.templateId;
        if (!templateId) return;
        actions.selectRehabTemplate(templateId);
        return;
      }

      if (action === "select-rehab-subtype") {
        const subtype = target.dataset.subtype;
        if (!subtype) return;
        actions.selectRehabSubtype(subtype);
        return;
      }

      if (action === "select-rehab-status") {
        const status = target.dataset.status;
        if (!status) return;
        actions.selectRehabStatus(status);
        return;
      }

      if (action === "apply-rehab-template") {
        actions.applyRehabTemplate();
        return;
      }

      if (action === "add-phase") {
        actions.addPhase();
        return;
      }

      if (action === "remove-phase") {
        const sectionId = target.dataset.sectionId;
        if (!sectionId) return;
        actions.removePhase(sectionId);
        return;
      }

      if (action === "set-active-phase") {
        const phaseId = Number(target.dataset.phaseId);
        if (Number.isNaN(phaseId)) return;
        actions.setActivePhase(phaseId);
        return;
      }

      if (action === "set-active-section") {
        const sectionId = target.dataset.sectionId;
        if (!sectionId) return;
        actions.setActiveSection(sectionId);
        return;
      }

      if (action === "add-progression-instruction") {
        const instansId = target.dataset.instansId;
        if (!instansId) return;
        actions.addProgressionInstruction(instansId);
        return;
      }

      if (action === "remove-progression-instruction") {
        const instansId = target.dataset.instansId;
        const index = Number(target.dataset.index);
        if (!instansId || Number.isNaN(index)) return;
        actions.removeProgressionInstruction(instansId, index);
        return;
      }

      if (action === "toggle-progression-criteria") {
        const instansId = target.dataset.instansId;
        if (!instansId) return;
        actions.toggleProgressionCriteriaDropdown(instansId);
        return;
      }

      if (action === "toggle-progression-criteria-option") {
        const instansId = target.dataset.instansId;
        const value = actionTarget.dataset.value || "";
        if (!instansId || !value) return;
        actions.toggleProgressionCriteriaOption(instansId, value);
        return;
      }

      if (action === "close-templates") {
        actions.closeTemplates();
        return;
      }

      if (action === "select-template") {
        const templateId = target.dataset.templateId;
        if (!templateId) {
          showToast("Fant ikke valgt mal.");
          return;
        }
        actions.setStartDetailsTemplateId(templateId);
        return;
      }

      if (action === "apply-template") {
        const templateId = target.dataset.templateId;
        if (!templateId) {
          showToast("Fant ikke valgt mal.");
          return;
        }
        const existingName = state.patientName || state.program?.pasientNavn || "";
        const existingEmail = state.patientEmail || state.program?.pasientEpost || "";
        actions.applyTemplate(templateId, { name: existingName, email: existingEmail });
        return;
      }

      if (action === "load-program") {
        if (!confirmDiscardChanges()) return;
        actions.loadProgram();
        return;
      }

      if (action === "close-load") {
        actions.closeLoad();
        return;
      }

      if (action === "open-archive") {
        const archiveId = target.dataset.archiveId;
        if (!archiveId) {
          showToast("Kunne ikke åpne arkivert program.");
          return;
        }
        if (!confirmDiscardChanges()) return;
        actions.openArchivedProgram(archiveId);
        return;
      }

      if (action === "edit-archive") {
        const archiveId = target.dataset.archiveId;
        if (!archiveId) {
          showToast("Kunne ikke redigere arkivert program.");
          return;
        }
        actions.openArchiveEdit(archiveId);
        return;
      }

      if (action === "save-archive-edit") {
        actions.saveArchiveEdit();
        return;
      }

      if (action === "cancel-archive-edit") {
        actions.cancelArchiveEdit();
        return;
      }

      if (action === "pdf-archive") {
        const archiveId = target.dataset.archiveId;
        if (!archiveId) {
          showToast("Kunne ikke eksportere PDF.");
          return;
        }
        const entry = Array.isArray(state.archive)
          ? state.archive.find((item) => item.id === archiveId)
          : null;
        if (!entry || !entry.content) {
          showToast("Kunne ikke eksportere PDF.");
          return;
        }
        try {
          const tittel = buildProgramFilename(
            entry.content,
            entry.patientName || "program"
          );
          const blob = renderProgramPdf(entry.content);
          downloadBlob(blob, `${tittel || "program"}.pdf`);
        } catch (_error) {
          showToast("Kunne ikke eksportere PDF.");
        }
        return;
      }

      if (action === "save-program") {
        actions.saveProgram();
        return;
      }

      if (action === "start-new-program") {
        if (!confirmDiscardChanges()) return;
        actions.openStartDetails("newProgram");
        return;
      }

      if (action === "toggle-patient-details") {
        actions.setPatientDetailsOpen(!state.ui.patientDetailsOpen);
        return;
      }

      const instansId = target.dataset.instansId;
      if (action === "remove") actions.removeExercise(instansId);
      if (action === "move-up") actions.moveExercise(instansId, -1);
      if (action === "move-down") actions.moveExercise(instansId, 1);
      if (action === "toggle-alt") {
        actions.toggleAltSection(instansId, target.dataset.retning);
      }
      if (action === "add-alt") {
        actions.openAltPicker(instansId, target.dataset.retning, target.dataset.altId);
      }
      if (action === "alt-cancel") actions.cancelAltPicker();
      if (action === "alt-save") actions.saveAltPicker();
      if (action === "toggle-details") actions.toggleDetails(instansId);
      if (action === "toggle-alt-details") {
        const altIndex = Number(target.dataset.altIndex);
        actions.toggleAltDetails(instansId, altIndex);
      }
      if (action === "remove-alt") {
        const altIndex = Number(target.dataset.altIndex);
        actions.removeAlt(instansId, altIndex);
      }
      if (action === "toggle-alt-criteria") {
        const altIndex = Number(target.dataset.altIndex);
        if (Number.isNaN(altIndex)) return;
        actions.toggleAltCriteriaPanel(instansId, altIndex);
      }
    });

    els.programRootEl.addEventListener("keydown", (event) => {
      const target = event.target;
      if (
        target &&
        (target.matches("input, textarea") || target.isContentEditable)
      ) {
        return;
      }
      if (event.key === "Escape" && state.ui.exercisePreview?.isOpen) {
        actions.closeExercisePreview();
        return;
      }
      if (
        target?.dataset?.action === "toggle-patient-details" &&
        (event.key === "Enter" || event.key === " ")
      ) {
        event.preventDefault();
        actions.setPatientDetailsOpen(!state.ui.patientDetailsOpen);
        return;
      }
      if (event.key !== "Enter") return;
      if (
        target.dataset.field === "start-name" ||
        target.dataset.field === "start-email"
      ) {
        event.preventDefault();
        const purpose = state.ui.startDetailsPurpose || "newProgram";
        const name = state.ui.startDetailsName || "";
        const email = state.ui.startDetailsEmail || "";
        if (purpose === "template") {
          const templateId = state.ui.startDetailsTemplateId || "";
          if (!templateId) {
            showToast("Velg en mal.");
            return;
          }
          const useSamePatient = Boolean(state.ui.startDetailsUseSamePatient);
          const existingName = state.patientName || state.program?.pasientNavn || "";
          const existingEmail = state.patientEmail || state.program?.pasientEpost || "";
          const nextName = useSamePatient ? existingName : name;
          const nextEmail = useSamePatient ? existingEmail : email;
          if (!String(nextName || "").trim()) {
            showToast("Navn må fylles ut.");
            return;
          }
          actions.applyTemplate(templateId, { name: nextName, email: nextEmail });
        } else {
          if (!String(name || "").trim()) {
            showToast("Navn må fylles ut.");
            return;
          }
          actions.createProgramFromStart(name, email);
        }
      }
    });

    els.programRootEl.addEventListener(
      "error",
      (event) => {
        const target = event.target;
        if (
          target?.dataset?.action === "video-preview-player" ||
          target?.dataset?.videoRole === "inline"
        ) {
          showToast("Kunne ikke laste video.");
        }
      },
      true
    );
  }

  const videoAssetUrl = (file) =>
    new URL(`public/videos/${file}`, document.baseURI).toString();
  let overlayKeyHandler = null;

  function closeVideoOverlay() {
    const existing = document.getElementById("video-overlay");
    if (!existing) return;
    const video = existing.querySelector("video");
    if (video) {
      try {
        video.pause();
        video.currentTime = 0;
      } catch (_error) {
        // ignore
      }
    }
    existing.remove();
    if (overlayKeyHandler) {
      document.removeEventListener("keydown", overlayKeyHandler);
      overlayKeyHandler = null;
    }
  }

  function openVideoOverlay({ title, videoUrl }) {
    if (!videoUrl) {
      showToast("Videoen er ikke tilgjengelig.");
      return;
    }
    closeVideoOverlay();

    const overlay = document.createElement("div");
    overlay.id = "video-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "9999";

    const backdrop = document.createElement("div");
    backdrop.style.position = "absolute";
    backdrop.style.inset = "0";
    backdrop.style.background = "rgba(0,0,0,0.35)";

    const panel = document.createElement("div");
    panel.style.position = "absolute";
    panel.style.left = "50%";
    panel.style.top = "50%";
    panel.style.transform = "translate(-50%, -50%)";
    panel.style.width = "min(90vw, 720px)";
    panel.style.background = "#fff";
    panel.style.border = "1px solid var(--border)";
    panel.style.borderRadius = "14px";
    panel.style.boxShadow = "var(--shadow)";
    panel.style.padding = "12px";
    panel.style.display = "grid";
    panel.style.gap = "10px";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.gap = "8px";

    const heading = document.createElement("strong");
    heading.textContent = title || "Forhåndsvis video";

    const closeBtn = document.createElement("button");
    closeBtn.className = "action-btn";
    closeBtn.type = "button";
    closeBtn.textContent = "X Lukk";
    closeBtn.addEventListener("click", closeVideoOverlay);

    const video = document.createElement("video");
    video.setAttribute("controls", "");
    video.setAttribute("preload", "metadata");
    video.setAttribute("playsinline", "");
    video.style.width = "100%";
    video.style.aspectRatio = "16 / 9";
    video.src = videoUrl;
    video.load();
    console.log("[video] src =", videoUrl);

    const errorText = document.createElement("div");
    errorText.className = "hint";
    errorText.textContent = "Video ikke tilgjengelig.";
    errorText.style.display = "none";

    video.addEventListener("error", () => {
      errorText.style.display = "block";
    });

    header.appendChild(heading);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    panel.appendChild(video);
    panel.appendChild(errorText);
    overlay.appendChild(backdrop);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    backdrop.addEventListener("click", closeVideoOverlay);

    try {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch (_error) {
      // ignore autoplay failures, user can press play
    }

    overlayKeyHandler = (event) => {
      if (event.key === "Escape") {
        closeVideoOverlay();
      }
    };
    document.addEventListener("keydown", overlayKeyHandler);
  }

  if (els.libraryGridEl) {
    els.libraryGridEl.addEventListener("input", (event) => {
      const target = event.target;
      if (target.dataset.action === "alt-custom") {
        actions.setAltCustom(target.value);
      }
    });

    els.libraryGridEl.addEventListener("change", (event) => {
      const target = event.target;
      if (target.dataset.action === "alt-preset") {
        actions.setAltPreset(target.value);
      }
    });

    els.libraryGridEl.addEventListener("click", (event) => {
      const target = event.target;
      const actionTarget = target.closest("[data-action]");
      const action = actionTarget?.dataset.action;
      if (!action) return;

      if (action === "add-exercise") {
        const ovelseId = actionTarget.dataset.ovelseId;
        const master = actions.getMasterById(ovelseId);
        if (!master) return;
        actions.addExercise(master);
        return;
      }

      if (action === "add-alt") {
        const instansId = actionTarget.dataset.instansId;
        const retning = actionTarget.dataset.retning;
        const altId = actionTarget.dataset.altId;
        if (!instansId || !retning || !altId) return;
        actions.openAltPicker(instansId, retning, altId);
        return;
      }

      if (action === "cancel-library-selection") {
        actions.cancelLibrarySelection();
        return;
      }

      if (action === "alt-cancel") {
        actions.cancelAltPicker();
        return;
      }

      if (action === "alt-save") {
        actions.saveAltPicker();
        return;
      }

      if (action === "toggle-alt-preset-dropdown") {
        actions.toggleAltPresetDropdown();
        return;
      }

      if (action === "toggle-alt-preset-option") {
        const value = actionTarget.dataset.value || "";
        actions.toggleAltPresetOption(value);
        return;
      }

      if (action === "toggle-alt-custom-enabled") {
        actions.toggleAltCustomEnabled();
        return;
      }

      if (action === "open-inline-video") {
        const videoFilename = actionTarget.dataset.videoFilename || "";
        const videoTitle = actionTarget.dataset.videoTitle || "";
        if (!videoFilename) {
          showToast("Videoen er ikke tilgjengelig.");
          return;
        }
        const resolvedUrl = videoAssetUrl(videoFilename);
        openVideoOverlay({ title: videoTitle, videoUrl: resolvedUrl });
        return;
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (!state.ui.altPicker?.dropdownOpen) return;
    const target = event.target;
    if (target?.closest?.("[data-role='alt-multiselect']")) return;
    actions.closeAltPresetDropdown();
  });

  document.addEventListener("click", (event) => {
    if (!state.ui.progressionCriteriaOpen) return;
    const target = event.target;
    if (target?.closest?.("[data-role='progression-criteria']")) return;
    actions.closeProgressionCriteriaDropdown();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.ui.exercisePreview?.isOpen) return;
    if (state.ui.rehabOverlay?.isOpen) {
      actions.closeRehabTemplates();
      return;
    }
    if (state.ui.altPicker?.dropdownOpen) {
      actions.closeAltPresetDropdown();
      return;
    }
    if (state.ui.librarySelection) {
      actions.cancelLibrarySelection();
    }
  });
}
