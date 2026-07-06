import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DocumentChecklist from "@/components/documents/DocumentChecklist";
import UniversityCard from "@/components/universities/UniversityCard";
import UniversitiesView from "@/components/universities/UniversitiesView";
import { initialState } from "@/lib/reducer";

it("disables university status select in read-only mode", () => {
  render(<UniversityCard university={initialState.universities[0]} readOnly onStatusChange={() => {}} />);
  expect(screen.getByRole("combobox")).toBeDisabled();
});

it("filters universities by application status", async () => {
  const user = userEvent.setup();
  render(<UniversitiesView universities={initialState.universities} readOnly={false} dispatch={vi.fn()} />);

  await user.selectOptions(screen.getByLabelText(/filter by status/i), "Submitted");

  expect(screen.getByText(/saarland university/i)).toBeInTheDocument();
  expect(screen.queryByText(/rwth aachen/i)).not.toBeInTheDocument();
  expect(screen.getByText(/1 of 4 shown/i)).toBeInTheDocument();
});

it("shows a no-results empty state when filters hide every university", async () => {
  const user = userEvent.setup();
  const universities = initialState.universities.map((university) => ({ ...university, status: "Researching" as const }));
  render(<UniversitiesView universities={universities} readOnly={false} dispatch={vi.fn()} />);

  await user.selectOptions(screen.getByLabelText(/filter by status/i), "Offer");

  expect(screen.getByText(/no universities match this filter/i)).toBeInTheDocument();
  expect(screen.getByText(/try a different status/i)).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /clear filter/i }));
  expect(screen.getByText(/4 of 4 shown/i)).toBeInTheDocument();
});

it("lets applicants submit a manual university", async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn();
  render(<UniversitiesView universities={initialState.universities} readOnly={false} dispatch={dispatch} />);

  await user.click(screen.getByRole("button", { name: /add university/i }));
  await user.type(screen.getByLabelText(/university name/i), "Heinrich Heine University");
  await user.type(screen.getByLabelText(/program name/i), "MSc Artificial Intelligence");
  await user.type(screen.getByLabelText(/city/i), "Dusseldorf");
  await user.type(screen.getByLabelText(/deadline/i), "2026-09-15");
  await user.click(screen.getByLabelText(/aps required/i));
  await user.type(screen.getByLabelText(/tuition/i), "0");
  await user.type(screen.getByLabelText(/program link/i), "https://www.hhu.de/");
  await user.click(screen.getByRole("button", { name: /save university/i }));

  expect(dispatch).toHaveBeenCalledWith({
    type: "add-university",
    university: expect.objectContaining({
      name: "Heinrich Heine University",
      program: "MSc Artificial Intelligence",
      city: "Dusseldorf",
      deadline: "2026-09-15",
      apsRequired: true,
      tuitionPerSemester: 0,
      status: "Not started",
      link: "https://www.hhu.de/"
    })
  });
});

it("rejects invalid manual university values with recoverable errors", async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn();
  render(<UniversitiesView universities={initialState.universities} readOnly={false} dispatch={dispatch} />);

  await user.click(screen.getByRole("button", { name: /add university/i }));
  await user.type(screen.getByLabelText(/university name/i), "Invalid Link University");
  await user.type(screen.getByLabelText(/program name/i), "MSc Edge Cases");
  await user.type(screen.getByLabelText(/city/i), "Berlin");
  await user.type(screen.getByLabelText(/deadline/i), "2026-09-15");
  await user.clear(screen.getByLabelText(/tuition/i));
  await user.type(screen.getByLabelText(/tuition/i), "500");
  await user.type(screen.getByLabelText(/program link/i), "not-a-url");
  await user.click(screen.getByRole("button", { name: /save university/i }));

  expect(screen.getByText(/enter a valid http or https program link/i)).toBeInTheDocument();
  expect(dispatch).not.toHaveBeenCalled();

  await user.clear(screen.getByLabelText(/program link/i));
  await user.type(screen.getByLabelText(/program link/i), "https://example.edu/program");
  await user.clear(screen.getByLabelText(/tuition/i));
  await user.type(screen.getByLabelText(/tuition/i), "-1");
  await user.click(screen.getByRole("button", { name: /save university/i }));

  expect(screen.getByText(/tuition cannot be negative/i)).toBeInTheDocument();
  expect(dispatch).not.toHaveBeenCalled();
});

it("lets applicants create, edit, and delete documents", async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn();
  const firstDocument = initialState.documents[0];
  render(<DocumentChecklist documents={initialState.documents} readOnly={false} dispatch={dispatch} />);

  await user.click(screen.getByRole("button", { name: /add document/i }));
  await user.type(screen.getByLabelText(/document name/i), "Updated CV");
  await user.selectOptions(screen.getByLabelText(/document category/i), "Personal");
  await user.click(screen.getByRole("button", { name: /save document/i }));

  await user.click(screen.getByRole("button", { name: new RegExp(`edit ${firstDocument.name}`, "i") }));
  await user.clear(screen.getByLabelText(/edit document name/i));
  await user.type(screen.getByLabelText(/edit document name/i), "Final transcript");
  await user.selectOptions(screen.getByLabelText(/edit document category/i), "Academic");
  await user.click(screen.getByRole("button", { name: /save changes/i }));

  await user.click(screen.getByRole("button", { name: new RegExp(`delete ${firstDocument.name}`, "i") }));
  await user.click(screen.getByRole("button", { name: new RegExp(`delete document ${firstDocument.name}`, "i") }));

  expect(dispatch).toHaveBeenCalledWith({
    type: "add-document",
    document: expect.objectContaining({
      name: "Updated CV",
      category: "Personal",
      done: false
    })
  });
  expect(dispatch).toHaveBeenCalledWith({
    type: "update-document",
    id: firstDocument.id,
    changes: { name: "Final transcript", category: "Academic" }
  });
  expect(dispatch).toHaveBeenCalledWith({ type: "delete-document", id: firstDocument.id });
});

it("shows document validation instead of silently ignoring empty names", async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn();
  const firstDocument = initialState.documents[0];
  render(<DocumentChecklist documents={initialState.documents} readOnly={false} dispatch={dispatch} />);

  await user.click(screen.getByRole("button", { name: /add document/i }));
  await user.click(screen.getByRole("button", { name: /save document/i }));

  expect(screen.getByText(/enter a document name before saving/i)).toBeInTheDocument();
  expect(dispatch).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: /close form/i }));
  await user.click(screen.getByRole("button", { name: new RegExp(`edit ${firstDocument.name}`, "i") }));
  await user.clear(screen.getByLabelText(/edit document name/i));
  await user.click(screen.getByRole("button", { name: /save changes/i }));

  expect(screen.getAllByText(/enter a document name before saving/i)).toHaveLength(1);
  expect(dispatch).not.toHaveBeenCalled();
});

it("keeps document create, edit, and delete controls read-only for shared roles", () => {
  const firstDocument = initialState.documents[0];
  render(<DocumentChecklist documents={initialState.documents} readOnly dispatch={vi.fn()} />);

  expect(screen.getByRole("button", { name: /add document/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: new RegExp(`edit ${firstDocument.name}`, "i") })).toBeDisabled();
  expect(screen.getByRole("button", { name: new RegExp(`delete ${firstDocument.name}`, "i") })).toBeDisabled();
});
