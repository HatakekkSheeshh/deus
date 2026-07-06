import { statusLabel, t } from "@/lib/i18n";
import type { Lang, University, UniversityStatus } from "@/lib/types";

const statuses: UniversityStatus[] = ["Not started", "Researching", "In progress", "Submitted", "Offer"];

export default function UniversityCard({ lang = "en", university, readOnly, onStatusChange }: {
  lang?: Lang;
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
          {statuses.map((status) => <option key={status} value={status}>{statusLabel(lang, status)}</option>)}
        </select>
      </div>
      <div className="university-condition-grid">
        <div className="condition"><span className="condition-label">GPA</span><strong>{university.gpaReq}</strong></div>
        <div className="condition"><span className="condition-label">{t(lang, "universities.languageShort")}</span><strong>{university.languageReq}</strong></div>
        <div className="condition"><span className="condition-label">{t(lang, "universities.apsShort")}</span><strong>{university.apsRequired ? t(lang, "universities.required") : t(lang, "universities.notRequired")}</strong><p className="condition-help">{t(lang, "universities.apsHelp")}</p></div>
        <div className="condition"><span className="condition-label">{t(lang, "universities.deadline")}</span><strong>{university.deadline}</strong></div>
      </div>
      <div className="row">
        <span className="muted">{t(lang, "universities.tuitionLine", { amount: university.tuitionPerSemester.toLocaleString("en-US") })}</span>
        <a href={university.link} target="_blank" rel="noreferrer">{t(lang, "universities.link")}</a>
      </div>
    </article>
  );
}
