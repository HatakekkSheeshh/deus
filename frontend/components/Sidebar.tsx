"use client";

import { CalendarDays, FileCheck2, FolderOpen, GraduationCap, Home, KeyRound, Landmark, LogOut, MoreHorizontal, WalletCards } from "lucide-react";
import { useState } from "react";
import LanguageSwitch from "./LanguageSwitch";
import { labelForView, roleLabel, t } from "@/lib/i18n";
import type { Lang, Role, View } from "@/lib/types";

const navItems: Array<{ view: View; icon: React.ComponentType<{ size?: number }> }> = [
  { view: "dashboard", icon: Home },
  { view: "universities", icon: GraduationCap },
  { view: "documents", icon: FileCheck2 },
  { view: "library", icon: FolderOpen },
  { view: "cost", icon: WalletCards },
  { view: "timeline", icon: CalendarDays },
  { view: "scholarships", icon: Landmark },
  { view: "access", icon: KeyRound }
];

export default function Sidebar({
  view,
  lang,
  role,
  onView,
  onLang,
  onLogout,
  saveStatus,
  syncStatus
}: {
  view: View;
  lang: Lang;
  role: Role;
  onView: (view: View) => void;
  onLang: (lang: Lang) => void;
  onLogout: () => void;
  saveStatus: string;
  syncStatus: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-title">German Master</div>
        <p className="muted">{t(lang, "app.subtitle")}</p>
      </div>
      <div className="mobile-shell-menu">
        <button
          className="mobile-shell-menu-trigger"
          type="button"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <MoreHorizontal size={18} />
          <span>{t(lang, "app.more")}</span>
        </button>
        {mobileMenuOpen ? (
          <div className="mobile-shell-menu-panel">
            <LanguageSwitch lang={lang} onChange={onLang} />
            <div>
              <span className="chip chip-muted">{roleLabel(lang, role)}</span>
              {role !== "applicant" ? <span className="chip chip-warning" style={{ marginLeft: 8 }}>{t(lang, "app.viewOnly")}</span> : null}
            </div>
            <p className="save-status" aria-live="polite">{saveStatus}</p>
            <p className="save-status">{syncStatus}</p>
            <button className="btn btn-quiet sidebar-logout" type="button" onClick={onLogout}>
              <LogOut size={16} />
              {t(lang, "app.logout")}
            </button>
          </div>
        ) : null}
      </div>
      <nav className="nav-list" aria-label={t(lang, "app.navAria")}>
        {navItems.filter((item) => role === "applicant" || item.view !== "access").map(({ view: itemView, icon: Icon }) => (
          <button
            key={itemView}
            className="nav-item"
            type="button"
            aria-current={view === itemView ? "page" : undefined}
            onClick={() => onView(itemView)}
          >
            <span className="nav-dot" />
            <Icon size={16} />
            {labelForView(lang, itemView)}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <LanguageSwitch lang={lang} onChange={onLang} />
        <div>
          <span className="chip chip-muted">{roleLabel(lang, role)}</span>
          {role !== "applicant" ? <span className="chip chip-warning" style={{ marginLeft: 8 }}>{t(lang, "app.viewOnly")}</span> : null}
        </div>
        <p className="save-status" aria-live="polite">{saveStatus}</p>
        <p className="save-status">{syncStatus}</p>
        <button className="btn btn-quiet sidebar-logout" type="button" onClick={onLogout}>
          <LogOut size={16} />
          {t(lang, "app.logout")}
        </button>
      </div>
    </aside>
  );
}
