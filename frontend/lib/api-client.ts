import type { Costs, DocumentItem, LibraryFile, Scholarship, University } from "./types";

export interface ApiClient {
  getUniversities(): Promise<University[]>;
  getDocuments(): Promise<DocumentItem[]>;
  getLibrary(): Promise<{ fixed: LibraryFile[]; other: LibraryFile[] }>;
  getCosts(): Promise<Costs>;
  getScholarships(): Promise<Scholarship[]>;
  redeemToken(token: string): Promise<{ role: "family" | "counselor"; token: string }>;
  logout(): Promise<void>;
}
