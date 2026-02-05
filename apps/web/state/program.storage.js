export const DRAFT_STORAGE_KEY = "liva.programDraft.v1";

export function saveDraft(_program) {
  // Bevisst ingen persistens i MVP-flyten her:
  // refresh/nullstilling skal gi tom startstate.
}

export function loadDraft() {
  return null;
}
