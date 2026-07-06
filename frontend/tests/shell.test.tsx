import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppShell from "@/components/AppShell";
import { ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";
import { APP_STATE_STORAGE_KEY } from "@/lib/persistence";

beforeEach(() => {
  localStorage.clear();
});

it("shows access sharing only to applicant role", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.type(screen.getByLabelText(/email/i), "applicant@example.com");
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));
  expect(screen.getByRole("button", { name: /access/i })).toBeInTheDocument();
});

it("autosaves reducer changes locally and shows the save boundary", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.type(screen.getByLabelText(/email/i), "applicant@example.com");
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));

  expect(screen.getByText(/saved locally on this device/i)).toBeInTheDocument();
  expect(screen.getByText(/api sync later/i)).toBeInTheDocument();
  expect(localStorage.getItem(APP_STATE_STORAGE_KEY)).toContain("applicant@example.com");
});

it("persists quick start dismissal locally", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.type(screen.getByLabelText(/email/i), "applicant@example.com");
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));

  expect(screen.getByRole("heading", { name: /quick start/i })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /dismiss quick start/i }));

  expect(screen.queryByRole("heading", { name: /quick start/i })).not.toBeInTheDocument();
  expect(localStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe("dismissed");
});

it("rejects invalid applicant email before entering the app", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.type(screen.getByLabelText(/email/i), "not-an-email");
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));
  expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /access/i })).not.toBeInTheDocument();
});

it("lets logged-in users log out from the shell", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.type(screen.getByLabelText(/email/i), "applicant@example.com");
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));
  await user.click(screen.getByRole("button", { name: /log out/i }));
  expect(screen.getByRole("button", { name: /continue as applicant/i })).toBeInTheDocument();
});

it("shows inline error for invalid shared token", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.type(screen.getByLabelText(/access token/i), "BAD-TOKEN");
  await user.click(screen.getByRole("button", { name: /continue with token/i }));
  expect(screen.getByText(/invalid/i)).toBeInTheDocument();
});
