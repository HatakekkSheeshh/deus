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

it("renders the cost breakdown as a pie chart with itemized values", () => {
  render(<DashboardView state={initialState} onNavigate={() => {}} />);

  expect(screen.getByRole("heading", { name: /cost breakdown/i })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /cost breakdown pie chart/i })).toBeInTheDocument();
  expect(screen.queryByText("86%")).not.toBeInTheDocument();

  const legend = screen.getByRole("list", { name: /cost breakdown legend/i });
  expect(within(legend).getByText(/blocked account \(1 year\)/i)).toBeInTheDocument();
  expect(within(legend).getByText("\u20ac11,904")).toBeInTheDocument();
  expect(within(legend).getByText(/health insurance/i)).toBeInTheDocument();
  expect(within(legend).getByText("\u20ac1,320")).toBeInTheDocument();
  expect(within(legend).getByText(/semester contribution fee/i)).toBeInTheDocument();
  expect(within(legend).getByText("\u20ac250")).toBeInTheDocument();
  expect(within(legend).getByText(/tuition \(if applicable\)/i)).toBeInTheDocument();
  expect(within(legend).getByText("\u20ac0")).toBeInTheDocument();
  expect(within(legend).getByText(/aps certificate fee/i)).toBeInTheDocument();
  expect(within(legend).getByText("\u20ac200")).toBeInTheDocument();
  expect(within(legend).getByText(/uni-assist processing fee/i)).toBeInTheDocument();
  expect(within(legend).getByText("\u20ac150")).toBeInTheDocument();
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

it("renders upcoming deadlines as a light preview list with a timeline shortcut", async () => {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(<DashboardView state={initialState} onNavigate={onNavigate} />);

  const panel = screen.getByRole("region", { name: /upcoming deadlines/i });
  await user.click(within(panel).getByRole("button", { name: /view timeline/i }));
  expect(onNavigate).toHaveBeenCalledWith("timeline");

  const list = within(panel).getByRole("list", { name: /upcoming deadlines/i });
  expect(within(list).getAllByRole("listitem")).toHaveLength(4);
  expect(within(list).getAllByText(/custom milestone/i)).toHaveLength(2);
  expect(within(list).getByText(/university application deadline/i)).toBeInTheDocument();
  expect(within(list).getByText(/scholarship deadline/i)).toBeInTheDocument();
  expect(within(list).getAllByText(/in \d+d/i)[0]).toBeInTheDocument();
  expect(within(panel).queryByText(/days/i)).not.toBeInTheDocument();
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
