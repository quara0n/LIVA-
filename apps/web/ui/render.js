export function createRenderer({ state, els, helpers: initialHelpers }) {
  let helpers = initialHelpers;

  function setHelpers(nextHelpers) {
    helpers = nextHelpers;
  }

  function renderAltPickerControls(instansId) {
    const picker = state.ui.altPicker;
    if (!picker || picker.instansId !== instansId) return "";

    const preset = picker.narBrukesPreset;
    const egendefinertVisible = preset === "Egendefinert";

    return `
    <select class="select" data-action="alt-preset">
      <option${preset === "Når smerte og funksjon er akseptabel" ? " selected" : ""}>Når smerte og funksjon er akseptabel</option>
      <option${preset === "Når øvelsen kjennes lett og kontrollert" ? " selected" : ""}>Når øvelsen kjennes lett og kontrollert</option>
      <option${preset === "Ved økt smerte eller redusert kontroll" ? " selected" : ""}>Ved økt smerte eller redusert kontroll</option>
      <option${preset === "Ved behov for enklere variant" ? " selected" : ""}>Ved behov for enklere variant</option>
      <option${preset === "Egendefinert" ? " selected" : ""}>Egendefinert</option>
    </select>
    ${egendefinertVisible ? `<input class="inline-input wide" data-action="alt-custom" placeholder="Kort, konkret linje" value="${picker.narBrukesEgendefinertTekst}" />` : ""}
    <button class="action-btn" data-action="alt-save">Lagre</button>
    <button class="action-btn" data-action="alt-cancel">Avbryt</button>
  `;
  }

  function renderAlternativer(instans, master, retning, label) {
    const slugs =
      retning === "progresjon"
        ? master.standardProgresjon || []
        : master.standardRegresjon || [];
    const showMore = state.ui.showMore[instans.ovelseInstansId]?.[retning] || false;
    const visible = showMore ? slugs : slugs.slice(0, 3);
    const hasMoreToggle = slugs.length > 3;

    const existingCount = (instans.alternativer || []).filter(
      (a) => a.retning === retning
    ).length;

    const list = visible
      .map((slug) => {
        const altMaster = helpers.getMasterById(slug);
        if (!altMaster) return "";
        const isPicking =
          state.ui.altPicker &&
          state.ui.altPicker.instansId === instans.ovelseInstansId &&
          state.ui.altPicker.retning === retning &&
          state.ui.altPicker.ovelseId === slug;
        const addDisabled = existingCount >= 3;

        return `
        <div class="alt-item">
          <strong>${altMaster.navn}</strong>
          ${altMaster.tagger && altMaster.tagger[0] ? `<span class="tag">${altMaster.tagger[0]}</span>` : ""}
          <div class="alt-actions">
            <button class="action-btn" data-action="add-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="${retning}" data-alt-id="${slug}" ${addDisabled ? "disabled" : ""}>Legg til</button>
            ${isPicking ? renderAltPickerControls(instans.ovelseInstansId) : ""}
          </div>
        </div>
      `;
      })
      .join("");

    return `
    <div class="alt-section exercise-children">
      <div class="alt-header exercise-children-header">
        <strong>${label}</strong>
        ${hasMoreToggle ? `
          <button class="action-btn" data-action="toggle-more" data-instans-id="${instans.ovelseInstansId}" data-retning="${retning}">
            ${showMore ? "Vis færre" : "Vis flere"}
          </button>
        ` : ""}
      </div>
      <div class="alt-list exercise-children-list">
        ${list || `<span class="tag">Ingen foreslåtte ${label.toLowerCase()}.</span>`}
      </div>
    </div>
  `;
  }

  function renderProgram() {
    const hoveddel = helpers.getHoveddelSection();
    if (!hoveddel || !els.hoveddelListEl) return;

    const items = hoveddel.ovelser
      .map((instans, index) => {
        const master = helpers.getMasterById(instans.ovelseId);
        const emoji = master?.emoji || "🏃";
        const altOpen = state.ui.altSectionOpen[instans.ovelseInstansId] || null;
        const detailsOpen = state.ui.detailsOpen[instans.ovelseInstansId] || false;
        const sekundar = state.ui.sekundar[instans.ovelseInstansId] || {
          vekt: "",
          pause: "",
        };

        const altItems = (instans.alternativer || []).map((alt, altIndex) => {
          const narBrukes = `${alt.narBrukesPreset}${alt.narBrukesEgendefinertTekst ? ": " + alt.narBrukesEgendefinertTekst : ""}`;
          return `
          <div class="alt-item child">
            <strong>${alt.navn}</strong>
            <span class="tag">${alt.retning} · ${narBrukes}</span>
            <div class="alt-meta">
              <span>Dosering</span>
              <input class="inline-input" type="number" min="0" value="${alt.dosering?.reps || 0}" data-action="edit-alt-field" data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}" data-field="reps" />
              <span>x</span>
              <input class="inline-input" type="number" min="0" value="${alt.dosering?.sett || 0}" data-action="edit-alt-field" data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}" data-field="sett" />
              <span>sett</span>
            </div>
            <div class="alt-desc">${alt.utforelse || ""}</div>
          </div>
        `;
        });

        const valgtProgresjon = altItems
          .filter(
            (_, altIndex) =>
              (instans.alternativer || [])[altIndex]?.retning === "progresjon"
          )
          .join("");
        const valgtRegresjon = altItems
          .filter(
            (_, altIndex) =>
              (instans.alternativer || [])[altIndex]?.retning === "regresjon"
          )
          .join("");

        return `
        <div class="exercise-card exercise-item">
          <div class="exercise-row exercise-main-row">
            <div class="exercise-title">
              <span class="emoji">${emoji}</span>
              <h4>${instans.navn}</h4>
              <div class="inline-actions">
                <button class="inline-btn" data-action="toggle-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="progresjon">+ Progresjon</button>
                <button class="inline-btn" data-action="toggle-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="regresjon">− Regresjon</button>
              </div>
            </div>
            <input class="inline-input" type="number" min="0" value="${instans.dosering.reps || 0}" data-action="edit-field" data-instans-id="${instans.ovelseInstansId}" data-field="reps" />
            <span class="times">×</span>
            <input class="inline-input" type="number" min="0" value="${instans.dosering.sett || 0}" data-action="edit-field" data-instans-id="${instans.ovelseInstansId}" data-field="sett" />
            <button class="expand-btn" data-action="toggle-details" data-instans-id="${instans.ovelseInstansId}" aria-expanded="${detailsOpen}">+</button>
            ${detailsOpen ? `
              <input class="inline-input compact" placeholder="Vekt" value="${sekundar.vekt}" data-action="edit-sekundar" data-instans-id="${instans.ovelseInstansId}" data-field="vekt" />
              <input class="inline-input compact" placeholder="Pause" value="${sekundar.pause}" data-action="edit-sekundar" data-instans-id="${instans.ovelseInstansId}" data-field="pause" />
            ` : ""}
            <div class="actions">
              <button class="action-btn" data-action="move-up" data-instans-id="${instans.ovelseInstansId}" ${index === 0 ? "disabled" : ""}>↑</button>
              <button class="action-btn" data-action="move-down" data-instans-id="${instans.ovelseInstansId}" ${index === hoveddel.ovelser.length - 1 ? "disabled" : ""}>↓</button>
              <button class="action-btn" data-action="remove" data-instans-id="${instans.ovelseInstansId}">Fjern</button>
            </div>
          </div>
          ${altOpen ? `
            <div class="expand exercise-children-wrap">
              ${altOpen === "progresjon" ? renderAlternativer(instans, master || { standardProgresjon: [], standardRegresjon: [] }, "progresjon", "Progresjon") : ""}
              ${altOpen === "regresjon" ? renderAlternativer(instans, master || { standardProgresjon: [], standardRegresjon: [] }, "regresjon", "Regresjon") : ""}
            </div>
          ` : ""}
          ${valgtProgresjon ? `<div class="alt-section compact exercise-children selected-progresjon"><strong>Valgte progresjoner</strong><div class="alt-list exercise-children-list">${valgtProgresjon}</div></div>` : ""}
          ${valgtRegresjon ? `<div class="alt-section compact exercise-children selected-regresjon"><strong>Valgte regresjoner</strong><div class="alt-list exercise-children-list">${valgtRegresjon}</div></div>` : ""}
        </div>
      `;
      })
      .join("");

    els.hoveddelListEl.innerHTML =
      items || '<p class="hint">Ingen øvelser lagt til ennå.</p>';
  }

  function renderLibrary() {
    if (!els.libraryGridEl) return;
    const query = helpers.normalize(state.search);
    const filtered = state.library.filter((item) => helpers.matchesSearch(item, query));

    els.libraryGridEl.innerHTML = filtered
      .map((item) => {
        const disabled = helpers.isInProgram(item.ovelseId);
        return `
        <div class="library-card">
          <div class="emoji">${item.emoji || "💪"}</div>
          <h4>${item.navn}</h4>
          ${item.tagger && item.tagger[0] ? `<span class="tag">${item.tagger[0]}</span>` : ""}
          <button class="add-btn" data-action="add-exercise" data-ovelse-id="${item.ovelseId}" ${disabled ? "disabled" : ""}>Legg til</button>
        </div>
      `;
      })
      .join("");
  }

  function full() {
    const hasDraft = Boolean(state.program);
    const panelEl = els.programPanelEl;
    const startStateEl = els.programStartStateEl;
    const builderEl = els.programBuilderEl;

    if (panelEl && startStateEl && builderEl) {
      startStateEl.hidden = false;
      builderEl.hidden = false;
      if (hasDraft) {
        if (startStateEl.parentElement === panelEl) {
          panelEl.removeChild(startStateEl);
        }
        if (builderEl.parentElement !== panelEl) {
          panelEl.insertBefore(builderEl, panelEl.firstChild);
        }
      } else {
        if (builderEl.parentElement === panelEl) {
          panelEl.removeChild(builderEl);
        }
        if (startStateEl.parentElement !== panelEl) {
          panelEl.insertBefore(startStateEl, panelEl.firstChild);
        }
      }
    }

    if (els.programTitleEl) {
      els.programTitleEl.textContent = state.program?.tittel || "Program";
    }
    if (els.programStatusEl) {
      els.programStatusEl.textContent =
        state.program?.status === "klar" ? "Klar" : "Utkast";
    }

    const hoveddel = helpers.getHoveddelSection();
    const manglerUtforelse = hasDraft
      ? helpers.finnOvelserUtenUtforelse(state.program)
      : [];
    if (els.exportBtn) {
      els.exportBtn.disabled =
        !hasDraft ||
        !hoveddel ||
        hoveddel.ovelser.length === 0 ||
        manglerUtforelse.length > 0;
    }

    if (hasDraft) {
      const notater = helpers.getNotaterSection();
      if (els.notaterInputEl) {
        els.notaterInputEl.value = notater?.seksjonNotat || "";
      }
      if (els.programNameInputEl) {
        els.programNameInputEl.value = state.program?.pasientNavn || "";
      }
      renderProgram();
    } else if (els.hoveddelListEl) {
      if (els.programNameInputEl) {
        els.programNameInputEl.value = "";
      }
      els.hoveddelListEl.innerHTML = "";
    }
    renderLibrary();
  }

  return {
    full,
    renderLibrary,
    setHelpers,
  };
}
