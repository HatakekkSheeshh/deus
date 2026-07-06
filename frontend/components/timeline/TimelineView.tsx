"use client";

import { FormEvent, useState } from "react";
import { mergeTimeline } from "@/lib/derived";
import { t, timelineTypeLabel } from "@/lib/i18n";
import type { Action } from "@/lib/reducer";
import type { AppState, Lang } from "@/lib/types";

const monthLocales: Record<Lang, string> = {
  en: "en-US",
  de: "de-DE",
  vi: "vi-VN"
};

function parts(date: string, lang: Lang) {
  const parsed = new Date(`${date}T00:00:00`);
  return {
    month: parsed.toLocaleString(monthLocales[lang], { month: "short" }),
    day: parsed.getDate()
  };
}

export default function TimelineView({ lang = "en", state, readOnly, dispatch }: {
  lang?: Lang;
  state: AppState;
  readOnly: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const events = mergeTimeline(state.universities, state.scholarships, state.customEvents);

  function addMilestone(event: FormEvent) {
    event.preventDefault();
    const cleaned = label.trim();
    if (!cleaned || !date) {
      setError(t(lang, "timeline.error"));
      return;
    }
    setError("");
    dispatch({ type: "add-custom-event", label: cleaned, date });
    setLabel("");
    setDate("");
  }

  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">{t(lang, "timeline.title")}</h1>
        <p className="page-kicker">{t(lang, "timeline.kicker")}</p>
      </header>
      <form className="card timeline-form" onSubmit={addMilestone}>
        <div>
          <h2 className="card-title">{t(lang, "timeline.customTitle")}</h2>
          <p className="muted">{t(lang, "timeline.customDetail")}</p>
        </div>
        <label className="field">
          <span>{t(lang, "timeline.label")}</span>
          <input value={label} disabled={readOnly} onChange={(event) => setLabel(event.target.value)} placeholder={t(lang, "timeline.placeholder")} />
        </label>
        <label className="field">
          <span>{t(lang, "timeline.date")}</span>
          <input type="date" value={date} disabled={readOnly} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit" disabled={readOnly}>{t(lang, "timeline.add")}</button>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
      <div className="timeline-list">
        {events.map((event) => {
          const dateParts = parts(event.date, lang);
          return (
            <div className="timeline-row" key={event.id}>
              <div className="date-block">
                <span className="date-month">{dateParts.month}</span>
                <strong className="date-day">{dateParts.day}</strong>
              </div>
              <span className="timeline-line" style={{ background: event.color }} />
              <div className="row-main">
                <strong>{event.label}</strong>
                <p className="muted">{timelineTypeLabel(lang, event.source)}</p>
              </div>
              <div className="timeline-actions">
                {event.source === "custom" ? (
                  <button className="btn btn-danger" type="button" disabled={readOnly} aria-label={`${t(lang, "timeline.remove")} ${event.label}`} onClick={() => dispatch({ type: "delete-custom-event", id: event.sourceId })}>
                    {t(lang, "timeline.remove")}
                  </button>
                ) : null}
                <input
                  className="timeline-date-input"
                  type="date"
                  value={event.date}
                  disabled={readOnly}
                  onChange={(change) => {
                    if (event.source === "university") dispatch({ type: "set-university-deadline", id: event.sourceId, deadline: change.target.value });
                    if (event.source === "scholarship") dispatch({ type: "set-scholarship-deadline", id: event.sourceId, deadline: change.target.value });
                  }}
                />
                <span className="days-pill" style={{ background: event.color, color: "var(--card)" }}>
                  {t(lang, "timeline.days", { count: event.days ?? 0 })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
