import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccessSharingView from "@/components/access/AccessSharingView";
import TimelineView from "@/components/timeline/TimelineView";
import { initialState } from "@/lib/reducer";

it("renders merged timeline source rows", () => {
  render(<TimelineView state={initialState} readOnly={false} dispatch={() => {}} />);
  expect(screen.getByText("TU Munich")).toBeInTheDocument();
  expect(screen.getByText("RWTH Aachen")).toBeInTheDocument();
  expect(screen.getByText("Saarland University")).toBeInTheDocument();
  expect(screen.getByText("KIT")).toBeInTheDocument();
});

it("renders family and counselor token cards for applicant access view", () => {
  render(<AccessSharingView accessTokens={initialState.accessTokens} theme={initialState.theme} onGenerate={() => {}} onCopy={() => {}} onThemeChange={() => {}} />);
  expect(screen.getByRole("heading", { name: /family member token/i })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: /counselor token/i })).toBeInTheDocument();
});

it("exposes theme preference controls in the access view", async () => {
  const user = userEvent.setup();
  const onThemeChange = vi.fn();
  render(<AccessSharingView accessTokens={initialState.accessTokens} theme={initialState.theme} onGenerate={() => {}} onCopy={() => {}} onThemeChange={onThemeChange} />);

  await user.click(screen.getByRole("button", { name: /cool theme/i }));
  await user.click(screen.getByRole("button", { name: /sharp corners/i }));
  await user.click(screen.getByRole("button", { name: /all sans type/i }));

  expect(onThemeChange).toHaveBeenCalledWith({ theme: "cool" });
  expect(onThemeChange).toHaveBeenCalledWith({ cornerStyle: "sharp" });
  expect(onThemeChange).toHaveBeenCalledWith({ typeCharacter: "all-sans" });
  expect(screen.getByText(/workspace preference saved locally/i)).toBeInTheDocument();
});

it("confirms when a shared token is copied", async () => {
  const user = userEvent.setup();
  render(<AccessSharingView accessTokens={initialState.accessTokens} theme={initialState.theme} onGenerate={() => {}} onCopy={() => {}} onThemeChange={() => {}} />);

  await user.click(screen.getAllByRole("button", { name: /copy token/i })[0]);

  expect(screen.getByText(/family token copied/i)).toBeInTheDocument();
});

it("lets applicants add and remove custom timeline milestones", async () => {
  const user = userEvent.setup();
  const dispatch = vi.fn();
  render(<TimelineView state={initialState} readOnly={false} dispatch={dispatch} />);

  await user.type(screen.getByLabelText(/milestone label/i), "Submit APS packet");
  await user.type(screen.getByLabelText(/milestone date/i), "2026-07-28");
  await user.click(screen.getByRole("button", { name: /add milestone/i }));
  expect(dispatch).toHaveBeenCalledWith({ type: "add-custom-event", label: "Submit APS packet", date: "2026-07-28" });

  await user.click(screen.getByRole("button", { name: /remove book visa appointment/i }));
  expect(dispatch).toHaveBeenCalledWith({ type: "delete-custom-event", id: "visa" });
});

it("keeps custom milestone remove controls aligned with the timeline date controls", () => {
  render(<TimelineView state={initialState} readOnly={false} dispatch={() => {}} />);

  const remove = screen.getByRole("button", { name: /remove book visa appointment/i });
  const actions = remove.closest(".timeline-actions");

  expect(actions).not.toBeNull();
  expect(actions?.querySelector(".timeline-date-input")).not.toBeNull();
  expect(actions).toContainElement(remove);
  expect(actions?.firstElementChild).toBe(remove);
});
