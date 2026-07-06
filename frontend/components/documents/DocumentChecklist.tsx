"use client";

import type { Action } from "@/lib/reducer";
import { glossaryDetail } from "@/lib/glossary";
import type { DocumentItem } from "@/lib/types";

const groups: DocumentItem["category"][] = ["Academic", "Personal", "Language", "APS & uni-assist", "Financial"];

export default function DocumentChecklist({ documents, readOnly, dispatch }: {
  documents: DocumentItem[];
  readOnly: boolean;
  dispatch: React.Dispatch<Action>;
}) {
  const done = documents.filter((doc) => doc.done).length;
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1 className="page-title">Documents</h1>
          <p className="page-kicker">{done} / {documents.length} ready</p>
        </div>
        <span className="chip">{Math.round(done / documents.length * 100)}%</span>
      </header>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${done / documents.length * 100}%` }} /></div>
      {groups.map((group) => (
        <section className="card" key={group}>
          <h2 className="card-title">{group}</h2>
          {group === "APS & uni-assist" ? (
            <p className="trust-note">{glossaryDetail("APS")} uni-assist may also pre-check documents before the university reviews them.</p>
          ) : null}
          <div className="row-list">
            {documents.filter((doc) => doc.category === group).map((doc) => (
              <label className={`check-row ${doc.done ? "done" : ""}`} key={doc.id}>
                <input type="checkbox" checked={doc.done} disabled={readOnly} onChange={() => dispatch({ type: "toggle-document", id: doc.id })} />
                <span>{doc.name}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
