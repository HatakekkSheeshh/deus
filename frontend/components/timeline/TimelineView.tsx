"use client";

import { FormEvent, useState } from "react";
import { mergeTimeline } from "@/lib/derived";
import type { Action } from "@/lib/reducer";
import type { AppState } from "@/lib/types";

function parts(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return {
    month: parsed.toLocaleString("en-US", { month: "short" }),
    day: parsed.getDate()
  };
}

export default function TimelineView({ state, readOnly, dispatch }: {
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
      setError("Add a label and date for the milestone.");
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
        <h1 className="page-title">Timeline</h1>
        <p className="page-kicker">University, scholarship, and custom milestones in one sorted list.</p>
      </header>
      <form className="card timeline-form" onSubmit={addMilestone}>
        <div>
          <h2 className="card-title">Custom milestone</h2>
          <p className="muted">Add reminders such as APS mailing, visa booking, or funding decisions.</p>
        </div>
        <label className="field">
          <span>Milestone label</span>
          <input value={label} disabled={readOnly} onChange={(event) => setLabel(event.target.value)} placeholder="Submit APS packet" />
        </label>
        <label className="field">
          <span>Milestone date</span>
          <input type="date" value={date} disabled={readOnly} onChange={(event) => setDate(event.target.value)} />
        </label>
        <button className="btn btn-primary" type="submit" disabled={readOnly}>Add milestone</button>
        {error ? <p className="error-text">{error}</p> : null}
      </form>
      <div className="timeline-list">
        {events.map((event) => {
          const dateParts = parts(event.date);
          return (
            <div className="timeline-row" key={event.id}>
              <div className="date-block">
                <span className="date-month">{dateParts.month}</span>
                <strong className="date-day">{dateParts.day}</strong>
              </div>
              <span className="timeline-line" style={{ background: event.color }} />
              <div className="row-main">
                <strong>{event.label}</strong>
                <p className="muted">{event.type}</p>
              </div>
              <input
                type="date"
                value={event.date}
                disabled={readOnly}
                onChange={(change) => {
                  if (event.source === "university") dispatch({ type: "set-university-deadline", id: event.sourceId, deadline: change.target.value });
                  if (event.source === "scholarship") dispatch({ type: "set-scholarship-deadline", id: event.sourceId, deadline: change.target.value });
                }}
              />
              <span className="days-pill" style={{ background: event.color, color: event.days !== null && event.days <= 30 ? "#fff" : "var(--card)" }}>
                {event.days} days
              </span>
              {event.source === "custom" ? (
                <button className="btn btn-danger timeline-remove" type="button" disabled={readOnly} aria-label={`Remove ${event.label.toLowerCase()}`} onClick={() => dispatch({ type: "delete-custom-event", id: event.sourceId })}>
                  Remove
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
