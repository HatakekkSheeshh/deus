"use client";

import { formatEUR, yearOneTotal } from "@/lib/derived";
import { glossaryDetail } from "@/lib/glossary";
import type { Costs } from "@/lib/types";

const beforeArrival: Array<{ key: keyof Costs; label: string }> = [
  { key: "blockedAccountYear", label: "Blocked account year" },
  { key: "semesterFee", label: "Semester fee" },
  { key: "apsFee", label: "APS fee" },
  { key: "uniAssistFee", label: "uni-assist fee" },
  { key: "visaFee", label: "Visa fee" },
  { key: "tuitionPerSemester", label: "Tuition / semester" }
];

const recurring: Array<{ key: keyof Costs; label: string }> = [
  { key: "healthInsuranceMonthly", label: "Health insurance / month" },
  { key: "months", label: "Months" }
];

export default function CostBudgetView({ costs, readOnly, onChange }: {
  costs: Costs;
  readOnly: boolean;
  onChange: (key: keyof Costs, value: number) => void;
}) {
  const renderField = ({ key, label }: { key: keyof Costs; label: string }) => (
    <label className="field" key={key}>
      <span>{label}</span>
      <input type="number" value={costs[key]} disabled={readOnly} onChange={(event) => onChange(key, Number(event.target.value))} />
    </label>
  );

  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">Cost & Budget</h1>
        <p className="page-kicker">Estimate year-one money needs before decisions get expensive.</p>
      </header>
      <section className="cost-grid">
        <div className="card">
          <h2 className="card-title">Before you arrive</h2>
          <p className="trust-note">{glossaryDetail("Blocked account")}</p>
          <div className="page-stack">{beforeArrival.map(renderField)}</div>
        </div>
        <div className="card">
          <h2 className="card-title">Recurring living cost</h2>
          <div className="page-stack">{recurring.map(renderField)}</div>
        </div>
      </section>
      <section className="summary-bar">
        <div>
          <p>Estimated year-one total</p>
          <strong className="stat-value">{formatEUR(yearOneTotal(costs))}</strong>
        </div>
        <p>Includes blocked account, application fees, tuition, and insurance.</p>
      </section>
    </div>
  );
}
