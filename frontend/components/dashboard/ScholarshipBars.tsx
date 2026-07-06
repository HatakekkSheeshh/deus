import type { Scholarship } from "@/lib/types";

const weights = {
  "Not applied": 18,
  "In progress": 52,
  Applied: 78,
  Awarded: 100
};

export default function ScholarshipBars({ scholarships }: { scholarships: Scholarship[] }) {
  return (
    <div className="row-list">
      {scholarships.map((scholarship) => (
        <div className="row" key={scholarship.id}>
          <div className="row-main">
            <strong>{scholarship.name}</strong>
            <p className="muted">{scholarship.provider}</p>
          </div>
          <div style={{ minWidth: 120 }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${weights[scholarship.status]}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
