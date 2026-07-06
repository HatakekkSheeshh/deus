"use client";

import { useState } from "react";
import type { ThemePrefs } from "@/lib/types";

export default function AccessSharingView({ accessTokens, theme, onGenerate, onCopy, onThemeChange }: {
  accessTokens: { family: string | null; counselor: string | null };
  theme: ThemePrefs;
  onGenerate: (role: "family" | "counselor") => void;
  onCopy: (token: string) => void;
  onThemeChange: (theme: Partial<ThemePrefs>) => void;
}) {
  const [status, setStatus] = useState("");

  function changeTheme(themePatch: Partial<ThemePrefs>) {
    onThemeChange(themePatch);
    setStatus("Workspace preference saved locally.");
  }

  function copyToken(role: "family" | "counselor", token: string) {
    onCopy(token);
    setStatus(`${role === "family" ? "Family" : "Counselor"} token copied.`);
  }

  return (
    <div className="page-stack access-column">
      <header>
        <h1 className="page-title">Access & Sharing</h1>
        <p className="page-kicker">Share protected read-only access with family and counselor reviewers.</p>
      </header>
      <section className="card preference-card">
        <div>
          <h2 className="card-title">Workspace preferences</h2>
          <p className="muted">Tune the interface without changing application data.</p>
        </div>
        <div className="preference-grid">
          <div className="preference-group" aria-label="Theme">
            <span className="field-label">Theme</span>
            <div className="segmented-control">
              {(["warm", "cool", "forest", "terracotta"] as const).map((item) => (
                <button key={item} type="button" aria-pressed={theme.theme === item} aria-label={`${item} theme`} onClick={() => changeTheme({ theme: item })}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="preference-group" aria-label="Corners">
            <span className="field-label">Corners</span>
            <div className="segmented-control">
              {(["soft", "sharp"] as const).map((item) => (
                <button key={item} type="button" aria-pressed={theme.cornerStyle === item} aria-label={`${item} corners`} onClick={() => changeTheme({ cornerStyle: item })}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="preference-group" aria-label="Type">
            <span className="field-label">Type</span>
            <div className="segmented-control">
              <button type="button" aria-pressed={theme.typeCharacter === "serif-led"} aria-label="serif led type" onClick={() => changeTheme({ typeCharacter: "serif-led" })}>
                serif
              </button>
              <button type="button" aria-pressed={theme.typeCharacter === "all-sans"} aria-label="all sans type" onClick={() => changeTheme({ typeCharacter: "all-sans" })}>
                sans
              </button>
            </div>
          </div>
        </div>
      </section>
      {status ? <p className="status-text" aria-live="polite">{status}</p> : null}
      {(["family", "counselor"] as const).map((role) => {
        const token = accessTokens[role];
        return (
          <section className="card" key={role}>
            <h2 className="card-title">{role === "family" ? "Family member" : "Counselor"} token</h2>
            <p className="muted">{token ?? "No token generated"}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn btn-primary" type="button" onClick={() => onGenerate(role)}>Generate</button>
              <button className="btn btn-quiet" type="button" disabled={!token} onClick={() => token && copyToken(role, token)}>Copy token</button>
            </div>
          </section>
        );
      })}
      <p className="muted">Regenerating a token invalidates the old token for future login, but it does not log out existing sessions.</p>
    </div>
  );
}
