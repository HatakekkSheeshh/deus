export const ONBOARDING_STORAGE_KEY = "german-master.quick-start";

export function loadQuickStartDismissed() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "dismissed";
  } catch {
    return false;
  }
}

export function saveQuickStartDismissed() {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "dismissed");
    return true;
  } catch {
    return false;
  }
}
