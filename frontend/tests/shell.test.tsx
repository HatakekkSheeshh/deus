import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppShell from "@/components/AppShell";
import { ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";
import { APP_STATE_STORAGE_KEY } from "@/lib/persistence";

beforeEach(() => {
  localStorage.clear();
});

async function enterApplicantCredentials(user: ReturnType<typeof userEvent.setup>, email = "applicant@example.com", password = "application-2026") {
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByPlaceholderText(/8\+ characters/i), password);
}

it("shows access sharing only to applicant role", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await enterApplicantCredentials(user);
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));
  expect(screen.getByRole("button", { name: /access/i })).toBeInTheDocument();
});

it("autosaves reducer changes locally and shows the save boundary", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await enterApplicantCredentials(user);
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));

  expect(screen.getByText(/saved locally on this device/i)).toBeInTheDocument();
  expect(screen.getByText(/^Saved on this device; API sync is not connected yet$/i)).toBeInTheDocument();
  expect(localStorage.getItem(APP_STATE_STORAGE_KEY)).toContain("applicant@example.com");
});

it("persists quick start dismissal locally", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await enterApplicantCredentials(user);
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
  expect(screen.getByText(/email addresses need an @ symbol and a domain/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /^access$/i })).not.toBeInTheDocument();
});

it("lets logged-in users log out from the shell", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await enterApplicantCredentials(user);
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));
  await user.click(screen.getByRole("button", { name: /log out/i }));
  expect(screen.getByRole("button", { name: /continue as applicant/i })).toBeInTheDocument();
});

it("requires a password before applicant sign-in", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.type(screen.getByLabelText(/email/i), "applicant@example.com");
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));
  expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /^access$/i })).not.toBeInTheDocument();
});

it("shows sign in and sign up as a compact mode switch", async () => {
  const user = userEvent.setup();
  render(<AppShell />);

  expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  expect(screen.queryByRole("tab")).not.toBeInTheDocument();

  const signIn = screen.getByRole("button", { name: /sign in/i });
  const signUp = screen.getByRole("button", { name: /sign up/i });
  expect(signIn).toHaveAttribute("aria-pressed", "true");
  expect(signIn).toHaveClass("auth-mode-tab-active");
  expect(signUp).toHaveAttribute("aria-pressed", "false");
  expect(signUp).not.toHaveClass("auth-mode-tab-active");

  await user.click(signUp);
  expect(signUp).toHaveAttribute("aria-pressed", "true");
  expect(signUp).toHaveClass("auth-mode-tab-active");
  expect(signIn).toHaveAttribute("aria-pressed", "false");
  expect(signIn).not.toHaveClass("auth-mode-tab-active");
});

it("lets applicants sign up with gmail and password", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.click(screen.getByRole("button", { name: /sign up/i, pressed: false }));
  await enterApplicantCredentials(user, "student@gmail.com", "secure-pass-2026");
  const submitSignUp = screen.getAllByRole("button", { name: /sign up/i }).find((button) => button.getAttribute("type") === "submit");
  expect(submitSignUp).toBeTruthy();
  await user.click(submitSignUp as HTMLElement);
  expect(screen.getByRole("button", { name: /access/i })).toBeInTheDocument();
  expect(localStorage.getItem(APP_STATE_STORAGE_KEY)).toContain("student@gmail.com");
});

it("lets applicants continue with google", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.click(screen.getByRole("button", { name: /continue with google/i }));
  expect(screen.getByRole("button", { name: /access/i })).toBeInTheDocument();
  expect(localStorage.getItem(APP_STATE_STORAGE_KEY)).toContain("google.applicant@example.com");
});

it("shows inline error for invalid shared token", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  expect(screen.queryByLabelText(/access token/i)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /use access token/i }));
  await user.type(screen.getByLabelText(/access token/i), "BAD-TOKEN");
  await user.click(screen.getByRole("button", { name: /continue with token/i }));
  expect(screen.getByText(/does not match a current family or counselor access token/i)).toBeInTheDocument();
});

it("switches visible page copy to Vietnamese and German", async () => {
  const user = userEvent.setup();
  render(<AppShell />);

  await user.click(screen.getByRole("button", { name: "VI" }));
  expect(screen.getByText("Mật khẩu")).toBeInTheDocument();
  await enterApplicantCredentials(user);
  await user.click(screen.getByRole("button", { name: /tiếp tục với vai trò ứng viên/i }));

  expect(screen.getByRole("heading", { name: "Phòng điều phối hồ sơ" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Trường" }));
  expect(await screen.findByRole("button", { name: "Thêm trường" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Hồ sơ" }));
  expect(await screen.findByRole("button", { name: "Thêm giấy tờ" })).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "DE" }));
  await user.click(screen.getByRole("button", { name: "Universitäten" }));
  expect(await screen.findByRole("button", { name: "Universität hinzufügen" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Zugriff & Freigabe" }));
  expect(await screen.findByRole("heading", { name: "Zugriff & Freigabe" })).toBeInTheDocument();
});
