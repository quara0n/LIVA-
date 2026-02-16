export function createRenderer({ state, els, helpers: initialHelpers }) {
  let helpers = initialHelpers;

  function setHelpers(nextHelpers) {
    helpers = nextHelpers;
  }

  const programRootEl = els.programRootEl;

  function renderAltPickerControls() {
    const picker = state.ui.altPicker;
    const selection = state.ui.librarySelection;
    if (!picker || !selection) return "";
    if (
      picker.instansId !== selection.instansId ||
      picker.retning !== selection.retning
    ) {
      return "";
    }

    const presetOptions = [
      "Når smerte og funksjon er akseptabel",
      "Når øvelsen kjennes lett og kontrollert",
      "Ved økt smerte eller redusert kontroll",
      "Ved behov for enklere variant",
    ];
    const selected = Array.isArray(picker.narBrukesPresetValg)
      ? picker.narBrukesPresetValg
      : [];
    const selectedCount = selected.length;
    const triggerLabel = selectedCount > 0 ? `${selectedCount} valgt` : "Velg kriterier";

    return `
      <div class="library-config-row">
        <div class="library-multiselect" data-role="alt-multiselect">
          <button class="select library-multiselect-trigger" data-action="toggle-alt-preset-dropdown" aria-expanded="${picker.dropdownOpen ? "true" : "false"}">${triggerLabel}</button>
          ${
            picker.dropdownOpen
              ? `<div class="library-multiselect-menu">
                  ${presetOptions
                    .map((option) => {
                      const checked = selected.includes(option);
                      return `
                        <button class="library-multiselect-item" data-action="toggle-alt-preset-option" data-value="${option}" aria-pressed="${checked ? "true" : "false"}">
                          <input type="checkbox" tabindex="-1" ${checked ? "checked" : ""} />
                          <span>${option}</span>
                        </button>
                      `;
                    })
                    .join("")}
                  <button class="library-multiselect-item" data-action="toggle-alt-custom-enabled" aria-pressed="${picker.brukEgendefinertTekst ? "true" : "false"}">
                    <input type="checkbox" tabindex="-1" ${picker.brukEgendefinertTekst ? "checked" : ""} />
                    <span>Eget kriterium ...</span>
                  </button>
                </div>`
              : ""
          }
        </div>
        ${
          picker.brukEgendefinertTekst
            ? `<input class="inline-input wide" data-action="alt-custom" placeholder="Kort, konkret linje" value="${picker.narBrukesEgendefinertTekst}" />`
            : ""
        }
        <div class="library-config-actions">
          <button class="action-btn" data-action="alt-save">Lagre</button>
          <button class="action-btn" data-action="alt-cancel">Avbryt</button>
        </div>
      </div>
    `;
  }

  const PROGRESSION_CRITERIA_OPTIONS = [
    "Når smerte og funksjon er akseptabel",
    "Når øvelsen kjennes lett og kontrollert",
    "Ved økt smerte eller redusert kontroll",
    "Ved behov for enklere variant",
  ];

  function renderProgramItems(seksjon) {
    if (!seksjon) return "";
    const getVideoForExercise = (ovelseId) => {
      const manifest = state.ui.videoManifest;
      if (Array.isArray(manifest)) {
        return manifest.find((entry) => entry?.exerciseKey === ovelseId) || null;
      }
      if (manifest && manifest.exerciseKey === ovelseId) {
        return manifest;
      }
      return null;
    };
    const videoAssetUrl = (file) =>
      new URL(`public/videos/${file}`, document.baseURI).toString();
    const getVideoFilename = (url) => {
      if (!url) return "";
      const clean = String(url).split("#")[0].split("?")[0];
      return clean.split("/").pop() || "";
    };

    const renderExerciseMedia = (thumbUrl, emojiValue, title, videoFilename) => `
      <div class="exercise-media">
        ${
          thumbUrl
            ? `<img src="${thumbUrl}" alt="${title}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'emoji',textContent:'${emojiValue}'}));" />`
            : `<span class="emoji">${emojiValue}</span>`
        }
        ${
          videoFilename
            ? `<button class="action-btn media-video-btn" data-action="open-inline-video" data-video-filename="${videoFilename}" data-video-title="${title}">▶</button>`
            : ""
        }
      </div>
    `;

    const renderDosageStack = ({
      repsValue,
      settValue,
      inputAction,
      inputAttrs,
      toggleAction,
      toggleAttrs,
      isOpen,
      vektValue,
      tidValue,
    }) => `
      <div class="exercise-dosage-stack">
        ${
          isOpen
            ? `
          <div class="dosage-grid">
            <div class="dosage-col">
              <label class="dose-label">reps</label>
              <input class="inline-input dose-input dose-input--small" type="number" min="0" value="${repsValue}" data-action="${inputAction}" ${inputAttrs} data-field="reps" />
              <label class="dose-label">sett</label>
              <input class="inline-input dose-input dose-input--small" type="number" min="0" value="${settValue}" data-action="${inputAction}" ${inputAttrs} data-field="sett" />
              <button class="dose-toggle" data-action="${toggleAction}" ${toggleAttrs} aria-expanded="true">–</button>
            </div>
            <div class="dosage-col">
              <label class="dose-label">vekt</label>
              <input class="inline-input dose-input dose-input--medium" type="number" min="0" value="${vektValue}" data-action="${inputAction}" ${inputAttrs} data-field="vekt" />
              <label class="dose-label">tid</label>
              <input class="inline-input dose-input dose-input--medium" type="number" min="0" value="${tidValue}" data-action="${inputAction}" ${inputAttrs} data-field="tid" />
            </div>
          </div>
        `
            : `
          <div class="dosage-col">
            <label class="dose-label">reps</label>
            <input class="inline-input dose-input dose-input--small" type="number" min="0" value="${repsValue}" data-action="${inputAction}" ${inputAttrs} data-field="reps" />
            <label class="dose-label">sett</label>
            <input class="inline-input dose-input dose-input--small" type="number" min="0" value="${settValue}" data-action="${inputAction}" ${inputAttrs} data-field="sett" />
            <button class="dose-toggle" data-action="${toggleAction}" ${toggleAttrs} aria-expanded="false">+</button>
          </div>
        `
        }
      </div>
    `;

    const parseCriteriaItems = (alt) => {
      const preset = String(alt?.narBrukesPreset || "");
      const presetItems = preset
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      const custom = String(alt?.narBrukesEgendefinertTekst || "").trim();
      return custom ? [...presetItems, custom] : presetItems;
    };

    const groups = (seksjon.ovelser || [])
      .map((instans, index) => {
        const master = helpers.getMasterById(instans.ovelseId);
        const emoji = master?.emoji || "🏃";
        const video = getVideoForExercise(instans.ovelseId);
        const videoUrl = video?.url || "";
        const videoFilename = getVideoFilename(videoUrl);
        const thumbBase = videoFilename.replace(/\.mp4$/i, "");
        const thumbUrl = videoFilename ? videoAssetUrl(`${thumbBase}.jpg`) : "";
        const detailsOpen = state.ui.detailsOpen[instans.ovelseInstansId] || false;

        const altEntries = (instans.alternativer || []).map((alt, altIndex) => ({
          alt,
          altIndex,
        }));
        const progresjonEntries = altEntries.filter(
          (entry) => entry.alt.retning === "progresjon"
        );
        const regresjonEntries = altEntries.filter(
          (entry) => entry.alt.retning === "regresjon"
        );
        const progressionInstructions = Array.isArray(instans.progressionInstructions)
          ? instans.progressionInstructions
          : [];
        const progressionCriteria = Array.isArray(
          instans.progressionInstructionCriteriaIds
        )
          ? instans.progressionInstructionCriteriaIds
          : [];
        const criteriaOpen =
          state.ui.progressionCriteriaOpen === instans.ovelseInstansId;
        const criteriaLabel =
          progressionCriteria.length > 0
            ? `${progressionCriteria.length} valgt`
            : "Velg kriterier";

        const rehabMode = Boolean(state.program?.meta?.rehabTemplate);
        const showProgressionInstructions = false;
        const renderSelectedAltCard = ({ alt, altIndex }) => {
          const altDetailsOpen =
            state.ui.altDetailsOpen?.[instans.ovelseInstansId]?.[altIndex] || false;
          const altMaster = helpers.getMasterById(alt.ovelseId);
          const altEmoji = altMaster?.emoji || "🏃";
          const altVideo = getVideoForExercise(alt.ovelseId);
          const altVideoUrl = altVideo?.url || "";
          const altVideoFilename = getVideoFilename(altVideoUrl);
          const altThumbBase = altVideoFilename.replace(/\.mp4$/i, "");
          const altThumbUrl = altVideoFilename
            ? videoAssetUrl(`${altThumbBase}.jpg`)
            : "";
          const retningLabel =
            alt.retning === "progresjon"
              ? rehabMode
                ? "Neste nivå:"
                : "Progresjon"
              : rehabMode
                ? "Hvis for tungt:"
                : "Regresjon";
          const criteriaLabel =
            alt.retning === "progresjon"
              ? "Progresjonskriterier"
              : "Regresjonskriterier";
          const criteriaItems = parseCriteriaItems(alt);
          const hasCriteria = criteriaItems.length > 0;
          const criteriaOpen =
            state.ui.altCriteriaOpen?.[instans.ovelseInstansId] === altIndex;

          return `
          <div class="exercise-card exercise-item exercise-alt-card" data-action="open-exercise-preview" data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}" data-alt-retning="${alt.retning}">
            <button class="remove-btn" data-action="remove-alt" data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}" aria-label="Slett øvelse">×</button>
            <span class="alt-badge">${retningLabel}</span>
            <div class="exercise-title" style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;">
              <div class="exercise-title-row">
                <h4>${alt.navn}</h4>
                ${
                  hasCriteria
                    ? `<button class="criteria-chip" data-action="toggle-alt-criteria" data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}">
                        ✓ ${criteriaLabel} ▾
                      </button>`
                    : ""
                }
              </div>
              <div class="exercise-media-row">
                ${renderExerciseMedia(altThumbUrl, altEmoji, alt.navn, altVideoFilename)}
                ${renderDosageStack({
                  repsValue: alt.dosering?.reps || 0,
                  settValue: alt.dosering?.sett || 0,
                  inputAction: "edit-alt-field",
                  inputAttrs: `data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}"`,
                  toggleAction: "toggle-alt-details",
                  toggleAttrs: `data-instans-id="${instans.ovelseInstansId}" data-alt-index="${altIndex}"`,
                  isOpen: altDetailsOpen,
                  vektValue: alt.dosering?.belastningKg || 0,
                  tidValue: alt.dosering?.varighetSek || 0,
                })}
              </div>
              ${
                hasCriteria && criteriaOpen
                  ? `<div class="criteria-inline-panel">
                      <div class="criteria-flow">
                        <span>Primær: ${instans.navn}</span>
                        <span class="criteria-arrow">↓</span>
                        <span>Alternativ: ${alt.navn}</span>
                      </div>
                      <ul class="criteria-list">
                        ${criteriaItems
                          .map((item) => `<li>${item}</li>`)
                          .join("")}
                      </ul>
                    </div>`
                  : ""
              }
            </div>
          </div>
        `;
        };

        const selectedAltCards = [...progresjonEntries, ...regresjonEntries]
          .map((entry) => renderSelectedAltCard(entry))
          .join("");

        return `
        <div class="exercise-card-row">
          <div class="exercise-card exercise-item" data-action="open-exercise-preview" data-instans-id="${instans.ovelseInstansId}">
            <span class="exercise-order">${index + 1}</span>
            <button class="remove-btn" data-action="remove" data-instans-id="${instans.ovelseInstansId}" aria-label="Slett øvelse">×</button>
            <div class="exercise-row exercise-main-row">
              <div class="exercise-title" style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;">
                <h4>${instans.navn}</h4>
                <div class="exercise-media-row">
                  ${renderExerciseMedia(thumbUrl, emoji, instans.navn, videoFilename)}
                  ${renderDosageStack({
                    repsValue: instans.dosering.reps || 0,
                    settValue: instans.dosering.sett || 0,
                    inputAction: "edit-field",
                    inputAttrs: `data-instans-id="${instans.ovelseInstansId}"`,
                    toggleAction: "toggle-details",
                    toggleAttrs: `data-instans-id="${instans.ovelseInstansId}"`,
                    isOpen: detailsOpen,
                    vektValue: instans.dosering.belastningKg || 0,
                    tidValue: instans.dosering.varighetSek || 0,
                  })}
                </div>
                ${
                  showProgressionInstructions
                    ? `<div class="exercise-progression">
                  <div class="exercise-progression-header">
                    <strong>Progresjon i samme øvelse</strong>
                    <button class="action-btn" data-action="add-progression-instruction" data-instans-id="${instans.ovelseInstansId}">Legg til</button>
                  </div>
                  ${
                    progressionInstructions.length > 0
                      ? progressionInstructions
                          .map(
                            (item, instructionIndex) => `
                      <div class="exercise-progression-row">
                        <input
                          class="inline-input"
                          data-action="edit-progression-instruction"
                          data-instans-id="${instans.ovelseInstansId}"
                          data-index="${instructionIndex}"
                          type="text"
                          placeholder="Kort instruksjon"
                          value="${item || ""}"
                        />
                        <button class="action-btn" data-action="remove-progression-instruction" data-instans-id="${instans.ovelseInstansId}" data-index="${instructionIndex}">Fjern</button>
                      </div>
                    `
                          )
                          .join("")
                      : `<p class="hint">Ingen progresjonsinstrukser lagt til.</p>`
                  }
                  <div class="exercise-progression-criteria" data-role="progression-criteria">
                    <button class="select" data-action="toggle-progression-criteria" data-instans-id="${instans.ovelseInstansId}" aria-expanded="${criteriaOpen ? "true" : "false"}">${criteriaLabel}</button>
                    ${
                      criteriaOpen
                        ? `<div class="exercise-progression-menu">
                            ${PROGRESSION_CRITERIA_OPTIONS.map((option) => {
                              const checked = progressionCriteria.includes(option);
                              return `
                                <button class="exercise-progression-item" data-action="toggle-progression-criteria-option" data-instans-id="${instans.ovelseInstansId}" data-value="${option}" aria-pressed="${checked ? "true" : "false"}">
                                  <input type="checkbox" tabindex="-1" ${checked ? "checked" : ""} />
                                  <span>${option}</span>
                                </button>
                              `;
                            }).join("")}
                          </div>`
                        : ""
                    }
                  </div>
                </div>`
                    : ""
                }
                <div class="inline-actions">
                  <button class="inline-btn" data-action="toggle-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="progresjon">+ Legg til progresjonsøvelse</button>
                  <button class="inline-btn" data-action="toggle-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="regresjon">+ Legg til regresjonsøvelse</button>
                </div>
              </div>
            </div>
          </div>
          ${selectedAltCards}
        </div>
      `;
      });

    if (groups.length === 0) return '<p class="hint">Ingen øvelser lagt til ennå.</p>';

    const totalExerciseCount = (seksjon.ovelser || []).reduce(
      (sum, instans) => sum + 1 + (instans.alternativer?.length || 0),
      0
    );
    const useTwoColumns = totalExerciseCount > 4;
    if (!useTwoColumns) {
      return groups.join("");
    }

    const splitIndex = Math.ceil((seksjon.ovelser || []).length / 2);
    const col1 = groups.slice(0, splitIndex).join("");
    const col2 = groups.slice(splitIndex).join("");
    return `
      <div class="exercise-columns">
        <div class="exercise-column">${col1}</div>
        <div class="exercise-column">${col2}</div>
      </div>
    `;
  }

  function renderLibrary() {
    if (!els.libraryGridEl) return;
    const selection = state.ui.librarySelection;
    const isSelectionMode = Boolean(selection);
    if (els.libraryPanelEl) {
      els.libraryPanelEl.classList.toggle("is-selection-mode", isSelectionMode);
    }
    els.libraryGridEl.classList.toggle("is-selection-mode", isSelectionMode);
    const query = helpers.normalize(state.search);
    const filtered = state.library.filter((item) => helpers.matchesSearch(item, query));
    let suggestedIds = [];
    if (selection) {
      const primaryContext = helpers.getExerciseContext
        ? helpers.getExerciseContext(selection.instansId)
        : null;
      const primary = primaryContext?.exercise;
      const primaryMaster = primary ? helpers.getMasterById(primary.ovelseId) : null;
      const source =
        selection.retning === "progresjon"
          ? primaryMaster?.standardProgresjon || []
          : primaryMaster?.standardRegresjon || [];
      suggestedIds = source
        .map((id) => String(id || "").trim())
        .filter(Boolean)
        .slice(0, 5);
    }
    const getVideoForExercise = (ovelseId) => {
      const manifest = state.ui.videoManifest;
      if (Array.isArray(manifest)) {
        return manifest.find((entry) => entry?.exerciseKey === ovelseId) || null;
      }
      if (manifest && manifest.exerciseKey === ovelseId) {
        return manifest;
      }
      return null;
    };
    const videoAssetUrl = (file) =>
      new URL(`public/videos/${file}`, document.baseURI).toString();
    const getVideoFilename = (url) => {
      if (!url) return "";
      const clean = String(url).split("#")[0].split("?")[0];
      const filename = clean.split("/").pop() || "";
      return filename;
    };

    const renderLibraryCard = (item, options = {}) => {
      const inProgram = helpers.isInProgram(item.ovelseId);
      const picker = state.ui.altPicker;
      const isPickingThis =
        isSelectionMode &&
        picker &&
        picker.instansId === selection.instansId &&
        picker.retning === selection.retning &&
        picker.ovelseId === item.ovelseId;
      const headingPrefix = options.prefix || "";
      const existingCount = isSelectionMode
        ? (
            (helpers.getExerciseContext
              ? helpers.getExerciseContext(selection.instansId)?.exercise
              : null)?.alternativer || []
          ).filter((alt) => alt.retning === selection.retning).length
        : 0;
      const addAsAltDisabled = existingCount >= 3;
      const actionLabel = isSelectionMode
        ? `Legg til som ${selection.retning}`
        : "+";
      const actionData = isSelectionMode
        ? `data-action="add-alt" data-instans-id="${selection.instansId}" data-retning="${selection.retning}" data-alt-id="${item.ovelseId}"`
        : `data-action="add-exercise" data-ovelse-id="${item.ovelseId}"`;
      const actionDisabled = isSelectionMode ? addAsAltDisabled : inProgram;
      const video = getVideoForExercise(item.ovelseId);
      const videoUrl = video?.url || "";
      const videoFilename = getVideoFilename(videoUrl);
      const displayName =
        item.ovelseId === "goblet-kneboy" ? "45 graders knebøy" : item.navn || "Forhåndsvis video";
      const thumbBase = videoFilename.replace(/\.mp4$/i, "");
      const thumbUrl = videoFilename ? videoAssetUrl(`${thumbBase}.jpg`) : "";
      const mediaWrapperStyle = isSelectionMode
        ? "position:relative;overflow:hidden;border-radius:10px;"
        : "position:relative;height:140px;overflow:hidden;border-radius:10px;";

      return `
        <div class="library-card" style="position:relative;">
          <div class="library-card-media" style="${mediaWrapperStyle}">
            ${
              thumbUrl
                ? `<img src="${thumbUrl}" alt="${displayName}" style="width:100%;height:100%;object-fit:cover;display:block;border:1px solid var(--border);filter:contrast(0.92);" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'emoji',textContent:'${item.emoji || "💪"}'}));" />`
                : `<div class="emoji">${item.emoji || "💪"}</div>`
            }
            <div style="position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:flex-end;gap:8px;background:transparent;border-radius:10px;padding:8px;">
              <button class="action-btn library-add-btn" ${actionData} ${actionDisabled ? "disabled" : ""} style="background:rgba(255,255,255,0.35);border:1px solid rgba(0,0,0,0.12);box-shadow:0 1px 4px rgba(0,0,0,0.08);">${actionLabel}</button>
              ${
                video && videoFilename
                  ? `<button class="action-btn" data-action="open-inline-video" data-ovelse-id="${item.ovelseId}" data-video-filename="${videoFilename}" data-video-title="${displayName}" style="background:rgba(255,255,255,0.35);border:1px solid rgba(0,0,0,0.12);box-shadow:0 1px 4px rgba(0,0,0,0.08);">▶</button>`
                  : ""
              }
            </div>
          </div>
          <div class="library-card-meta">
            <h4>${headingPrefix}${displayName}</h4>
          </div>
          ${isPickingThis ? `<div class="library-card-config">${renderAltPickerControls()}</div>` : ""}
        </div>
      `;
    };

    const suggestedCards = selection
      ? suggestedIds
          .map((id) => helpers.getMasterById(id))
          .filter(Boolean)
          .map((item) => renderLibraryCard(item, { prefix: "Forslag: " }))
          .join("")
      : "";
    const suggestedIdSet = new Set(suggestedIds);
    const listItems =
      isSelectionMode && suggestedIds.length
        ? filtered.filter((item) => !suggestedIdSet.has(item.ovelseId))
        : filtered;

    const allCards = listItems
      .map((item) => {
        return renderLibraryCard(item);
      })
      .join("");
    if (!isSelectionMode) {
      els.libraryGridEl.innerHTML = allCards;
      return;
    }

    els.libraryGridEl.innerHTML = `
      ${
        selection && suggestedCards
          ? `<section class="library-selection-controls">
              <button class="action-btn" data-action="cancel-library-selection">Avbryt</button>
            </section>
            <section class="library-suggestions">
              <h3>Forslag</h3>
              <div class="library-mode-grid library-suggestions-grid">${suggestedCards}</div>
            </section>`
          : selection
            ? `<section class="library-selection-controls">
                <button class="action-btn" data-action="cancel-library-selection">Avbryt</button>
              </section>`
          : ""
      }
      ${
        selection
          ? `<section class="library-search-results"><div class="library-mode-grid library-list">${allCards}</div></section>`
          : `<div class="library-grid library-list">${allCards}</div>`
      }
    `;
  }

  function renderVideoPreviewModal() {
    const preview = state.ui.videoPreview || { isOpen: false };
    if (!preview.isOpen) return "";
    const title = preview.title || "Forhåndsvis video";
    const url = preview.url || "";
    return `
      <div class="send-program-modal-backdrop" data-action="close-video-preview">
        <div class="send-program-modal" role="dialog" aria-modal="true" aria-label="Forhåndsvis video">
          <h3>${title}</h3>
          <video data-action="video-preview-player" controls preload="metadata" src="${url}"></video>
          <div class="send-program-modal-actions">
            <button class="action-btn" data-action="close-video-preview">Lukk</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderExercisePreviewModal() {
    const preview = state.ui.exercisePreview || { isOpen: false };
    if (!preview.isOpen) return "";
    const context = helpers.getExerciseContext
      ? helpers.getExerciseContext(preview.instansId)
      : null;
    const instans = context?.exercise;
    if (!instans) return "";

    let ovelseId = instans.ovelseId;
    let navn = instans.navn || "Øvelse";
    let utforelse = instans.utforelse || "";
    let kommentar = instans.kommentar || "";
    let retningLabel = "";

    if (Number.isFinite(preview.altIndex)) {
      const alt = instans.alternativer?.[preview.altIndex];
      if (!alt) return "";
      ovelseId = alt.ovelseId || ovelseId;
      navn = alt.navn || navn;
      utforelse = alt.utforelse || "";
      kommentar = alt.kommentar || "";
      retningLabel =
        alt.retning === "progresjon"
          ? "Progresjon"
          : alt.retning === "regresjon"
            ? "Regresjon"
            : "";
    }

    const master = helpers.getMasterById(ovelseId);
    const emoji = master?.emoji || "🏃";
    const manifest = state.ui.videoManifest;
    const getVideoForExercise = (id) => {
      if (Array.isArray(manifest)) {
        return manifest.find((entry) => entry?.exerciseKey === id) || null;
      }
      if (manifest && manifest.exerciseKey === id) {
        return manifest;
      }
      return null;
    };
    const video = getVideoForExercise(ovelseId);
    const videoUrl = video?.url || "";
    const clean = String(videoUrl).split("#")[0].split("?")[0];
    const videoFilename = clean.split("/").pop() || "";
    const thumbBase = videoFilename.replace(/\.mp4$/i, "");
    const thumbUrl = videoFilename
      ? new URL(`public/videos/${thumbBase}.jpg`, document.baseURI).toString()
      : "";
    const instructionText = String(utforelse || "");
    const commentText = String(kommentar || "");
    const otherOpen =
      typeof preview.otherOpen === "boolean"
        ? preview.otherOpen
        : Boolean(commentText.trim());
    const instructionAction = Number.isFinite(preview.altIndex)
      ? "edit-alt-instruction"
      : "edit-exercise-instruction";
    const commentAction = Number.isFinite(preview.altIndex)
      ? "edit-alt-comment"
      : "edit-exercise-comment";
    const altIndexAttr = Number.isFinite(preview.altIndex)
      ? `data-alt-index="${preview.altIndex}"`
      : "";

    return `
      <div class="send-program-modal-backdrop" data-action="close-exercise-preview">
        <div class="send-program-modal exercise-preview-modal" data-action="exercise-preview-modal" role="dialog" aria-modal="true" aria-label="Øvelsesinstruksjon">
          <div class="exercise-preview-header">
            <h3>${navn}</h3>
            <button class="action-btn exercise-preview-close" data-action="close-exercise-preview" aria-label="Lukk">×</button>
          </div>
          ${retningLabel ? `<span class="tag">${retningLabel}</span>` : ""}
          <div class="exercise-preview-media">
            ${
              thumbUrl
                ? `<img src="${thumbUrl}" alt="${navn}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'emoji',textContent:'${emoji}'}));" />`
                : `<span class="emoji">${emoji}</span>`
            }
          </div>
          <label class="exercise-preview-label">
            <span>Instruksjon</span>
            <textarea class="exercise-preview-textarea" rows="4" data-action="${instructionAction}" data-instans-id="${preview.instansId}" ${altIndexAttr}>${instructionText}</textarea>
          </label>
          <div class="exercise-preview-other">
            <div class="exercise-preview-other-header">
              <span>Annet</span>
              <button class="dose-toggle" data-action="toggle-exercise-preview-other" aria-expanded="${otherOpen ? "true" : "false"}">${otherOpen ? "–" : "+"}</button>
            </div>
            ${
              otherOpen
                ? `<textarea class="exercise-preview-textarea exercise-preview-note" rows="3" data-action="${commentAction}" data-instans-id="${preview.instansId}" ${altIndexAttr}>${commentText}</textarea>`
                : ""
            }
          </div>
        </div>
      </div>
    `;
  }

  function formatArchiveDate(value) {
    if (!value) return "Ukjent dato";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Ukjent dato";
    return date.toLocaleDateString("no-NO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function renderArchiveList() {
    const archive = Array.isArray(state.archive) ? state.archive : [];
    const rows = archive
      .map((entry) => {
        const name = entry?.patientName || "Ukjent navn";
        const updatedAt = formatArchiveDate(entry?.updatedAt);
        const entryId = entry?.id || "";
        const disabled = entryId ? "" : "disabled";
        const isEditing = state.ui.archiveEditId === entryId;
        const editName = state.ui.archiveEditName || "";
        const editEmail = state.ui.archiveEditEmail || "";
        const editError = state.ui.archiveEditError || "";

        return `
        <div class="archive-row">
          <div class="archive-meta">
            <strong>${name}</strong>
            <span class="tag">Sist oppdatert: ${updatedAt}</span>
          </div>
          <div class="archive-actions">
            <button class="action-btn" data-action="open-archive" data-archive-id="${entryId}" ${disabled}>Åpne</button>
            <button class="action-btn" data-action="pdf-archive" data-archive-id="${entryId}" ${disabled}>PDF</button>
            <button class="action-btn" data-action="edit-archive" data-archive-id="${entryId}" ${disabled}>Rediger</button>
          </div>
        </div>
        ${
          isEditing
            ? `
          <div class="archive-row">
            <div class="archive-meta">
              <input
                class="inline-input"
                data-action="edit-archive-name"
                data-archive-id="${entryId}"
                type="text"
                placeholder="Pasientnavn"
                value="${editName}"
              />
              <input
                class="inline-input"
                data-action="edit-archive-email"
                data-archive-id="${entryId}"
                type="email"
                placeholder="E-post (valgfritt)"
                value="${editEmail}"
              />
              ${editError ? `<div class="hint">${editError}</div>` : ""}
            </div>
            <div class="archive-actions">
              <button class="action-btn" data-action="save-archive-edit" data-archive-id="${entryId}">Lagre</button>
              <button class="action-btn" data-action="cancel-archive-edit" data-archive-id="${entryId}">Avbryt</button>
            </div>
          </div>
        `
            : ""
        }
      `;
      })
      .join("");

    return `
      <div class="program-startstate startstate">
        <div class="startstate-card archive-card">
          <div class="section-title">
            <h3>Arkiv</h3>
          </div>
          ${rows || '<p class="hint">Ingen arkiverte program.</p>'}
          <div class="start-actions">
            <button class="action-btn" data-action="close-load">Tilbake</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderStartState() {
    return `
      <div class="program-startstate startstate">
        <div class="startstate-card">
          <div class="start-actions">
            <div class="start-actions-row">
              <button class="action-btn" data-action="load-program">Hent program</button>
            </div>
            <button class="primary" data-action="open-start-details" data-mode="new">Nytt program</button>
          </div>
          <p class="hint">Opprett eller hent program før redigering.</p>
        </div>
      </div>
    `;
  }

  function renderStartDetails() {
    const purpose = state.ui.startDetailsPurpose || "newProgram";
    const isTemplate = purpose === "template";
    const title = isTemplate ? "Start fra mal" : "Nytt Program";
    const buttonLabel = isTemplate ? "Bruk mal" : "Opprett";
    const existingName = state.patientName || state.program?.pasientNavn || "";
    const existingEmail = state.patientEmail || state.program?.pasientEpost || "";
    const useSamePatient = isTemplate ? Boolean(state.ui.startDetailsUseSamePatient) : false;
    const selectedTemplateId = state.ui.startDetailsTemplateId || "";
    const templates = Array.isArray(state.templates) ? state.templates : [];
    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
    const effectiveName = useSamePatient ? existingName : state.ui.startDetailsName || "";
    const nameOk = Boolean(String(effectiveName || "").trim());
    const canConfirm = isTemplate ? nameOk && Boolean(selectedTemplateId) : nameOk;
    const templateRows = templates
      .map((template) => {
        const description = template.description
          ? `<span class="tag">${template.description}</span>`
          : "";
        const isSelected = template.id === selectedTemplateId;
        return `
        <div class="archive-row">
          <div class="archive-meta">
            <strong>${template.name}</strong>
            ${description}
          </div>
          <div class="archive-actions">
            <button class="action-btn" data-action="select-template" data-template-id="${template.id}">
              ${isSelected ? "Valgt" : "Velg"}
            </button>
          </div>
        </div>
      `;
      })
      .join("");

    return `
      <div class="program-startstate startstate">
        <div class="startstate-card">
          <div class="section-title">
            <h3>${title}</h3>
          </div>
          ${
            isTemplate
              ? `
            <label class="toggle-row">
              <input
                type="checkbox"
                data-action="toggle-same-patient"
                ${useSamePatient ? "checked" : ""}
              />
              Bruk samme pasient
            </label>
            ${
              useSamePatient
                ? `
              <div class="start-details-locked">
                <strong>${existingName || "Ingen pasient valgt"}</strong>
                <span>${existingEmail ? `E-post: ${existingEmail}` : "E-post: mangler"}</span>
              </div>
            `
                : `
              <input
                data-field="start-name"
                type="text"
                autocomplete="name"
                placeholder="Pasientnavn"
                value="${state.ui.startDetailsName || ""}"
              />
              <input
                data-field="start-email"
                type="email"
                autocomplete="email"
                placeholder="E-post (valgfritt)"
                value="${state.ui.startDetailsEmail || ""}"
              />
            `
            }
            <div class="section-title">
              <h4>Velg mal</h4>
            </div>
            ${templateRows || '<p class="hint">Ingen maler tilgjengelig.</p>'}
            ${selectedTemplate ? `<p class="hint">Valgt: ${selectedTemplate.name}</p>` : ""}
          `
              : `
            <input
              data-field="start-name"
              type="text"
              autocomplete="name"
              placeholder="Pasientnavn"
              value="${state.ui.startDetailsName || ""}"
            />
            <input
              data-field="start-email"
              type="email"
              autocomplete="email"
              placeholder="E-post (valgfritt)"
              value="${state.ui.startDetailsEmail || ""}"
            />
          `
          }
          <div class="start-actions">
            <button class="primary" data-action="start-details-confirm" ${
              canConfirm ? "" : "disabled"
            }>${buttonLabel}</button>
            <button class="action-btn" data-action="start-details-cancel">Tilbake</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderTemplatesList() {
    const templates = Array.isArray(state.templates) ? state.templates : [];
    const rows = templates
      .map((template) => {
        const description = template.description
          ? `<span class="tag">${template.description}</span>`
          : "";
        return `
        <div class="archive-row">
          <div class="archive-meta">
            <strong>${template.name}</strong>
            ${description}
          </div>
          <div class="archive-actions">
            <button class="action-btn" data-action="apply-template" data-template-id="${template.id}">Bruk mal</button>
          </div>
        </div>
      `;
      })
      .join("");

    return `
      <div class="program-startstate startstate">
        <div class="startstate-card">
          <div class="section-title">
            <h3>Programmaler</h3>
          </div>
          ${rows || '<p class="hint">Ingen maler tilgjengelig.</p>'}
          <div class="start-actions">
            <button class="action-btn" data-action="close-templates">Tilbake</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderSendProgramSection() {
    const sections = helpers.getExerciseSections ? helpers.getExerciseSections() : [];
    const hasExercises = sections.some((seksjon) => (seksjon.ovelser || []).length > 0);
    const disabledAttr = hasExercises ? "" : "disabled";
    const disabledTitle = hasExercises
      ? ""
      : 'title="Legg til minst én øvelse før du sender eller skriver ut"';
    const sendProgram = state.ui.sendProgram || {
      isOpen: false,
      to: "",
      subject: "Ditt treningsprogram",
      message:
        "Hei,\n\nHer er treningsprogrammet vi har laget sammen.\n\nTa kontakt hvis du har spørsmål.\n\nVennlig hilsen",
    };

    return `
      <div class="section section-send-program" id="section-send-program">
        <div class="send-program-actions">
          <button class="primary" data-action="open-send-program" ${disabledAttr} ${disabledTitle}>Send på e-post</button>
          <button class="primary" data-action="print-program" ${disabledAttr} ${disabledTitle}>Skriv ut</button>
        </div>
        ${
          !hasExercises
            ? '<p class="hint send-program-hint">Legg til minst én øvelse før du sender eller skriver ut</p>'
            : ""
        }
      </div>
      ${
        sendProgram.isOpen
          ? `
        <div class="send-program-modal-backdrop" data-action="send-program-cancel">
          <div class="send-program-modal" role="dialog" aria-modal="true" aria-label="Send program på e-post">
            <h3>Send program på e-post</h3>
            <label class="send-program-field">
              <span>Til</span>
              <input
                data-action="send-program-to"
                type="email"
                autocomplete="email"
                value="${sendProgram.to || ""}"
              />
            </label>
            <label class="send-program-field">
              <span>Emne</span>
              <input
                data-action="send-program-subject"
                type="text"
                value="${sendProgram.subject || ""}"
              />
            </label>
            <label class="send-program-field">
              <span>Melding</span>
              <textarea data-action="send-program-message" rows="6">${sendProgram.message || ""}</textarea>
            </label>
            <div class="send-program-modal-actions">
              <button class="primary" data-action="send-program-submit">Send</button>
              <button class="action-btn" data-action="send-program-cancel">Avbryt</button>
            </div>
          </div>
        </div>
      `
          : ""
      }
    `;
  }

  function renderPhaseHeader(seksjon) {
    if (!seksjon) return "";
    const focusBullets = Array.isArray(seksjon.phaseFocusBullets)
      ? seksjon.phaseFocusBullets
      : [];
    return `
      <div class="phase-header">
        <div class="phase-header-row">
          <label>
            <span>Fasenavn</span>
            <input
              class="inline-input"
              type="text"
              data-action="edit-phase-title"
              data-section-id="${seksjon.seksjonId}"
              value="${seksjon.tittel || ""}"
              placeholder="Fase-navn"
            />
          </label>
          <label>
            <span>Mål</span>
            <input
              class="inline-input"
              type="text"
              data-action="edit-phase-goal"
              data-section-id="${seksjon.seksjonId}"
              value="${seksjon.phaseGoal || ""}"
              placeholder="Kort mål for fasen"
            />
          </label>
        </div>
        <div class="phase-header-row">
          <div class="phase-header-bullets">
            <span>Prinsipp/fokus</span>
            ${[0, 1, 2]
              .map(
                (index) => `
              <input
                class="inline-input"
                type="text"
                data-action="edit-phase-focus"
                data-section-id="${seksjon.seksjonId}"
                data-index="${index}"
                value="${focusBullets[index] || ""}"
                placeholder="Fokuspunkt"
              />
            `
              )
              .join("")}
          </div>
        </div>
        <div class="phase-header-row">
          <label>
            <span>Standard progresjonsregel</span>
            <input
              class="inline-input"
              type="text"
              data-action="edit-phase-progression"
              data-section-id="${seksjon.seksjonId}"
              value="${seksjon.phaseProgressionRule || ""}"
              placeholder="F.eks. 24t-respons"
            />
          </label>
        </div>
        <div class="phase-header-row">
          <label class="phase-header-note">
            <span>Klinikernotat</span>
            <textarea
              rows="2"
              data-action="edit-phase-clinician"
              data-section-id="${seksjon.seksjonId}"
              placeholder="Valgfritt notat"
            >${seksjon.phaseClinicianNote || ""}</textarea>
          </label>
        </div>
      </div>
    `;
  }

  function renderRehabTemplatesOverlay() {
    const overlay = state.ui.rehabOverlay;
    if (!overlay || !overlay.isOpen) return "";

    const templates = Array.isArray(state.rehabTemplates) ? state.rehabTemplates : [];
    const query = helpers.normalize(overlay.search);
    const filteredTemplates = templates.filter((template) => {
      if (!query) return true;
      const haystack = [template.name, template.id].map(helpers.normalize).join(" ");
      return haystack.includes(query);
    });
    const activeTemplate = templates.find(
      (template) => template.id === overlay.selectedTemplateId
    );
    const step = Math.min(4, Math.max(1, Number(overlay.step) || 1));

    const templateCards = filteredTemplates
      .map((template) => {
        const isSelected = template.id === overlay.selectedTemplateId;
        return `
          <button class="rehab-card ${isSelected ? "is-selected" : ""}" data-action="select-rehab-template" data-template-id="${template.id}" aria-pressed="${isSelected ? "true" : "false"}">
            <strong>${template.name}</strong>
            <span class="hint">Systemmal</span>
          </button>
        `;
      })
      .join("");

    const subtypeOptions = activeTemplate
      ? Object.entries(activeTemplate.variants || {})
      : [];
    const subtypeCards = subtypeOptions
      .map(([key, value]) => {
        const isSelected = key === overlay.selectedSubtype;
        return `
          <button class="rehab-card ${isSelected ? "is-selected" : ""}" data-action="select-rehab-subtype" data-subtype="${key}" aria-pressed="${isSelected ? "true" : "false"}">
            <strong>${value.label || key}</strong>
          </button>
        `;
      })
      .join("");

    const statusOptions =
      activeTemplate?.variants?.[overlay.selectedSubtype]?.statuses || {};
    const statusCards = Object.entries(statusOptions)
      .map(([key, value]) => {
        const isSelected = key === overlay.selectedStatus;
        return `
          <button class="rehab-card ${isSelected ? "is-selected" : ""}" data-action="select-rehab-status" data-status="${key}" aria-pressed="${isSelected ? "true" : "false"}">
            <strong>${value.label || key}</strong>
          </button>
        `;
      })
      .join("");

    const summaryTemplate = activeTemplate?.name || "";
    const summarySubtype =
      activeTemplate?.variants?.[overlay.selectedSubtype]?.label || "";
    const summaryStatus =
      statusOptions?.[overlay.selectedStatus]?.label || "";

    return `
      <div class="rehab-overlay-backdrop">
        <div class="rehab-overlay" role="dialog" aria-modal="true" aria-label="Rehab-maler">
          <div class="rehab-overlay-header">
            <div>
              <h3>Rehab-maler</h3>
              <p class="hint">Velg mal og variant.</p>
            </div>
            <button class="action-btn" data-action="close-rehab-templates">X</button>
          </div>

          <input
            type="search"
            data-action="rehab-search"
            placeholder="Søk rehab-mal..."
            value="${overlay.search || ""}"
          />

          <div class="rehab-steps">
            ${
              step === 1
                ? `
              <div class="rehab-step">
                <div class="rehab-step-title">Steg 1: Velg mal</div>
                <div class="rehab-card-grid">
                  ${templateCards || '<p class="hint">Ingen treff.</p>'}
                </div>
              </div>
            `
                : ""
            }
            ${
              step === 2
                ? `
              <div class="rehab-step">
                <div class="rehab-step-title">Steg 2: Velg subtype</div>
                <div class="rehab-card-grid">
                  ${subtypeCards || '<p class="hint">Velg en mal først.</p>'}
                </div>
              </div>
            `
                : ""
            }
            ${
              step === 3
                ? `
              <div class="rehab-step">
                <div class="rehab-step-title">Steg 3: Velg status</div>
                <div class="rehab-card-grid">
                  ${statusCards || '<p class="hint">Velg subtype først.</p>'}
                </div>
              </div>
            `
                : ""
            }
            ${
              step === 4
                ? `
              <div class="rehab-step">
                <div class="rehab-step-title">Steg 4: Bruk mal</div>
                <div class="rehab-summary">
                  <div><strong>Mal:</strong> ${summaryTemplate}</div>
                  <div><strong>Subtype:</strong> ${summarySubtype}</div>
                  <div><strong>Status:</strong> ${summaryStatus}</div>
                </div>
              </div>
            `
                : ""
            }
          </div>

          <div class="rehab-overlay-actions">
            ${step > 1 ? `<button class="action-btn" data-action="rehab-step-back">Tilbake</button>` : ""}
            ${step === 4 ? `<button class="primary" data-action="apply-rehab-template">Bruk mal</button>` : ""}
          </div>
        </div>
      </div>
    `;
  }

  function renderBuilder() {
    const phaseSections = helpers.getPhaseSections ? helpers.getPhaseSections() : [];
    const exerciseSections = helpers.getExerciseSections
      ? helpers.getExerciseSections()
      : [];
    const activeSection = helpers.getHoveddelSection
      ? helpers.getHoveddelSection()
      : null;
    const activeSectionId =
      activeSection?.seksjonId || state.ui.activeSectionId || "";
    const activePhaseId = Number.isFinite(state.ui.activePhaseId)
      ? state.ui.activePhaseId
      : phaseSections[0]?.phaseId;
    const showPhaseSwitcher = phaseSections.length > 0;
    const rehabMode = Boolean(state.program?.meta?.rehabTemplate);
    const activePhase =
      phaseSections.find((phase) => phase.phaseId === activePhaseId) ||
      phaseSections[0] ||
      null;
    const sectionsToRender = showPhaseSwitcher
      ? phaseSections.filter((phase) => phase.phaseId === activePhaseId)
      : exerciseSections.map((seksjon) => ({ seksjon }));
    const sectionBlocks = sectionsToRender
      .map((entry) => {
        const seksjon = entry.seksjon || entry;
        const isActive = showPhaseSwitcher
          ? false
          : seksjon.seksjonId === activeSectionId;
        return `
        <div class="section rehab-section" data-section-id="${seksjon.seksjonId}">
          ${
            showPhaseSwitcher
              ? `<div class="section-title">
            <button class="section-title-btn" data-action="set-active-section" data-section-id="${seksjon.seksjonId}">
              <span>${seksjon.tittel || "Seksjon"}</span>
              ${isActive ? `<span class="tag">Aktiv</span>` : ""}
            </button>
          </div>`
              : ""
          }
          ${showPhaseSwitcher && !rehabMode ? renderPhaseHeader(seksjon) : ""}
          <div class="section-body exercise-list">
            ${renderProgramItems(seksjon)}
          </div>
        </div>
      `;
      })
      .join("");
    const rehabActive = Boolean(state.program?.meta?.rehabTemplate);
    const rehabLabel = state.program?.meta?.rehabLabel || "Rehab-mal aktiv";

    return `
      <div class="program-canvas">
        <div class="panel-header program-header">
          <div class="program-top-controls">
            <input
              class="inline-input wide"
              data-action="edit-program-name"
              type="text"
              placeholder="Navn"
            />
            ${rehabActive ? `<span class="rehab-badge">${rehabLabel}</span>` : ""}
            <button class="action-btn" data-action="save-program">Lagre</button>
            <button class="action-btn" data-action="start-new-program">Nytt program</button>
            <button class="action-btn" data-action="load-program">Hent program</button>
          </div>
        </div>

        ${
          showPhaseSwitcher
            ? `
        <div class="phase-switcher">
          <div class="phase-switcher-actions">
            ${phaseSections
              .map(
                (phase) => `
              <button class="action-btn ${phase.phaseId === activePhaseId ? "is-active" : ""}" data-action="set-active-phase" data-phase-id="${phase.phaseId}">
                ${phase.seksjon?.tittel || `Fase ${phase.phaseId}`}
              </button>
            `
              )
              .join("")}
          </div>
          ${
            rehabMode
              ? ""
              : `<div class="phase-switcher-actions">
            <button class="action-btn" data-action="add-phase">+ Ny fase</button>
            ${
              activePhase?.seksjon
                ? `<button class="action-btn" data-action="remove-phase" data-section-id="${activePhase.seksjon.seksjonId}">Fjern fase</button>`
                : ""
            }
          </div>`
          }
        </div>
        `
            : ""
        }
        ${sectionBlocks}

        <div class="section" id="section-notater">
          <div class="section-body">
            <textarea
              data-action="edit-notater"
              rows="6"
              placeholder="Skriv korte, konkrete instruksjoner..."
            ></textarea>
          </div>
        </div>

        ${renderSendProgramSection()}
      </div>
    `;
  }

  function full() {
    const panelView = state.ui.panelView || "start";
    const hasDraft = Boolean(state.program);
    const isBuilder = panelView === "builder" && hasDraft;
    const rehabOverlay = renderRehabTemplatesOverlay();
    const shouldFocusRehabSearch = Boolean(state.ui.rehabOverlay?.focusSearch);

    if (programRootEl) {
      if (panelView === "load") {
        programRootEl.innerHTML = `${renderArchiveList()}${renderVideoPreviewModal()}${rehabOverlay}`;
      } else if (panelView === "templates") {
        programRootEl.innerHTML = `${renderTemplatesList()}${renderVideoPreviewModal()}${rehabOverlay}`;
      } else if (panelView === "start-details") {
        programRootEl.innerHTML = `${renderStartDetails()}${renderVideoPreviewModal()}${rehabOverlay}`;
      } else if (isBuilder) {
        programRootEl.innerHTML = `${renderBuilder()}${renderExercisePreviewModal()}${renderVideoPreviewModal()}${rehabOverlay}`;
      } else {
        programRootEl.innerHTML = `${renderStartState()}${renderVideoPreviewModal()}${rehabOverlay}`;
      }
    }

    if (els.programTitleEl) {
      if (els.programTitleEl.dataset?.role !== "logo") {
        els.programTitleEl.textContent = state.program?.tittel || "Program";
      }
    }
    if (els.programStatusEl) {
      els.programStatusEl.textContent =
        state.program?.status === "klar" ? "Klar" : "Utkast";
    }
    if (els.libraryTitleEl) {
      if (state.ui.librarySelection?.retning === "progresjon") {
        els.libraryTitleEl.textContent = "Progresjonsøvelser – legg til øvelser";
      } else if (state.ui.librarySelection?.retning === "regresjon") {
        els.libraryTitleEl.textContent = "Regresjonsøvelser – legg til øvelser";
      } else {
        els.libraryTitleEl.textContent = "Øvelsesbibliotek";
      }
    }
    if (els.libraryContextEl) {
      if (state.ui.librarySelection) {
        const retning = state.ui.librarySelection.retning;
        const retningLabel = retning === "progresjon" ? "progresjon" : "regresjon";
        els.libraryContextEl.textContent = `Velg ${retningLabel} for: ${state.ui.librarySelection.primaryExerciseName}`;
      } else {
        els.libraryContextEl.textContent = "";
      }
    }

    const sections = helpers.getExerciseSections ? helpers.getExerciseSections() : [];
    const hasExercises = sections.some((seksjon) => (seksjon.ovelser || []).length > 0);
    const manglerUtforelse = isBuilder
      ? helpers.finnOvelserUtenUtforelse(state.program)
      : [];
    if (els.exportBtn) {
      els.exportBtn.disabled =
        !isBuilder ||
        !hasExercises ||
        manglerUtforelse.length > 0;
    }

    if (isBuilder && programRootEl) {
      const notater = helpers.getNotaterSection();
      const notaterInput = programRootEl.querySelector(
        "[data-action='edit-notater']"
      );
      if (notaterInput) {
        notaterInput.value = notater?.seksjonNotat || "";
      }
      const nameInput = programRootEl.querySelector(
        "[data-action='edit-program-name']"
      );
      if (nameInput) {
        nameInput.value = state.program?.pasientNavn || "";
      }
    }

    if (shouldFocusRehabSearch && programRootEl) {
      const rehabInput = programRootEl.querySelector("[data-action='rehab-search']");
      if (rehabInput) {
        const value = rehabInput.value || "";
        rehabInput.focus({ preventScroll: true });
        try {
          rehabInput.setSelectionRange(value.length, value.length);
        } catch (_error) {
          // ignore selection errors
        }
      }
      if (state.ui.rehabOverlay) {
        state.ui.rehabOverlay.focusSearch = false;
      }
    }

    renderLibrary();
    if (state.ui.librarySelection?.focusPending && els.libraryPanelEl) {
      state.ui.librarySelection.focusPending = false;
      els.libraryPanelEl.scrollTop = 0;
      if (els.libraryGridEl) {
        els.libraryGridEl.scrollTop = 0;
      }
      if (els.searchInputEl) {
        els.searchInputEl.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
      }
      els.libraryPanelEl.focus({ preventScroll: true });
    }
  }

  return {
    full,
    renderLibrary,
    setHelpers,
  };
}
