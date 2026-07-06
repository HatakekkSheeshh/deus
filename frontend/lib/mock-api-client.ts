import type { ApiClient } from "./api-client";
import { costs, documents, initialMockState, libraryFiles, scholarships, universities } from "./mock-data";

export const mockApiClient: ApiClient = {
  async getUniversities() {
    return universities;
  },
  async getDocuments() {
    return documents;
  },
  async getLibrary() {
    return { fixed: libraryFiles, other: [] };
  },
  async getCosts() {
    return costs;
  },
  async getScholarships() {
    return scholarships;
  },
  async redeemToken(token) {
    if (token === initialMockState.accessTokens.family) return { role: "family", token };
    if (token === initialMockState.accessTokens.counselor) return { role: "counselor", token };
    throw new Error("Invalid token");
  },
  async logout() {}
};
