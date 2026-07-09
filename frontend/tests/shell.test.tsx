import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppShell from "@/components/AppShell";
import { ONBOARDING_STORAGE_KEY } from "@/lib/onboarding";
import { APP_STATE_STORAGE_KEY } from "@/lib/persistence";

const supabaseAuthMock = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn()
}));

vi.mock("@/lib/supabase/browser", () => ({
  createSupabaseBrowserClient: () => ({
    auth: supabaseAuthMock
  })
}));

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  supabaseAuthMock.getSession.mockResolvedValue({ data: { session: null }, error: null });
  supabaseAuthMock.onAuthStateChange.mockReturnValue({
    data: {
      subscription: {
        unsubscribe: vi.fn()
      }
    }
  });
  supabaseAuthMock.signInWithPassword.mockResolvedValue({
    data: { user: { email: "applicant@example.com" } },
    error: null
  });
  supabaseAuthMock.signUp.mockResolvedValue({
    data: { user: { email: "student@gmail.com" } },
    error: null
  });
  supabaseAuthMock.signInWithOAuth.mockResolvedValue({ data: {}, error: null });
  supabaseAuthMock.signOut.mockResolvedValue({ error: null });
  global.fetch = vi.fn();
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
  expect(supabaseAuthMock.signInWithPassword).toHaveBeenCalledWith({
    email: "applicant@example.com",
    password: "application-2026"
  });
  expect(screen.getByRole("button", { name: /^access & sharing$/i })).toBeInTheDocument();
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
  expect(screen.queryByRole("button", { name: /^access & sharing$/i })).not.toBeInTheDocument();
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
  expect(screen.queryByRole("button", { name: /^access & sharing$/i })).not.toBeInTheDocument();
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
  expect(supabaseAuthMock.signUp).toHaveBeenCalledWith({
    email: "student@gmail.com",
    password: "secure-pass-2026"
  });
  expect(screen.getByRole("button", { name: /^access & sharing$/i })).toBeInTheDocument();
  expect(localStorage.getItem(APP_STATE_STORAGE_KEY)).toContain("student@gmail.com");
});

it("lets applicants continue with google", async () => {
  const user = userEvent.setup();
  render(<AppShell />);
  await user.click(screen.getByRole("button", { name: /continue with google/i }));
  expect(supabaseAuthMock.signInWithOAuth).toHaveBeenCalledWith({
    provider: "google",
    options: {
      redirectTo: "http://localhost:3000/auth/callback"
    }
  });
  expect(screen.queryByRole("button", { name: /^access & sharing$/i })).not.toBeInTheDocument();
});

it("shows inline error for invalid shared token", async () => {
  const user = userEvent.setup();
  vi.mocked(global.fetch).mockResolvedValue(new Response(JSON.stringify({ error: "Invalid or expired access token" }), { status: 401 }));
  render(<AppShell />);
  expect(screen.queryByLabelText(/access token/i)).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /use access token/i }));
  await user.type(screen.getByLabelText(/access token/i), "BAD-TOKEN");
  await user.click(screen.getByRole("button", { name: /continue with token/i }));
  expect(global.fetch).toHaveBeenCalledWith("/api/v1/access-tokens/redeem", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({ token: "BAD-TOKEN" })
  }));
  expect(screen.getByText(/invalid or expired access token/i)).toBeInTheDocument();
});

it("does not enter the app when Supabase rejects applicant sign-in", async () => {
  const user = userEvent.setup();
  supabaseAuthMock.signInWithPassword.mockResolvedValueOnce({
    data: { user: null },
    error: { message: "Invalid login credentials" }
  });

  render(<AppShell />);
  await enterApplicantCredentials(user);
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));

  expect(screen.getByText(/invalid login credentials/i)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /^access & sharing$/i })).not.toBeInTheDocument();
});

it("redeems a valid shared access token through the API", async () => {
  const user = userEvent.setup();
  vi.mocked(global.fetch).mockResolvedValue(new Response(JSON.stringify({
    role: "counselor",
    token: "COU-live-token",
    email: "shared-counselor@example.com"
  }), { status: 200 }));

  render(<AppShell />);
  await user.click(screen.getByRole("button", { name: /use access token/i }));
  await user.type(screen.getByLabelText(/access token/i), "COU-live-token");
  await user.click(screen.getByRole("button", { name: /continue with token/i }));

  expect(screen.getByRole("heading", { name: /application control room/i })).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /^access & sharing$/i })).not.toBeInTheDocument();
});

it("generates access tokens through the service route", async () => {
  const user = userEvent.setup();
  vi.mocked(global.fetch).mockResolvedValue(new Response(JSON.stringify({ token: "FAM-live-token" }), { status: 200 }));

  render(<AppShell />);
  await enterApplicantCredentials(user);
  await user.click(screen.getByRole("button", { name: /continue as applicant/i }));
  await user.click(screen.getByRole("button", { name: /^access & sharing$/i }));
  await user.click(screen.getAllByRole("button", { name: /generate token/i })[0]);

  expect(global.fetch).toHaveBeenCalledWith("/api/v1/access-tokens/generate", expect.objectContaining({
    method: "POST",
    body: JSON.stringify({ role: "family" })
  }));
  expect(screen.getByText("FAM-live-token")).toBeInTheDocument();
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
