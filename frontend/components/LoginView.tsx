"use client";

import { useState } from "react";
import LanguageSwitch from "./LanguageSwitch";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

interface LoginViewProps {
  lang: Lang;
  accessTokens: { family: string | null; counselor: string | null };
  onLangChange: (lang: Lang) => void;
  onApplicantLogin: (email: string) => void;
  onGoogleLogin: () => void;
  onSharedLogin: (role: "family" | "counselor", token: string) => void;
}

export default function LoginView({ lang, accessTokens, onLangChange, onApplicantLogin, onGoogleLogin, onSharedLogin }: LoginViewProps) {
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [showTokenLogin, setShowTokenLogin] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [tokenError, setTokenError] = useState("");

  function submitApplicant() {
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setEmailError(t(lang, "login.emailError"));
      return;
    }
    if (password.length < 8) {
      setEmailError(t(lang, "login.passwordError"));
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
    setTokenError(t(lang, "login.tokenError"));
  }

  return (
    <main className="login-screen">
      <section className="login-card" aria-label={t(lang, "login.aria")}>
        <LanguageSwitch lang={lang} onChange={onLangChange} />
        <h1 className="login-title">{t(lang, "login.title")}</h1>
        <div className="auth-mode-tabs" aria-label={t(lang, "login.authMode")}>
          <button
            className={`auth-mode-tab ${authMode === "sign-in" ? "auth-mode-tab-active" : ""}`}
            type="button"
            aria-pressed={authMode === "sign-in"}
            onClick={() => setAuthMode("sign-in")}
          >
            {t(lang, "login.signIn")}
          </button>
          <button
            className={`auth-mode-tab ${authMode === "sign-up" ? "auth-mode-tab-active" : ""}`}
            type="button"
            aria-pressed={authMode === "sign-up"}
            onClick={() => setAuthMode("sign-up")}
          >
            {t(lang, "login.signUp")}
          </button>
        </div>
        <form className="login-form" noValidate onSubmit={(event) => {
          event.preventDefault();
          submitApplicant();
        }}>
          <label className="field">
            <span>{t(lang, "login.email")}</span>
            <input value={email} type="email" onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
          </label>
          <label className="field">
            <span>{t(lang, "login.password")}</span>
            <input value={password} type="password" onChange={(event) => setPassword(event.target.value)} placeholder="8+ characters" />
          </label>
          {emailError ? <p className="error-text">{emailError}</p> : null}
          <button className="btn btn-primary" type="submit">
            {authMode === "sign-up" ? t(lang, "login.signUp") : t(lang, "login.continueApplicant")}
          </button>
        </form>
        <button className="btn btn-quiet" type="button" onClick={onGoogleLogin}>
          {t(lang, "login.continueGoogle")}
        </button>
        <button className="btn btn-quiet" type="button" onClick={() => setShowTokenLogin((current) => !current)}>
          {t(lang, "login.useToken")}
        </button>
        {showTokenLogin ? (
          <div className="token-panel">
            <label className="field">
              <span>{t(lang, "login.accessToken")}</span>
              <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="FAM-2026-DEMO" />
            </label>
            {tokenError ? <p className="error-text">{tokenError}</p> : null}
            <button className="btn btn-quiet" type="button" onClick={submitToken}>
              {t(lang, "login.continueToken")}
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}
