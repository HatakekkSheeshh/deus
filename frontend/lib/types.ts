export type Role = "applicant" | "family" | "counselor";
export type Lang = "en" | "de" | "vi";
export type View =
  | "dashboard"
  | "universities"
  | "documents"
  | "library"
  | "cost"
  | "timeline"
  | "scholarships"
  | "access";

export type UniversityStatus = "Not started" | "Researching" | "In progress" | "Submitted" | "Offer";
export type ScholarshipStatus = "Not applied" | "In progress" | "Applied" | "Awarded";
export type TimelineSource = "university" | "scholarship" | "custom";
export type LibraryCategory = "german" | "prep" | "certs" | "other";

export interface AuthState {
  loggedIn: boolean;
  role: Role | null;
  userId?: string;
  email?: string;
  token?: string;
}

export interface University {
  id: string;
  name: string;
  program: string;
  city: string;
  gpaReq: string;
  languageReq: string;
  apsRequired: boolean;
  tuitionPerSemester: number;
  deadline: string;
  status: UniversityStatus;
  link: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: "Academic" | "Personal" | "Language" | "APS & uni-assist" | "Financial";
  done: boolean;
}

export interface LibraryFile {
  id: string;
  slotKey: string | null;
  category: LibraryCategory;
  name: string;
  storagePath?: string;
  fileUrl?: string;
  fileName?: string;
  sizeBytes?: number;
  uploadedAt?: string;
}

export interface Costs {
  blockedAccountYear: number;
  semesterFee: number;
  apsFee: number;
  uniAssistFee: number;
  visaFee: number;
  tuitionPerSemester: number;
  healthInsuranceMonthly: number;
  months: number;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  deadline: string | null;
  link: string;
  status: ScholarshipStatus;
}

export interface CustomEvent {
  id: string;
  label: string;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ThemePrefs {
  theme: "warm" | "cool" | "forest" | "terracotta";
  cornerStyle: "soft" | "sharp";
  typeCharacter: "serif-led" | "all-sans";
}

export interface AppState {
  auth: AuthState;
  accessTokens: { family: string | null; counselor: string | null };
  lang: Lang;
  view: View;
  theme: ThemePrefs;
  universities: University[];
  documents: DocumentItem[];
  libraryFiles: LibraryFile[];
  otherFiles: LibraryFile[];
  costs: Costs;
  scholarships: Scholarship[];
  customEvents: CustomEvent[];
  chatMessages: ChatMessage[];
}
