"use client";

import { FormEvent, useMemo, useState } from "react";
import UniversityCard from "./UniversityCard";
import { statusLabel, t } from "@/lib/i18n";
import type { Action } from "@/lib/reducer";
import type { Lang, University, UniversityStatus } from "@/lib/types";

const statuses: Array<"All" | UniversityStatus> = ["All", "Not started", "Researching", "In progress", "Submitted", "Offer"];
const statusWeight: Record<UniversityStatus, number> = {
  "Not started": 0,
  Researching: 1,
  "In progress": 2,
  Submitted: 3,
  Offer: 4
};

type SortKey = "deadline" | "name" | "status";
type UniversityDraft = {
  name: string;
  program: string;
  city: string;
  gpaReq: string;
  languageReq: string;
  apsRequired: boolean;
  tuitionPerSemester: string;
  deadline: string;
  link: string;
};

const emptyDraft: UniversityDraft = {
  name: "",
  program: "",
  city: "",
  gpaReq: "",
  languageReq: "",
  apsRequired: false,
  tuitionPerSemester: "0",
  deadline: "",
  link: ""
};

const fieldLimits = {
  name: 140,
  program: 180,
  city: 90,
  requirement: 140,
  link: 320
};

function manualId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return `manual-${crypto.randomUUID()}`;
  return `manual-${Math.random().toString(36).slice(2)}`;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function UniversitiesView({ lang = "en", universities, readOnly, dispatch }: {
  lang?: Lang;
  universities: University[];
  readOnly: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  const [statusFilter, setStatusFilter] = useState<"All" | UniversityStatus>("All");
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState<UniversityDraft>(emptyDraft);
  const [formError, setFormError] = useState("");
  const visibleUniversities = useMemo(() => {
    return [...universities]
      .filter((university) => statusFilter === "All" || university.status === statusFilter)
      .sort((a, b) => {
        if (sortKey === "name") return a.name.localeCompare(b.name);
        if (sortKey === "status") return statusWeight[a.status] - statusWeight[b.status] || a.name.localeCompare(b.name);
        return a.deadline.localeCompare(b.deadline);
      });
  }, [sortKey, statusFilter, universities]);

  function updateDraft<K extends keyof UniversityDraft>(key: K, value: UniversityDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    if (formError) setFormError("");
  }

  function submitUniversity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) return;

    const trimmedLink = draft.link.trim();
    const tuitionValue = Number(draft.tuitionPerSemester);

    if (!draft.name.trim() || !draft.program.trim() || !draft.city.trim() || !draft.deadline || !trimmedLink) {
      setFormError(t(lang, "universities.errorRequired"));
      return;
    }
    if (!isHttpUrl(trimmedLink)) {
      setFormError(t(lang, "universities.errorLink"));
      return;
    }
    if (!Number.isFinite(tuitionValue) || tuitionValue < 0) {
      setFormError(t(lang, "universities.errorTuition"));
      return;
    }

    dispatch({
      type: "add-university",
      university: {
        id: manualId(),
        name: draft.name.trim(),
        program: draft.program.trim(),
        city: draft.city.trim(),
        gpaReq: draft.gpaReq.trim() || t(lang, "universities.checkProgram"),
        languageReq: draft.languageReq.trim() || t(lang, "universities.checkProgram"),
        apsRequired: draft.apsRequired,
        tuitionPerSemester: tuitionValue,
        deadline: draft.deadline,
        status: "Not started",
        link: trimmedLink
      }
    });
    setDraft(emptyDraft);
    setFormError("");
    setShowAddForm(false);
    setStatusFilter("All");
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1 className="page-title">{t(lang, "universities.title")}</h1>
          <p className="page-kicker">{t(lang, "universities.kicker")}</p>
        </div>
        <button className="btn btn-primary" type="button" disabled={readOnly} onClick={() => setShowAddForm((open) => !open)}>
          {showAddForm ? t(lang, "universities.closeForm") : t(lang, "universities.add")}
        </button>
      </header>
      {showAddForm ? (
        <form className="card university-form" onSubmit={submitUniversity} noValidate>
          <div className="form-intro">
            <h2 className="card-title">{t(lang, "universities.manualTitle")}</h2>
            <p className="muted">{t(lang, "universities.manualDetail")}</p>
          </div>
          <label className="field">
            <span>{t(lang, "universities.name")}</span>
            <input maxLength={fieldLimits.name} value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} />
          </label>
          <label className="field">
            <span>{t(lang, "universities.program")}</span>
            <input maxLength={fieldLimits.program} value={draft.program} onChange={(event) => updateDraft("program", event.target.value)} />
          </label>
          <label className="field">
            <span>{t(lang, "universities.city")}</span>
            <input maxLength={fieldLimits.city} value={draft.city} onChange={(event) => updateDraft("city", event.target.value)} />
          </label>
          <label className="field">
            <span>{t(lang, "universities.deadline")}</span>
            <input type="date" value={draft.deadline} onChange={(event) => updateDraft("deadline", event.target.value)} />
          </label>
          <label className="field">
            <span>{t(lang, "universities.gpa")}</span>
            <input maxLength={fieldLimits.requirement} value={draft.gpaReq} placeholder={t(lang, "universities.checkProgram")} onChange={(event) => updateDraft("gpaReq", event.target.value)} />
          </label>
          <label className="field">
            <span>{t(lang, "universities.language")}</span>
            <input maxLength={fieldLimits.requirement} value={draft.languageReq} placeholder={t(lang, "universities.checkProgram")} onChange={(event) => updateDraft("languageReq", event.target.value)} />
          </label>
          <label className="field">
            <span>{t(lang, "universities.tuition")}</span>
            <input type="number" min="0" value={draft.tuitionPerSemester} onChange={(event) => updateDraft("tuitionPerSemester", event.target.value)} />
          </label>
          <label className="field">
            <span>{t(lang, "universities.link")}</span>
            <input type="url" maxLength={fieldLimits.link} value={draft.link} onChange={(event) => updateDraft("link", event.target.value)} />
          </label>
          <label className="checkbox-field">
            <input type="checkbox" checked={draft.apsRequired} onChange={(event) => updateDraft("apsRequired", event.target.checked)} />
            <span>{t(lang, "universities.apsRequired")}</span>
          </label>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">{t(lang, "universities.save")}</button>
            <button className="btn btn-quiet" type="button" onClick={() => { setDraft(emptyDraft); setFormError(""); setShowAddForm(false); }}>
              {t(lang, "common.cancel")}
            </button>
          </div>
          {formError ? <p className="error-text">{formError}</p> : null}
        </form>
      ) : null}
      <section className="card toolbar-card" aria-label={t(lang, "universities.filters")}>
        <label className="field toolbar-field">
          <span>{t(lang, "universities.filterStatus")}</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | UniversityStatus)}>
            {statuses.map((status) => <option key={status} value={status}>{status === "All" ? t(lang, "common.all") : statusLabel(lang, status)}</option>)}
          </select>
        </label>
        <label className="field toolbar-field">
          <span>{t(lang, "universities.sort")}</span>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="deadline">{t(lang, "universities.sortDeadline")}</option>
            <option value="name">{t(lang, "universities.sortName")}</option>
            <option value="status">{t(lang, "universities.sortStatus")}</option>
          </select>
        </label>
        <span className="chip chip-muted">{t(lang, "universities.shown", { visible: visibleUniversities.length, total: universities.length })}</span>
      </section>
      {visibleUniversities.length === 0 ? (
        <section className="card empty-state" aria-live="polite">
          <h2 className="card-title">{t(lang, "universities.emptyTitle")}</h2>
          <p className="muted">{t(lang, "universities.emptyDetail")}</p>
          <button className="btn btn-quiet" type="button" onClick={() => setStatusFilter("All")}>{t(lang, "universities.clearFilter")}</button>
        </section>
      ) : (
        <div className="university-list">
          {visibleUniversities.map((university) => (
            <UniversityCard
              key={university.id}
              lang={lang}
              university={university}
              readOnly={readOnly}
              onStatusChange={(id: string, status: UniversityStatus) => dispatch({ type: "set-university-status", id, status })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
