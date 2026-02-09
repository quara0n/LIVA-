export function createRenderer({ state, els, helpers: initialHelpers }) {
  let helpers = initialHelpers;

  function setHelpers(nextHelpers) {
    helpers = nextHelpers;
  }

  const programRootEl = els.programRootEl;

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

  function renderProgramItems() {
    const hoveddel = helpers.getHoveddelSection();
    if (!hoveddel) return "";
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

    const items = hoveddel.ovelser
      .map((instans, index) => {
        const master = helpers.getMasterById(instans.ovelseId);
        const emoji = master?.emoji || "🏃";
        const video = getVideoForExercise(instans.ovelseId);
        const videoUrl = video?.url || "";
        const videoFilename = getVideoFilename(videoUrl);
        const thumbBase = videoFilename.replace(/\.mp4$/i, "");
        const thumbUrl = videoFilename ? videoAssetUrl(`${thumbBase}.jpg`) : "";
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
            <div class="exercise-title" style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;">
              <h4>${instans.navn}</h4>
              <div style="display:flex;gap:12px;align-items:flex-start;">
                <div style="position:relative;width:140px;height:140px;overflow:hidden;border-radius:10px;border:1px solid var(--border);flex:0 0 auto;">
                  ${
                    thumbUrl
                      ? `<img src="${thumbUrl}" alt="${instans.navn}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'emoji',textContent:'${emoji}'}));" />`
                      : `<span class="emoji">${emoji}</span>`
                  }
                  ${
                    videoFilename
                      ? `<button class="action-btn" data-action="open-inline-video" data-video-filename="${videoFilename}" data-video-title="${instans.navn}" style="position:absolute;top:4px;right:4px;background:rgba(255,255,255,0.35);border:1px solid rgba(0,0,0,0.12);box-shadow:0 1px 4px rgba(0,0,0,0.08);">▶</button>`
                      : ""
                  }
                </div>
                <div style="display:flex;align-items:center;gap:6px;">
                  <input class="inline-input" type="number" min="0" value="${instans.dosering.reps || 0}" data-action="edit-field" data-instans-id="${instans.ovelseInstansId}" data-field="reps" />
                  <span class="times">×</span>
                  <input class="inline-input" type="number" min="0" value="${instans.dosering.sett || 0}" data-action="edit-field" data-instans-id="${instans.ovelseInstansId}" data-field="sett" />
                </div>
              </div>
              <div class="inline-actions">
                <button class="inline-btn" data-action="toggle-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="progresjon">+ Progresjon</button>
                <button class="inline-btn" data-action="toggle-alt" data-instans-id="${instans.ovelseInstansId}" data-retning="regresjon">− Regresjon</button>
              </div>
            </div>
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

    return items || '<p class="hint">Ingen øvelser lagt til ennå.</p>';
  }

  function renderLibrary() {
    if (!els.libraryGridEl) return;
    const query = helpers.normalize(state.search);
    const filtered = state.library.filter((item) => helpers.matchesSearch(item, query));
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

    els.libraryGridEl.innerHTML = filtered
      .map((item) => {
        const disabled = helpers.isInProgram(item.ovelseId);
        const video = getVideoForExercise(item.ovelseId);
        const videoUrl = video?.url || "";
        const videoFilename = getVideoFilename(videoUrl);
        const displayName =
          item.ovelseId === "goblet-kneboy" ? "45 graders knebøy" : item.navn || "Forhåndsvis video";
        const thumbBase = videoFilename.replace(/\.mp4$/i, "");
        const thumbUrl = videoFilename ? videoAssetUrl(`${thumbBase}.jpg`) : "";
        return `
        <div class="library-card" style="position:relative;">
          <div style="position:relative;height:140px;overflow:hidden;border-radius:10px;">
            ${
              thumbUrl
                ? `<img src="${thumbUrl}" alt="${displayName}" style="width:100%;height:100%;object-fit:cover;display:block;border:1px solid var(--border);filter:contrast(0.92);" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'emoji',textContent:'${item.emoji || "💪"}'}));" />`
                : `<div class="emoji">${item.emoji || "💪"}</div>`
            }
            <div style="position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:flex-end;gap:8px;background:transparent;border-radius:10px;padding:8px;">
              <button class="action-btn" data-action="add-exercise" data-ovelse-id="${item.ovelseId}" ${disabled ? "disabled" : ""} style="background:rgba(255,255,255,0.35);border:1px solid rgba(0,0,0,0.12);box-shadow:0 1px 4px rgba(0,0,0,0.08);">+</button>
              ${
                video && videoFilename
                  ? `<button class="action-btn" data-action="open-inline-video" data-ovelse-id="${item.ovelseId}" data-video-filename="${videoFilename}" data-video-title="${displayName}" style="background:rgba(255,255,255,0.35);border:1px solid rgba(0,0,0,0.12);box-shadow:0 1px 4px rgba(0,0,0,0.08);">▶</button>`
                  : ""
              }
            </div>
          </div>
          <h4>${displayName}</h4>
        </div>
      `;
      })
      .join("");
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
              <button class="action-btn" data-action="open-start-details" data-mode="template">Start fra mal</button>
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
    const hoveddel = helpers.getHoveddelSection();
    const hasExercises = Boolean(hoveddel && hoveddel.ovelser.length > 0);
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

  function renderBuilder() {
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
            <button class="action-btn" data-action="save-program">Lagre</button>
            <button class="action-btn" data-action="start-new-program">Nytt program</button>
            <button class="action-btn" data-action="start-template">Start fra mal</button>
            <button class="action-btn" data-action="load-program">Hent program</button>
          </div>
        </div>

        <div class="section" id="section-hoveddel">
          <div class="section-body exercise-list" id="hoveddel-list">
            ${renderProgramItems()}
          </div>
        </div>

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

    if (programRootEl) {
      if (panelView === "load") {
        programRootEl.innerHTML = `${renderArchiveList()}${renderVideoPreviewModal()}`;
      } else if (panelView === "templates") {
        programRootEl.innerHTML = `${renderTemplatesList()}${renderVideoPreviewModal()}`;
      } else if (panelView === "start-details") {
        programRootEl.innerHTML = `${renderStartDetails()}${renderVideoPreviewModal()}`;
      } else if (isBuilder) {
        programRootEl.innerHTML = `${renderBuilder()}${renderVideoPreviewModal()}`;
      } else {
        programRootEl.innerHTML = `${renderStartState()}${renderVideoPreviewModal()}`;
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

    const hoveddel = helpers.getHoveddelSection();
    const manglerUtforelse = isBuilder
      ? helpers.finnOvelserUtenUtforelse(state.program)
      : [];
    if (els.exportBtn) {
      els.exportBtn.disabled =
        !isBuilder ||
        !hoveddel ||
        hoveddel.ovelser.length === 0 ||
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
    renderLibrary();
  }

  return {
    full,
    renderLibrary,
    setHelpers,
  };
}
