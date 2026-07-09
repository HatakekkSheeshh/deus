import { formatEUR } from "@/lib/derived";
import type { Costs } from "@/lib/types";

const segmentsConfig = [
  { key: "blocked", label: "Blocked account (1 year)", color: "var(--info)" },
  { key: "insurance", label: "Health insurance", color: "var(--cost-green)" },
  { key: "semester", label: "Semester contribution fee", color: "var(--tan)" },
  { key: "tuition", label: "Tuition (if applicable)", color: "var(--accent)" },
  { key: "aps", label: "APS certificate fee", color: "var(--warning)" },
  { key: "processing", label: "uni-assist processing fee", color: "var(--error)" }
] as const;

export default function CostDonut({ costs }: { costs: Costs }) {
  const recurring = costs.healthInsuranceMonthly * costs.months;
  const processing = costs.uniAssistFee + costs.visaFee;
  const segmentValues = {
    blocked: costs.blockedAccountYear,
    insurance: recurring,
    semester: costs.semesterFee,
    tuition: costs.tuitionPerSemester,
    aps: costs.apsFee,
    processing
  };
  const segments = segmentsConfig.map((segment) => ({ ...segment, value: segmentValues[segment.key] }));
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let cursor = 0;
  const stops = segments
    .filter((segment) => segment.value > 0 && total > 0)
    .map((segment) => {
      const start = cursor;
      const end = cursor + (segment.value / total) * 100;
      cursor = end;
      return `${segment.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
    });
  const background = total > 0 ? `conic-gradient(${stops.join(", ")})` : "var(--ink-06)";

  return (
    <div className="cost-breakdown">
      <div className="cost-pie" role="img" aria-label="Cost breakdown pie chart" style={{ background }} />
      <ul className="cost-legend" aria-label="Cost breakdown legend">
        {segments.map((segment) => (
          <li className="cost-legend-row" key={segment.key}>
            <span className="cost-legend-swatch" style={{ background: segment.color }} />
            <span className="cost-legend-label">{segment.label}</span>
            <strong>{formatEUR(segment.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
