import type { Costs } from "@/lib/types";

export default function CostDonut({ costs }: { costs: Costs }) {
  const recurring = costs.healthInsuranceMonthly * costs.months;
  const total = costs.blockedAccountYear + costs.semesterFee + costs.apsFee + costs.uniAssistFee + costs.visaFee + costs.tuitionPerSemester + recurring;
  const blocked = Math.round((costs.blockedAccountYear / total) * 100);
  const insurance = Math.round((recurring / total) * 100);
  const background = `conic-gradient(var(--accent) 0 ${blocked}%, var(--cost-green) ${blocked}% ${blocked + insurance}%, var(--tan) ${blocked + insurance}% 100%)`;

  return (
    <div className="cost-donut" style={{ background }}>
      <span>{blocked}%</span>
    </div>
  );
}
