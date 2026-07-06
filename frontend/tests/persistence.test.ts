import { initialState } from "@/lib/reducer";
import { APP_STATE_STORAGE_KEY, loadPersistedState, savePersistedState } from "@/lib/persistence";

beforeEach(() => {
  localStorage.clear();
});

it("loads a valid locally persisted app state", () => {
  const saved = { ...initialState, auth: { loggedIn: true, role: "applicant" as const, email: "local@example.com" } };
  localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify({ version: 1, state: saved }));

  expect(loadPersistedState()?.auth.email).toBe("local@example.com");
});

it("rejects invalid or mismatched persisted payloads", () => {
  localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify({ version: 999, state: initialState }));
  expect(loadPersistedState()).toBeNull();

  localStorage.setItem(APP_STATE_STORAGE_KEY, "{not json");
  expect(loadPersistedState()).toBeNull();
});

it("saves app state with a versioned envelope", () => {
  savePersistedState({ ...initialState, view: "timeline" });

  const saved = JSON.parse(localStorage.getItem(APP_STATE_STORAGE_KEY) ?? "{}");
  expect(saved.version).toBe(1);
  expect(saved.state.view).toBe("timeline");
});
