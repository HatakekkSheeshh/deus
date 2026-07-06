import { initialState } from "./reducer";
import type { AppState } from "./types";

export const APP_STATE_STORAGE_KEY = "german-master.application-state";
const STORAGE_VERSION = 1;

interface PersistedEnvelope {
  version: number;
  state: AppState;
}

function isBrowserStorageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppState>;
  return Boolean(
    candidate.auth &&
    candidate.accessTokens &&
    candidate.theme &&
    Array.isArray(candidate.universities) &&
    Array.isArray(candidate.documents) &&
    Array.isArray(candidate.scholarships) &&
    Array.isArray(candidate.customEvents)
  );
}

export function loadPersistedState(): AppState | null {
  if (!isBrowserStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedEnvelope>;
    if (parsed.version !== STORAGE_VERSION || !isAppState(parsed.state)) return null;
    return { ...initialState, ...parsed.state };
  } catch {
    return null;
  }
}

export function savePersistedState(state: AppState): boolean {
  if (!isBrowserStorageAvailable()) return false;
  try {
    window.localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, state }));
    return true;
  } catch {
    return false;
  }
}
