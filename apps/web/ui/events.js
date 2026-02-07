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
      if (target.matches("[data-action='edit-sekundar']")) {
        const instansId = target.dataset.instansId;
        const field = target.dataset.field;
        actions.setSekundar(instansId, field, target.value);
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
        const email = String(state.patientEmail || state.program?.pasientEpost || "").trim();
        if (!email) {
          actions.setPatientDetailsOpen(true);
          actions.setPatientEmailError("E-post må fylles inn for å sende");
          window.setTimeout(() => {
            const input = els.programRootEl?.querySelector(
              "[data-action='edit-program-email']"
            );
            if (input) input.focus();
          }, 0);
          return;
        }
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
      if (action === "toggle-more") {
        actions.toggleShowMore(instansId, target.dataset.retning);
      }
      if (action === "add-alt") {
        actions.openAltPicker(instansId, target.dataset.retning, target.dataset.altId);
      }
      if (action === "alt-cancel") actions.cancelAltPicker();
      if (action === "alt-save") actions.saveAltPicker();
      if (action === "toggle-details") actions.toggleDetails(instansId);
    });

    els.programRootEl.addEventListener("keydown", (event) => {
      const target = event.target;
      if (
        target &&
        (target.matches("input, textarea") || target.isContentEditable)
      ) {
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
  }

  if (els.libraryGridEl) {
    els.libraryGridEl.addEventListener("click", (event) => {
      const target = event.target;
      if (!target.matches("[data-action='add-exercise']")) return;
      const ovelseId = target.dataset.ovelseId;
      const master = actions.getMasterById(ovelseId);
      if (!master) return;
      actions.addExercise(master);
    });
  }
}
