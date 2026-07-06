import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardView from "@/components/dashboard/DashboardView";
import { initialState } from "@/lib/reducer";

it("renders dashboard stats from derived state", () => {
  render(<DashboardView state={initialState} onNavigate={() => {}} />);
  expect(screen.getByText(/universities shortlisted/i)).toBeInTheDocument();
  expect(screen.getByText(/documents ready/i)).toBeInTheDocument();
  expect(screen.getByText(/est. year-1 cost/i)).toBeInTheDocument();
  expect(screen.getByText(/next deadline/i)).toBeInTheDocument();
});

it("surfaces a next best action and navigates to the right area", async () => {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(<DashboardView state={initialState} onNavigate={onNavigate} />);

  expect(screen.getByRole("heading", { name: /next best action/i })).toBeInTheDocument();
  expect(screen.getByText(/finish statement of purpose/i)).toBeInTheDocument();
  expect(screen.getByText(/reason: missing required document/i)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /open documents/i }));
  expect(onNavigate).toHaveBeenCalledWith("documents");
});

it("explains key admissions terms on the dashboard", () => {
  render(<DashboardView state={initialState} onNavigate={() => {}} />);

  expect(screen.getByRole("heading", { name: /admissions glossary/i })).toBeInTheDocument();
  const glossary = screen.getByRole("region", { name: /admissions glossary/i });
  expect(within(glossary).getByText("APS")).toBeInTheDocument();
  expect(within(glossary).getByText("uni-assist")).toBeInTheDocument();
  expect(within(glossary).getByText("Blocked account")).toBeInTheDocument();
  expect(within(glossary).getByText("DAAD")).toBeInTheDocument();
  expect(within(glossary).getByText(/academic evaluation center/i)).toBeInTheDocument();
});

it("can show a dismissable quick start panel", async () => {
  const user = userEvent.setup();
  const onDismiss = vi.fn();
  render(<DashboardView state={initialState} onNavigate={() => {}} showQuickStart onDismissQuickStart={onDismiss} />);

  expect(screen.getByRole("heading", { name: /quick start/i })).toBeInTheDocument();
  expect(screen.getByText(/review next deadline/i)).toBeInTheDocument();
  expect(screen.getByText(/finish blocking document/i)).toBeInTheDocument();
  expect(screen.getByText(/confirm local autosave/i)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /dismiss quick start/i }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});
