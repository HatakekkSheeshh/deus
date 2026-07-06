import { appReducer, initialState } from "@/lib/reducer";
import type { DocumentItem, University } from "@/lib/types";

const manualUniversity: University = {
  id: "manual-hhu",
  name: "Heinrich Heine University",
  program: "MSc Artificial Intelligence",
  city: "Dusseldorf",
  gpaReq: "Check program page",
  languageReq: "IELTS 6.5",
  apsRequired: true,
  tuitionPerSemester: 0,
  deadline: "2026-09-15",
  status: "Not started",
  link: "https://www.hhu.de/"
};

const manualDocument: DocumentItem = {
  id: "manual-cv",
  name: "Updated CV",
  category: "Personal",
  done: false
};

it("hydrates a persisted state snapshot after the initial render", () => {
  const persisted = {
    ...initialState,
    auth: { loggedIn: true, role: "applicant" as const, email: "local@example.com" },
    view: "timeline" as const
  };

  const next = appReducer(initialState, { type: "hydrate-state", state: persisted });

  expect(next).toBe(persisted);
  expect(next.auth).toMatchObject({ loggedIn: true, role: "applicant", email: "local@example.com" });
  expect(next.view).toBe("timeline");
});

it("adds a manual university for the applicant role", () => {
  const state = {
    ...initialState,
    auth: { loggedIn: true, role: "applicant" as const, email: "applicant@example.com" }
  };

  const next = appReducer(state, { type: "add-university", university: manualUniversity });

  expect(next.universities).toHaveLength(initialState.universities.length + 1);
  expect(next.universities.at(-1)).toMatchObject({
    name: "Heinrich Heine University",
    status: "Not started"
  });
});

it("does not add a manual university for read-only shared roles", () => {
  const state = {
    ...initialState,
    auth: { loggedIn: true, role: "family" as const, token: "FAM-123456" }
  };

  const next = appReducer(state, { type: "add-university", university: manualUniversity });

  expect(next).toBe(state);
});

it("adds a manual document for the applicant role", () => {
  const state = {
    ...initialState,
    auth: { loggedIn: true, role: "applicant" as const, email: "applicant@example.com" }
  };

  const next = appReducer(state, { type: "add-document", document: manualDocument });

  expect(next.documents).toHaveLength(initialState.documents.length + 1);
  expect(next.documents.at(-1)).toMatchObject({
    name: "Updated CV",
    category: "Personal",
    done: false
  });
});

it("updates a document name and category for the applicant role", () => {
  const state = {
    ...initialState,
    auth: { loggedIn: true, role: "applicant" as const, email: "applicant@example.com" }
  };

  const next = appReducer(state, {
    type: "update-document",
    id: initialState.documents[0].id,
    changes: { name: "Final transcript", category: "Academic" }
  });

  expect(next.documents[0]).toMatchObject({
    name: "Final transcript",
    category: "Academic"
  });
});

it("deletes a document for the applicant role", () => {
  const state = {
    ...initialState,
    auth: { loggedIn: true, role: "applicant" as const, email: "applicant@example.com" }
  };

  const next = appReducer(state, { type: "delete-document", id: initialState.documents[0].id });

  expect(next.documents).toHaveLength(initialState.documents.length - 1);
  expect(next.documents.some((document) => document.id === initialState.documents[0].id)).toBe(false);
});

it("does not create, edit, or delete documents for read-only shared roles", () => {
  const state = {
    ...initialState,
    auth: { loggedIn: true, role: "family" as const, token: "FAM-123456" }
  };

  expect(appReducer(state, { type: "add-document", document: manualDocument })).toBe(state);
  expect(appReducer(state, {
    type: "update-document",
    id: initialState.documents[0].id,
    changes: { name: "Final transcript", category: "Academic" }
  })).toBe(state);
  expect(appReducer(state, { type: "delete-document", id: initialState.documents[0].id })).toBe(state);
});
