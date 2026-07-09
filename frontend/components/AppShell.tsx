"use client";

import dynamic from "next/dynamic";
import { useEffect, useReducer, useState } from "react";
import LoginView from "./LoginView";
import Sidebar from "./Sidebar";
import { loadQuickStartDismissed, saveQuickStartDismissed } from "@/lib/onboarding";
import { loadPersistedState, savePersistedState } from "@/lib/persistence";
import { appReducer, initialState } from "@/lib/reducer";
import { t } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { AppState } from "@/lib/types";

function ViewLoading() {
  return (
    <section className="card view-loading" aria-label="Loading workspace section" aria-busy="true">
      <span className="skeleton-line skeleton-title" />
      <span className="skeleton-line" />
      <span className="skeleton-line skeleton-short" />
    </section>
  );
}

const AccessSharingView = dynamic(() => import("./access/AccessSharingView"), { loading: () => <ViewLoading /> });
const CostBudgetView = dynamic(() => import("./costs/CostBudgetView"), { loading: () => <ViewLoading /> });
const DashboardView = dynamic(() => import("./dashboard/DashboardView"), { loading: () => <ViewLoading /> });
const DocumentChecklist = dynamic(() => import("./documents/DocumentChecklist"), { loading: () => <ViewLoading /> });
const DocumentLibrary = dynamic(() => import("./library/DocumentLibrary"), { loading: () => <ViewLoading /> });
const FloatingChat = dynamic(() => import("./FloatingChat"), { loading: () => <ViewLoading /> });
const ScholarshipsView = dynamic(() => import("./scholarships/ScholarshipsView"), { loading: () => <ViewLoading /> });
const TimelineView = dynamic(() => import("./timeline/TimelineView"), { loading: () => <ViewLoading /> });
const UniversitiesView = dynamic(() => import("./universities/UniversitiesView"), { loading: () => <ViewLoading /> });

function withoutPersistedAuth(state: AppState): AppState {
  return { ...state, auth: { loggedIn: false, role: null } };
}

function applicantEmail(user: { email?: string | null }) {
  return user.email?.trim() || "applicant@example.com";
}

export default function AppShell() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [supabase, setSupabase] = useState<ReturnType<typeof createSupabaseBrowserClient> | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [failedChatMessage, setFailedChatMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState(t(initialState.lang, "app.save.ready"));
  const [quickStartDismissed, setQuickStartDismissed] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const readOnly = state.auth.role !== "applicant";

  useEffect(() => {
    const persistedState = loadPersistedState();
    if (persistedState) dispatch({ type: "hydrate-state", state: withoutPersistedAuth(persistedState) });
    setQuickStartDismissed(loadQuickStartDismissed());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    setSupabase(createSupabaseBrowserClient());
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      if (mounted && user) dispatch({ type: "login-applicant", email: applicantEmail(user), userId: user.id });
    });

    const { data } = supabase.auth.onAuthStateChange((_event: string, session: { user?: { id: string; email?: string | null } } | null) => {
      if (session?.user) {
        dispatch({ type: "login-applicant", email: applicantEmail(session.user), userId: session.user.id });
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!hasHydrated) return;
    setSaveStatus(savePersistedState(state) ? t(state.lang, "app.save.saved") : t(state.lang, "app.save.unavailable"));
  }, [hasHydrated, state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme.theme;
    document.documentElement.dataset.corners = state.theme.cornerStyle;
    document.documentElement.dataset.type = state.theme.typeCharacter;
  }, [state.theme]);

  async function loginApplicant(input: { email: string; password: string; mode: "sign-in" | "sign-up" }) {
    if (!supabase) return "Authentication is still loading.";
    const result = input.mode === "sign-up"
      ? await supabase.auth.signUp({ email: input.email, password: input.password })
      : await supabase.auth.signInWithPassword({ email: input.email, password: input.password });

    if (result.error) return result.error.message;
    const user = result.data.user;
    if (!user) return "Supabase did not return an authenticated user.";
    dispatch({ type: "login-applicant", email: applicantEmail(user), userId: user.id });
    return null;
  }

  async function loginWithGoogle() {
    if (!supabase) return "Authentication is still loading.";
    const redirectTo = new URL("/auth/callback", window.location.origin).toString();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
    return error?.message ?? null;
  }

  async function loginWithSharedToken(token: string) {
    const response = await fetch("/api/v1/access-tokens/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const payload = await response.json().catch(() => ({})) as { role?: "family" | "counselor"; token?: string; error?: string };
    if (!response.ok || !payload.role) return payload.error ?? "Invalid or expired access token";
    dispatch({ type: "login-shared", role: payload.role, token: payload.token ?? token });
    return null;
  }

  async function generateSharedToken(role: "family" | "counselor") {
    const response = await fetch("/api/v1/access-tokens/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    const payload = await response.json().catch(() => ({})) as { token?: string; error?: string };
    if (!response.ok || !payload.token) return payload.error ?? "Could not generate access token";
    dispatch({ type: "set-access-token", role, token: payload.token });
    return null;
  }

  async function logout() {
    await supabase?.auth.signOut();
    dispatch({ type: "logout" });
  }

  if (!state.auth.loggedIn || !state.auth.role) {
    return (
      <LoginView
        lang={state.lang}
        onLangChange={(lang) => dispatch({ type: "set-lang", lang })}
        onApplicantLogin={loginApplicant}
        onGoogleLogin={loginWithGoogle}
        onSharedLogin={loginWithSharedToken}
      />
    );
  }

  async function sendChat(content: string) {
    dispatch({ type: "add-chat-message", role: "user", content });
    setFailedChatMessage(null);
    setChatLoading(true);
    try {
      const response = await fetch("/api/v1/chat", {
        method: "POST",
        body: JSON.stringify({ message: content, role: state.auth.role, lang: state.lang })
      });
      if (!response.ok) throw new Error("Advisor request failed");
      const reply = await response.json() as { content: string };
      dispatch({ type: "add-chat-message", role: "assistant", content: reply.content });
    } catch {
      setFailedChatMessage(content);
      dispatch({ type: "add-chat-message", role: "assistant", content: t(state.lang, "chat.fallback") });
    } finally {
      setChatLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        view={state.view}
        lang={state.lang}
        role={state.auth.role}
        onView={(view) => dispatch({ type: "set-view", view })}
        onLang={(lang) => dispatch({ type: "set-lang", lang })}
        onLogout={() => void logout()}
        saveStatus={saveStatus}
        syncStatus={t(state.lang, "app.sync.local")}
      />
      <main className="app-main">
        {state.view === "dashboard" ? (
          <DashboardView
            state={state}
            lang={state.lang}
            onNavigate={(view) => dispatch({ type: "set-view", view })}
            showQuickStart={state.auth.role === "applicant" && !quickStartDismissed}
            onDismissQuickStart={() => {
              saveQuickStartDismissed();
              setQuickStartDismissed(true);
            }}
          />
        ) : null}
        {state.view === "universities" ? <UniversitiesView lang={state.lang} universities={state.universities} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "documents" ? <DocumentChecklist lang={state.lang} documents={state.documents} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "library" ? <DocumentLibrary lang={state.lang} files={state.libraryFiles} otherFiles={state.otherFiles} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "cost" ? <CostBudgetView lang={state.lang} costs={state.costs} readOnly={readOnly} onChange={(key, value) => dispatch({ type: "set-cost", key, value })} /> : null}
        {state.view === "timeline" ? <TimelineView lang={state.lang} state={state} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "scholarships" ? <ScholarshipsView lang={state.lang} scholarships={state.scholarships} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "access" && state.auth.role === "applicant" ? (
          <AccessSharingView
            lang={state.lang}
            accessTokens={state.accessTokens}
            theme={state.theme}
            onGenerate={generateSharedToken}
            onCopy={(token) => navigator.clipboard?.writeText(token)}
            onThemeChange={(theme) => dispatch({ type: "set-theme", theme })}
          />
        ) : null}
      </main>
      <FloatingChat lang={state.lang} messages={state.chatMessages} loading={chatLoading} failedMessage={failedChatMessage} onSend={sendChat} />
    </div>
  );
}
