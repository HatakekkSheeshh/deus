"use client";

import type { Action } from "@/lib/reducer";
import { glossaryDetail } from "@/lib/glossary";
import type { Scholarship, ScholarshipStatus } from "@/lib/types";

const statuses: ScholarshipStatus[] = ["Not applied", "In progress", "Applied", "Awarded"];

export default function ScholarshipsView({ scholarships, readOnly, dispatch }: {
  scholarships: Scholarship[];
  readOnly: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">Scholarships</h1>
        <p className="page-kicker">Funding opportunities tracked with the same status language.</p>
        <p className="trust-note">{glossaryDetail("DAAD")}</p>
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
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </div>
            <div className="row">
              <span className="muted">Deadline: {scholarship.deadline ?? "Rolling / university-specific"}</span>
              <a href={scholarship.link} target="_blank" rel="noreferrer">Details</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
