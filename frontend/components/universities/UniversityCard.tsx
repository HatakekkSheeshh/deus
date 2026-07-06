import type { University, UniversityStatus } from "@/lib/types";

const statuses: UniversityStatus[] = ["Not started", "Researching", "In progress", "Submitted", "Offer"];

export default function UniversityCard({ university, readOnly, onStatusChange }: {
  university: University;
  readOnly: boolean;
  onStatusChange: (id: string, status: UniversityStatus) => void;
}) {
  return (
    <article className="card university-card">
      <div className="university-head">
        <div className="row-main">
          <h2 className="card-title">{university.name}</h2>
          <p className="muted">{university.program} / {university.city}</p>
        </div>
        <select
          className="status-select"
          value={university.status}
          disabled={readOnly}
          onChange={(event) => onStatusChange(university.id, event.target.value as UniversityStatus)}
          aria-label={`${university.name} status`}
        >
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>
      <div className="university-condition-grid">
        <div className="condition"><span className="condition-label">GPA</span><strong>{university.gpaReq}</strong></div>
        <div className="condition"><span className="condition-label">Language</span><strong>{university.languageReq}</strong></div>
        <div className="condition"><span className="condition-label">APS</span><strong>{university.apsRequired ? "Required" : "Not required"}</strong><p className="condition-help">Academic Evaluation Center check.</p></div>
        <div className="condition"><span className="condition-label">Deadline</span><strong>{university.deadline}</strong></div>
      </div>
      <div className="row">
        <span className="muted">Tuition / semester: EUR {university.tuitionPerSemester.toLocaleString("en-US")}</span>
        <a href={university.link} target="_blank" rel="noreferrer">Program link</a>
      </div>
    </article>
  );
}
