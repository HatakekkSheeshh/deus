"use client";

import dynamic from "next/dynamic";
import { useEffect, useReducer, useState } from "react";
import LoginView from "./LoginView";
import Sidebar from "./Sidebar";
import { loadQuickStartDismissed, saveQuickStartDismissed } from "@/lib/onboarding";
import { loadPersistedState, savePersistedState } from "@/lib/persistence";
import { appReducer, initialState } from "@/lib/reducer";
import { t } from "@/lib/i18n";

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

export default function AppShell() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [chatLoading, setChatLoading] = useState(false);
  const [failedChatMessage, setFailedChatMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState(t(initialState.lang, "app.save.ready"));
  const [quickStartDismissed, setQuickStartDismissed] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const readOnly = state.auth.role !== "applicant";

  useEffect(() => {
    const persistedState = loadPersistedState();
    if (persistedState) dispatch({ type: "hydrate-state", state: persistedState });
    setQuickStartDismissed(loadQuickStartDismissed());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    setSaveStatus(savePersistedState(state) ? t(state.lang, "app.save.saved") : t(state.lang, "app.save.unavailable"));
  }, [hasHydrated, state]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme.theme;
    document.documentElement.dataset.corners = state.theme.cornerStyle;
    document.documentElement.dataset.type = state.theme.typeCharacter;
  }, [state.theme]);

  if (!state.auth.loggedIn || !state.auth.role) {
    return (
      <LoginView
        lang={state.lang}
        accessTokens={state.accessTokens}
        onLangChange={(lang) => dispatch({ type: "set-lang", lang })}
        onApplicantLogin={(email) => dispatch({ type: "login-applicant", email })}
        onGoogleLogin={() => dispatch({ type: "login-applicant", email: "google.applicant@example.com" })}
        onSharedLogin={(role, token) => dispatch({ type: "login-shared", role, token })}
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
        onLogout={() => dispatch({ type: "logout" })}
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
            onGenerate={(role) => dispatch({ type: "generate-token", role })}
            onCopy={(token) => navigator.clipboard?.writeText(token)}
            onThemeChange={(theme) => dispatch({ type: "set-theme", theme })}
          />
        ) : null}
      </main>
      <FloatingChat lang={state.lang} messages={state.chatMessages} loading={chatLoading} failedMessage={failedChatMessage} onSend={sendChat} />
    </div>
  );
}
