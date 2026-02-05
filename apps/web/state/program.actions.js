export function createProgramActions({ state, saveDraft, render, showToast }) {
  function makeId(prefix) {
    if (crypto && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function nowIso() {
    return new Date().toISOString();
  }

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
    saveDraft(state.program);
    render.full();
  }

  function removeExercise(instansId) {
    const hoveddel = getHoveddelSection();
    hoveddel.ovelser = hoveddel.ovelser.filter(
      (o) => o.ovelseInstansId !== instansId
    );
    delete state.ui.altSectionOpen[instansId];
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
    saveDraft(state.program);
  }

  function setSekundar(instansId, field, value) {
    updateSekundar(instansId, field, value);
  }

  function setAltCustom(value) {
    if (!state.ui.altPicker) return;
    state.ui.altPicker.narBrukesEgendefinertTekst = value;
  }

  function createProgramFromStart(pasientNavn, pasientEpost) {
    if (state.program) return;
    state.program = createEmptyDraft();
    state.program.pasientNavn = (pasientNavn || "").trim();
    state.program.pasientEpost = (pasientEpost || "").trim();
    saveDraft(state.program);
    render.full();
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
    createProgramFromStart,
  };
}

