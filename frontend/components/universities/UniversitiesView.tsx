"use client";

import { useMemo, useState } from "react";
import UniversityCard from "./UniversityCard";
import type { Action } from "@/lib/reducer";
import type { University, UniversityStatus } from "@/lib/types";

const statuses: Array<"All" | UniversityStatus> = ["All", "Not started", "Researching", "In progress", "Submitted", "Offer"];
const statusWeight: Record<UniversityStatus, number> = {
  "Not started": 0,
  Researching: 1,
  "In progress": 2,
  Submitted: 3,
  Offer: 4
};

type SortKey = "deadline" | "name" | "status";

export default function UniversitiesView({ universities, readOnly, dispatch }: {
  universities: University[];
  readOnly: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  const [statusFilter, setStatusFilter] = useState<"All" | UniversityStatus>("All");
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const visibleUniversities = useMemo(() => {
    return [...universities]
      .filter((university) => statusFilter === "All" || university.status === statusFilter)
      .sort((a, b) => {
        if (sortKey === "name") return a.name.localeCompare(b.name);
        if (sortKey === "status") return statusWeight[a.status] - statusWeight[b.status] || a.name.localeCompare(b.name);
        return a.deadline.localeCompare(b.deadline);
      });
  }, [sortKey, statusFilter, universities]);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1 className="page-title">Universities</h1>
          <p className="page-kicker">Shortlist, requirements, program links, and application state.</p>
        </div>
      </header>
      <section className="card toolbar-card" aria-label="University filters">
        <label className="field toolbar-field">
          <span>Filter by status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | UniversityStatus)}>
            {statuses.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label className="field toolbar-field">
          <span>Sort universities</span>
          <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
            <option value="deadline">Deadline soonest</option>
            <option value="name">Name A-Z</option>
            <option value="status">Status progress</option>
          </select>
        </label>
        <span className="chip chip-muted">{visibleUniversities.length} of {universities.length} shown</span>
      </section>
      {visibleUniversities.length === 0 ? (
        <section className="card empty-state" aria-live="polite">
          <h2 className="card-title">No universities match this filter</h2>
          <p className="muted">Try a different status, or clear the filter to return to the full shortlist.</p>
          <button className="btn btn-quiet" type="button" onClick={() => setStatusFilter("All")}>Clear filter</button>
        </section>
      ) : (
        <div className="university-list">
          {visibleUniversities.map((university) => (
            <UniversityCard
              key={university.id}
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
