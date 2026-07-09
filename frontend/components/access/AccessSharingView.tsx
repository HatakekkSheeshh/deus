"use client";

import { useState } from "react";
import { roleLabel, t } from "@/lib/i18n";
import type { Lang, ThemePrefs } from "@/lib/types";

export default function AccessSharingView({ lang = "en", accessTokens, theme, onGenerate, onCopy, onThemeChange }: {
  lang?: Lang;
  accessTokens: { family: string | null; counselor: string | null };
  theme: ThemePrefs;
  onGenerate: (role: "family" | "counselor") => Promise<string | null>;
  onCopy: (token: string) => void;
  onThemeChange: (theme: Partial<ThemePrefs>) => void;
}) {
  const [status, setStatus] = useState("");
  const [busyRole, setBusyRole] = useState<"family" | "counselor" | null>(null);

  function changeTheme(themePatch: Partial<ThemePrefs>) {
    onThemeChange(themePatch);
    setStatus(t(lang, "access.saved"));
  }

  function copyToken(role: "family" | "counselor", token: string) {
    onCopy(token);
    setStatus(t(lang, "access.tokenCopied", { role: roleLabel(lang, role) }));
  }

  async function generateToken(role: "family" | "counselor") {
    setBusyRole(role);
    const error = await onGenerate(role);
    setBusyRole(null);
    setStatus(error ?? t(lang, "access.saved"));
  }

  return (
    <div className="page-stack access-column">
      <header>
        <h1 className="page-title">{t(lang, "access.title")}</h1>
        <p className="page-kicker">{t(lang, "access.kicker")}</p>
      </header>
      <section className="card preference-card">
        <div>
          <h2 className="card-title">{t(lang, "access.preferences")}</h2>
          <p className="muted">{t(lang, "access.preferencesDetail")}</p>
        </div>
        <div className="preference-grid">
          <div className="preference-group" aria-label={t(lang, "access.theme")}>
            <span className="field-label">{t(lang, "access.theme")}</span>
            <div className="segmented-control">
              {(["warm", "cool", "forest", "terracotta"] as const).map((item) => (
                <button key={item} type="button" aria-pressed={theme.theme === item} aria-label={`${item} theme`} onClick={() => changeTheme({ theme: item })}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="preference-group" aria-label={t(lang, "access.corners")}>
            <span className="field-label">{t(lang, "access.corners")}</span>
            <div className="segmented-control">
              {(["soft", "sharp"] as const).map((item) => (
                <button key={item} type="button" aria-pressed={theme.cornerStyle === item} aria-label={`${item} corners`} onClick={() => changeTheme({ cornerStyle: item })}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="preference-group" aria-label={t(lang, "access.type")}>
            <span className="field-label">{t(lang, "access.type")}</span>
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
            <h2 className="card-title">{t(lang, "access.token", { role: role === "family" ? roleLabel(lang, "familyMember") : roleLabel(lang, "counselor") })}</h2>
            <p className="muted">{token ?? t(lang, "access.noToken")}</p>
            <div className="token-actions">
              <button className="btn btn-primary" type="button" disabled={busyRole === role} onClick={() => generateToken(role)}>{t(lang, "access.generate")}</button>
              <button className="btn btn-quiet" type="button" disabled={!token} onClick={() => token && copyToken(role, token)}>{t(lang, "access.copyToken")}</button>
            </div>
          </section>
        );
      })}
      <p className="muted">{t(lang, "access.regenerate")}</p>
    </div>
  );
}
