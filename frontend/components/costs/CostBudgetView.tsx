"use client";

import { formatEUR, yearOneTotal } from "@/lib/derived";
import { glossaryDetail } from "@/lib/glossary";
import { t } from "@/lib/i18n";
import type { Costs, Lang } from "@/lib/types";

const beforeArrival: Array<{ key: keyof Costs; labelKey: string }> = [
  { key: "blockedAccountYear", labelKey: "cost.blockedAccountYear" },
  { key: "semesterFee", labelKey: "cost.semesterFee" },
  { key: "apsFee", labelKey: "cost.apsFee" },
  { key: "uniAssistFee", labelKey: "cost.uniAssistFee" },
  { key: "visaFee", labelKey: "cost.visaFee" },
  { key: "tuitionPerSemester", labelKey: "cost.tuitionPerSemester" }
];

const recurring: Array<{ key: keyof Costs; labelKey: string }> = [
  { key: "healthInsuranceMonthly", labelKey: "cost.healthInsuranceMonthly" },
  { key: "months", labelKey: "cost.months" }
];

export default function CostBudgetView({ lang = "en", costs, readOnly, onChange }: {
  lang?: Lang;
  costs: Costs;
  readOnly: boolean;
  onChange: (key: keyof Costs, value: number) => void;
}) {
  const renderField = ({ key, labelKey }: { key: keyof Costs; labelKey: string }) => (
    <label className="field" key={key}>
      <span>{t(lang, labelKey)}</span>
      <input type="number" value={costs[key]} disabled={readOnly} onChange={(event) => onChange(key, Number(event.target.value))} />
    </label>
  );

  return (
    <div className="page-stack">
      <header>
        <h1 className="page-title">{t(lang, "cost.title")}</h1>
        <p className="page-kicker">{t(lang, "cost.kicker")}</p>
      </header>
      <section className="cost-grid">
        <div className="card">
          <h2 className="card-title">{t(lang, "cost.beforeArrival")}</h2>
          <p className="trust-note">{glossaryDetail("Blocked account", lang)}</p>
          <div className="page-stack">{beforeArrival.map(renderField)}</div>
        </div>
        <div className="card">
          <h2 className="card-title">{t(lang, "cost.recurring")}</h2>
          <div className="page-stack">{recurring.map(renderField)}</div>
        </div>
      </section>
      <section className="summary-bar">
        <div>
          <p>{t(lang, "cost.total")}</p>
          <strong className="stat-value">{formatEUR(yearOneTotal(costs))}</strong>
        </div>
        <p>{t(lang, "cost.totalDetail")}</p>
      </section>
    </div>
  );
}
