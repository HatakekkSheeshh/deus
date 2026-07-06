"use client";

import type { Action } from "@/lib/reducer";
import { glossaryDetail } from "@/lib/glossary";
import { statusLabel, t } from "@/lib/i18n";
import type { Lang, Scholarship, ScholarshipStatus } from "@/lib/types";

const statuses: ScholarshipStatus[] = ["Not applied", "In progress", "Applied", "Awarded"];

export default function ScholarshipsView({ lang = "en", scholarships, readOnly, dispatch }: {
  lang?: Lang;
  scholarships: Scholarship[];
  readOnly: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">{t(lang, "scholarships.title")}</h1>
        <p className="page-kicker">{t(lang, "scholarships.kicker")}</p>
        <p className="trust-note">{glossaryDetail("DAAD", lang)}</p>
      </header>
      <div className="scholarship-list">
        {scholarships.map((scholarship) => (
          <article className="card university-card" key={scholarship.id}>
            <div className="university-head">
              <div>
                <h2 className="card-title">{scholarship.name}</h2>
                <p className="muted">{scholarship.provider} / {scholarship.amount}</p>
              </div>
              <select
                className="status-select"
                value={scholarship.status}
                disabled={readOnly}
                onChange={(event) => dispatch({ type: "set-scholarship-status", id: scholarship.id, status: event.target.value as ScholarshipStatus })}
              >
                {statuses.map((status) => <option key={status} value={status}>{statusLabel(lang, status)}</option>)}
              </select>
            </div>
            <div className="row">
              <span className="muted">{t(lang, "scholarships.deadline", { date: scholarship.deadline ?? t(lang, "scholarships.rolling") })}</span>
              <a href={scholarship.link} target="_blank" rel="noreferrer">{t(lang, "scholarships.details")}</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
