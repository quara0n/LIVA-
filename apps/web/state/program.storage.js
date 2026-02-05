export const DRAFT_STORAGE_KEY = "liva.programDraft.v1";

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
