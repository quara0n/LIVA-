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

  if (els.notaterInputEl) {
    els.notaterInputEl.addEventListener("input", (event) => {
      actions.setNotater(event.target.value);
    });
  }

  if (els.hoveddelListEl) {
    els.hoveddelListEl.addEventListener("input", (event) => {
      const target = event.target;
      if (!target.matches("[data-action='edit-field']")) return;
      const instansId = target.dataset.instansId;
      const field = target.dataset.field;
      actions.updateDosering(instansId, field, target.value);
    });

    els.hoveddelListEl.addEventListener("click", (event) => {
      const target = event.target;
      const action = target.dataset.action;
      if (!action) return;

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

    els.hoveddelListEl.addEventListener("change", (event) => {
      const target = event.target;
      const action = target.dataset.action;
      if (action === "alt-preset") {
        actions.setAltPreset(target.value);
      }
    });

    els.hoveddelListEl.addEventListener("input", (event) => {
      const target = event.target;
      if (!target.matches("[data-action='edit-alt-field']")) return;
      const instansId = target.dataset.instansId;
      const altIndex = Number(target.dataset.altIndex);
      const field = target.dataset.field;
      actions.updateAltField(instansId, altIndex, field, target.value);
    });

    els.hoveddelListEl.addEventListener("input", (event) => {
      const target = event.target;
      if (!target.matches("[data-action='edit-sekundar']")) return;
      const instansId = target.dataset.instansId;
      const field = target.dataset.field;
      actions.setSekundar(instansId, field, target.value);
    });

    els.hoveddelListEl.addEventListener("input", (event) => {
      const target = event.target;
      if (target.dataset.action === "alt-custom") {
        actions.setAltCustom(target.value);
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

  if (
    els.confirmCreateProgramBtn &&
    els.startPatientNameInputEl &&
    els.startPatientEmailInputEl
  ) {
    function confirmCreateProgram() {
      actions.createProgramFromStart(
        els.startPatientNameInputEl.value,
        els.startPatientEmailInputEl.value
      );
      els.startPatientNameInputEl.value = "";
      els.startPatientEmailInputEl.value = "";
    }

    els.confirmCreateProgramBtn.addEventListener("click", confirmCreateProgram);

    els.startPatientNameInputEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      confirmCreateProgram();
    });

    els.startPatientEmailInputEl.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      confirmCreateProgram();
    });
  }
}
