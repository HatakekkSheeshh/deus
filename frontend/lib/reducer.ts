import { initialMockState } from "./mock-data";
import type {
  AppState,
  Costs,
  DocumentItem,
  Lang,
  LibraryFile,
  Role,
  ScholarshipStatus,
  University,
  ThemePrefs,
  UniversityStatus,
  View
} from "./types";

export const initialState: AppState = initialMockState;

export type Action =
  | { type: "hydrate-state"; state: AppState }
  | { type: "login-applicant"; email: string; userId?: string }
  | { type: "login-shared"; role: "family" | "counselor"; token: string }
  | { type: "logout" }
  | { type: "set-lang"; lang: Lang }
  | { type: "set-view"; view: View }
  | { type: "set-theme"; theme: Partial<ThemePrefs> }
  | { type: "add-university"; university: University }
  | { type: "set-university-status"; id: string; status: UniversityStatus }
  | { type: "set-university-deadline"; id: string; deadline: string }
  | { type: "add-document"; document: DocumentItem }
  | { type: "update-document"; id: string; changes: Pick<DocumentItem, "name" | "category"> }
  | { type: "delete-document"; id: string }
  | { type: "toggle-document"; id: string }
  | { type: "set-cost"; key: keyof Costs; value: number }
  | { type: "set-scholarship-status"; id: string; status: ScholarshipStatus }
  | { type: "set-scholarship-deadline"; id: string; deadline: string }
  | { type: "add-custom-event"; label: string; date: string }
  | { type: "delete-custom-event"; id: string }
  | { type: "generate-token"; role: "family" | "counselor" }
  | { type: "set-access-token"; role: Extract<Role, "family" | "counselor">; token: string }
  | { type: "add-library-file"; file: LibraryFile }
  | { type: "remove-library-file"; id: string }
  | { type: "add-chat-message"; content: string; role: "user" | "assistant" };

function canMutate(state: AppState): boolean {
  return state.auth.role === "applicant";
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate-state":
      return action.state;
    case "login-applicant":
      return action.email.trim()
        ? { ...state, auth: { loggedIn: true, role: "applicant", email: action.email.trim(), userId: action.userId }, view: "dashboard" }
        : state;
    case "login-shared":
      return { ...state, auth: { loggedIn: true, role: action.role, token: action.token }, view: "dashboard" };
    case "logout":
      return { ...state, auth: { loggedIn: false, role: null }, view: "dashboard" };
    case "set-lang":
      return { ...state, lang: action.lang };
    case "set-view":
      return { ...state, view: action.view };
    case "set-theme":
      return { ...state, theme: { ...state.theme, ...action.theme } };
    case "add-university":
      if (!canMutate(state)) return state;
      return { ...state, universities: [...state.universities, action.university] };
    case "set-university-status":
      if (!canMutate(state)) return state;
      return { ...state, universities: state.universities.map((u) => u.id === action.id ? { ...u, status: action.status } : u) };
    case "set-university-deadline":
      if (!canMutate(state)) return state;
      return { ...state, universities: state.universities.map((u) => u.id === action.id ? { ...u, deadline: action.deadline } : u) };
    case "add-document":
      if (!canMutate(state)) return state;
      return { ...state, documents: [...state.documents, action.document] };
    case "update-document":
      if (!canMutate(state)) return state;
      return {
        ...state,
        documents: state.documents.map((d) => d.id === action.id ? { ...d, ...action.changes } : d)
      };
    case "delete-document":
      if (!canMutate(state)) return state;
      return { ...state, documents: state.documents.filter((d) => d.id !== action.id) };
    case "toggle-document":
      if (!canMutate(state)) return state;
      return { ...state, documents: state.documents.map((d) => d.id === action.id ? { ...d, done: !d.done } : d) };
    case "set-cost":
      if (!canMutate(state)) return state;
      return { ...state, costs: { ...state.costs, [action.key]: action.value } };
    case "set-scholarship-status":
      if (!canMutate(state)) return state;
      return { ...state, scholarships: state.scholarships.map((s) => s.id === action.id ? { ...s, status: action.status } : s) };
    case "set-scholarship-deadline":
      if (!canMutate(state)) return state;
      return { ...state, scholarships: state.scholarships.map((s) => s.id === action.id ? { ...s, deadline: action.deadline } : s) };
    case "add-custom-event":
      if (!canMutate(state)) return state;
      return { ...state, customEvents: [...state.customEvents, { id: crypto.randomUUID(), label: action.label, date: action.date }] };
    case "delete-custom-event":
      if (!canMutate(state)) return state;
      return { ...state, customEvents: state.customEvents.filter((e) => e.id !== action.id) };
    case "generate-token":
      if (!canMutate(state)) return state;
      return state;
    case "set-access-token":
      if (!canMutate(state)) return state;
      return { ...state, accessTokens: { ...state.accessTokens, [action.role]: action.token } };
    case "add-library-file":
      if (!canMutate(state)) return state;
      if (action.file.category === "other") return { ...state, otherFiles: [...state.otherFiles, action.file] };
      return { ...state, libraryFiles: [...state.libraryFiles.filter((f) => f.slotKey !== action.file.slotKey), action.file] };
    case "remove-library-file":
      if (!canMutate(state)) return state;
      return {
        ...state,
        libraryFiles: state.libraryFiles.filter((f) => f.id !== action.id),
        otherFiles: state.otherFiles.filter((f) => f.id !== action.id)
      };
    case "add-chat-message":
      return { ...state, chatMessages: [...state.chatMessages, { id: crypto.randomUUID(), role: action.role, content: action.content }] };
    default:
      return state;
  }
}
