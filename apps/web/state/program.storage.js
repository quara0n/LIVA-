export const DRAFT_STORAGE_KEY = "liva.programDraft.v1";
export const ARCHIVE_STORAGE_KEY = "liva.programArchive.v1";
export const ACTIVE_PROGRAM_ID_KEY = "liva.activeProgramId.v1";

export function saveDraft(program) {
  if (typeof window === "undefined" || !window.localStorage) return;
  if (!program) return;
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(program));
  } catch (_error) {
    // Ignore storage failures in MVP.
  }
}

export function loadDraft() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (_error) {
    // Ignore storage failures in MVP.
  }
}

export function loadArchive() {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

export function saveArchive(archive) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      ARCHIVE_STORAGE_KEY,
      JSON.stringify(Array.isArray(archive) ? archive : [])
    );
  } catch (_error) {
    // Ignore storage failures in MVP.
  }
}

export function loadActiveProgramId() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    return window.localStorage.getItem(ACTIVE_PROGRAM_ID_KEY);
  } catch (_error) {
    return null;
  }
}

export function saveActiveProgramId(id) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (!id) {
      window.localStorage.removeItem(ACTIVE_PROGRAM_ID_KEY);
      return;
    }
    window.localStorage.setItem(ACTIVE_PROGRAM_ID_KEY, String(id));
  } catch (_error) {
    // Ignore storage failures in MVP.
  }
}
