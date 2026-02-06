export function bindEvents({ state, els, actions, render, showToast, renderProgramPdf }) {
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
      const tittel = (state.program?.tittel || "program")
        .toLowerCase()
        .replace(/[^a-z0-9\-]+/gi, "-")
        .replace(/(^-|-$)+/g, "")
        .slice(0, 48);
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
      if (target.dataset.action === "edit-notater") {
        actions.setNotater(target.value);
      }
      if (target.dataset.field === "start-name") {
        actions.setStartDetailsName(target.value);
      }
      if (target.dataset.field === "start-email") {
        actions.setStartDetailsEmail(target.value);
      }
    });

    els.programRootEl.addEventListener("change", (event) => {
      const target = event.target;
      const action = target.dataset.action;
      if (action === "alt-preset") {
        actions.setAltPreset(target.value);
      }
    });

    els.programRootEl.addEventListener("click", (event) => {
      const target = event.target;
      const action = target.dataset.action;
      if (!action) return;

      if (action === "open-start-details") {
        actions.openStartDetails(target.dataset.mode);
        return;
      }

      if (action === "start-details-cancel") {
        actions.closeStartDetails();
        return;
      }

      if (action === "start-details-confirm") {
        const mode = state.ui.startDetailsMode || "new";
        const name = state.ui.startDetailsName || "";
        const email = state.ui.startDetailsEmail || "";
        if (mode === "template") {
          actions.openTemplates();
        } else {
          actions.createProgramFromStart(name, email);
        }
        return;
      }

      if (action === "start-template") {
        actions.openTemplates();
        return;
      }

      if (action === "close-templates") {
        actions.closeTemplates();
        return;
      }

      if (action === "apply-template") {
        const templateId = target.dataset.templateId;
        if (!templateId) {
          showToast("Fant ikke valgt mal.");
          return;
        }
        if (state.ui.templateOrigin === "builder" && state.program) {
          const confirmed = window.confirm(
            "Erstatt nåværende program med valgt mal?"
          );
          if (!confirmed) return;
        }
        if (state.ui.startDetailsMode === "template") {
          actions.setStartDetailsName(state.ui.startDetailsName || "");
          actions.setStartDetailsEmail(state.ui.startDetailsEmail || "");
        }
        actions.applyTemplate(templateId);
        return;
      }

      if (action === "load-program") {
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
        actions.openArchivedProgram(archiveId);
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
          const tittel = (entry.content?.tittel || entry.patientName || "program")
            .toLowerCase()
            .replace(/[^a-z0-9\-]+/gi, "-")
            .replace(/(^-|-$)+/g, "")
            .slice(0, 48);
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
        actions.startNewProgram();
        return;
      }

      const instansId = target.dataset.instansId;
      if (action === "remove") actions.removeExercise(instansId);
      if (action === "move-up") actions.moveExercise(instansId, -1);
      if (action === "move-down") actions.moveExercise(instansId, 1);
      if (action === "toggle-alt") actions.toggleAltSection(instansId, target.dataset.retning);
      if (action === "toggle-more") actions.toggleShowMore(instansId, target.dataset.retning);
      if (action === "add-alt") actions.openAltPicker(instansId, target.dataset.retning, target.dataset.altId);
      if (action === "alt-cancel") actions.cancelAltPicker();
      if (action === "alt-save") actions.saveAltPicker();
      if (action === "toggle-details") actions.toggleDetails(instansId);
    });

    els.programRootEl.addEventListener("keydown", (event) => {
      const target = event.target;
      if (event.key !== "Enter") return;
      if (target.dataset.field === "start-name" || target.dataset.field === "start-email") {
        event.preventDefault();
        const mode = state.ui.startDetailsMode || "new";
        const name = state.ui.startDetailsName || "";
        const email = state.ui.startDetailsEmail || "";
        if (mode === "template") {
          actions.openTemplates();
        } else {
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
