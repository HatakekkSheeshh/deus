"use client";

import { useState } from "react";
import LanguageSwitch from "./LanguageSwitch";
import type { Lang } from "@/lib/types";

interface LoginViewProps {
  lang: Lang;
  accessTokens: { family: string | null; counselor: string | null };
  onLangChange: (lang: Lang) => void;
  onApplicantLogin: (email: string) => void;
  onSharedLogin: (role: "family" | "counselor", token: string) => void;
}

export default function LoginView({ lang, accessTokens, onLangChange, onApplicantLogin, onSharedLogin }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [emailError, setEmailError] = useState("");
  const [tokenError, setTokenError] = useState("");

  function submitApplicant() {
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setEmailError("Enter a valid email to continue.");
      return;
    }
    setEmailError("");
    setTokenError("");
    onApplicantLogin(cleaned);
  }

  function submitToken() {
    const cleaned = token.trim();
    if (cleaned && cleaned === accessTokens.family) {
      setEmailError("");
      setTokenError("");
      onSharedLogin("family", cleaned);
      return;
    }
    if (cleaned && cleaned === accessTokens.counselor) {
      setEmailError("");
      setTokenError("");
      onSharedLogin("counselor", cleaned);
      return;
    }
    setTokenError("Invalid access token.");
  }

  return (
    <main className="login-screen">
      <section className="login-card" aria-label="Login">
        <LanguageSwitch lang={lang} onChange={onLangChange} />
        <div>
          <h1 className="login-title">German Master Application Tracker</h1>
          <p className="muted">A calm workspace for applications, documents, deadlines, costs, and sharing.</p>
          <p className="trust-note">Local prototype workspace. Shared tokens are read-only for reviewers.</p>
        </div>
        <label className="field">
          <span>Email</span>
          <input value={email} type="email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
        </label>
        {emailError ? <p className="error-text">{emailError}</p> : null}
        <button className="btn btn-primary" type="button" onClick={submitApplicant}>
          Continue as Applicant
        </button>
        <div className="divider" />
        <label className="field">
          <span>Access token</span>
          <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="FAM-2026-DEMO" />
        </label>
        {tokenError ? <p className="error-text">{tokenError}</p> : null}
        <button className="btn btn-quiet" type="button" onClick={submitToken}>
          Continue with token
        </button>
      </section>
    </main>
  );
}
