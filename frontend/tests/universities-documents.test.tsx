import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
