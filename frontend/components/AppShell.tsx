"use client";

import { useEffect, useReducer, useState } from "react";
import AccessSharingView from "./access/AccessSharingView";
import CostBudgetView from "./costs/CostBudgetView";
import DashboardView from "./dashboard/DashboardView";
import DocumentChecklist from "./documents/DocumentChecklist";
import FloatingChat from "./FloatingChat";
import DocumentLibrary from "./library/DocumentLibrary";
import LoginView from "./LoginView";
import ScholarshipsView from "./scholarships/ScholarshipsView";
import Sidebar from "./Sidebar";
import TimelineView from "./timeline/TimelineView";
import UniversitiesView from "./universities/UniversitiesView";
import { loadQuickStartDismissed, saveQuickStartDismissed } from "@/lib/onboarding";
import { loadPersistedState, savePersistedState } from "@/lib/persistence";
import { appReducer, initialState } from "@/lib/reducer";

export default function AppShell() {
  const [state, dispatch] = useReducer(appReducer, initialState, () => loadPersistedState() ?? initialState);
  const [chatLoading, setChatLoading] = useState(false);
  const [failedChatMessage, setFailedChatMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState("Local autosave ready");
  const [quickStartDismissed, setQuickStartDismissed] = useState(() => loadQuickStartDismissed());
  const readOnly = state.auth.role !== "applicant";

  useEffect(() => {
    setSaveStatus(savePersistedState(state) ? "Saved locally on this device" : "Local save unavailable");
  }, [state]);

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
      dispatch({ type: "add-chat-message", role: "assistant", content: "I cannot reach the advisor right now, but your local tracker remains available." });
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
        syncStatus="Local autosave now / API sync later"
      />
      <main className="app-main">
        {state.view === "dashboard" ? (
          <DashboardView
            state={state}
            onNavigate={(view) => dispatch({ type: "set-view", view })}
            showQuickStart={state.auth.role === "applicant" && !quickStartDismissed}
            onDismissQuickStart={() => {
              saveQuickStartDismissed();
              setQuickStartDismissed(true);
            }}
          />
        ) : null}
        {state.view === "universities" ? <UniversitiesView universities={state.universities} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "documents" ? <DocumentChecklist documents={state.documents} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "library" ? <DocumentLibrary files={state.libraryFiles} otherFiles={state.otherFiles} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "cost" ? <CostBudgetView costs={state.costs} readOnly={readOnly} onChange={(key, value) => dispatch({ type: "set-cost", key, value })} /> : null}
        {state.view === "timeline" ? <TimelineView state={state} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "scholarships" ? <ScholarshipsView scholarships={state.scholarships} readOnly={readOnly} dispatch={dispatch} /> : null}
        {state.view === "access" && state.auth.role === "applicant" ? (
          <AccessSharingView
            accessTokens={state.accessTokens}
            theme={state.theme}
            onGenerate={(role) => dispatch({ type: "generate-token", role })}
            onCopy={(token) => navigator.clipboard?.writeText(token)}
            onThemeChange={(theme) => dispatch({ type: "set-theme", theme })}
          />
        ) : null}
      </main>
      <FloatingChat messages={state.chatMessages} loading={chatLoading} failedMessage={failedChatMessage} onSend={sendChat} />
    </div>
  );
}
