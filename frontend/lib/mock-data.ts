import type { AppState, Costs, CustomEvent, DocumentItem, LibraryFile, Scholarship, University } from "./types";

export const universities: University[] = [
  {
    id: "tum",
    name: "TU Munich",
    program: "MSc Data Engineering and Analytics",
    city: "Munich",
    gpaReq: "2.5 German scale",
    languageReq: "IELTS 6.5 / TOEFL 88",
    apsRequired: true,
    tuitionPerSemester: 6000,
    deadline: "2026-08-01",
    status: "In progress",
    link: "https://www.tum.de/"
  },
  {
    id: "rwth",
    name: "RWTH Aachen",
    program: "MSc Software Systems Engineering",
    city: "Aachen",
    gpaReq: "Good Bachelor's degree",
    languageReq: "IELTS 6.5",
    apsRequired: true,
    tuitionPerSemester: 0,
    deadline: "2026-07-31",
    status: "Researching",
    link: "https://www.rwth-aachen.de/"
  },
  {
    id: "saarland",
    name: "Saarland University",
    program: "MSc Visual Computing",
    city: "Saarbruecken",
    gpaReq: "Relevant CS background",
    languageReq: "TOEFL 95 / IELTS 7.0",
    apsRequired: true,
    tuitionPerSemester: 0,
    deadline: "2026-07-15",
    status: "Submitted",
    link: "https://www.uni-saarland.de/"
  },
  {
    id: "kit",
    name: "KIT",
    program: "MSc Remote Sensing and Geoinformatics",
    city: "Karlsruhe",
    gpaReq: "Above average degree",
    languageReq: "IELTS 6.5",
    apsRequired: true,
    tuitionPerSemester: 1500,
    deadline: "2026-09-30",
    status: "Not started",
    link: "https://www.kit.edu/"
  }
];

export const documents: DocumentItem[] = [
  { id: "transcript", name: "Official transcript", category: "Academic", done: true },
  { id: "degree", name: "Bachelor degree certificate", category: "Academic", done: true },
  { id: "cv", name: "Academic CV", category: "Personal", done: true },
  { id: "sop", name: "Statement of purpose", category: "Personal", done: false },
  { id: "passport", name: "Passport scan", category: "Personal", done: true },
  { id: "ielts", name: "English certificate", category: "Language", done: false },
  { id: "german", name: "German certificate if available", category: "Language", done: false },
  { id: "aps", name: "APS certificate", category: "APS & uni-assist", done: false },
  { id: "uni-assist", name: "uni-assist account proof", category: "APS & uni-assist", done: false },
  { id: "blocked", name: "Blocked account estimate", category: "Financial", done: true },
  { id: "insurance", name: "Health insurance plan", category: "Financial", done: false }
];

export const costs: Costs = {
  blockedAccountYear: 11904,
  semesterFee: 250,
  apsFee: 200,
  uniAssistFee: 75,
  visaFee: 75,
  tuitionPerSemester: 0,
  healthInsuranceMonthly: 110,
  months: 12
};

export const scholarships: Scholarship[] = [
  {
    id: "daad",
    name: "DAAD Study Scholarships",
    provider: "DAAD",
    amount: "Varies",
    deadline: "2026-07-20",
    link: "https://www.daad.de/",
    status: "In progress"
  },
  {
    id: "deutschlandstipendium",
    name: "Deutschlandstipendium",
    provider: "German universities",
    amount: "300 EUR / month",
    deadline: "2026-08-15",
    link: "https://www.deutschlandstipendium.de/",
    status: "Not applied"
  },
  {
    id: "erasmus",
    name: "Erasmus+ Mobility Grant",
    provider: "EU",
    amount: "Monthly support",
    deadline: null,
    link: "https://erasmus-plus.ec.europa.eu/",
    status: "Applied"
  }
];

export const customEvents: CustomEvent[] = [
  { id: "visa", label: "Book visa appointment", date: "2026-07-10" },
  { id: "blocked-account", label: "Open blocked account", date: "2026-07-25" }
];

export const libraryFiles: LibraryFile[] = [
  { id: "german-a1", slotKey: "german", category: "german", name: "German A1 certificate", fileName: "german-a1.pdf", sizeBytes: 420000 },
  { id: "ielts-cert", slotKey: "certs", category: "certs", name: "IELTS certificate", fileName: "ielts.pdf", sizeBytes: 860000 }
];

export const initialMockState: AppState = {
  auth: { loggedIn: false, role: null },
  accessTokens: { family: "FAM-2026-DEMO", counselor: "COU-2026-DEMO" },
  lang: "en",
  view: "dashboard",
  theme: { theme: "warm", cornerStyle: "soft", typeCharacter: "serif-led" },
  universities,
  documents,
  libraryFiles,
  otherFiles: [],
  costs,
  scholarships,
  customEvents,
  chatMessages: [
    { id: "welcome", role: "assistant", content: "Ask about deadlines, documents, costs, scholarships, or next steps." }
  ]
};
