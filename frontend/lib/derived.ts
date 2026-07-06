import type { Costs, CustomEvent, Scholarship, University } from "./types";

export const today = new Date("2026-07-05T00:00:00");
const dayMs = 86_400_000;

export function daysUntil(date: string | null): number | null {
  if (!date) return null;
  return Math.ceil((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / dayMs);
}

export function urgencyColor(days: number | null): string {
  if (days === null) return "#8a8378";
  if (days < 0) return "#c65b43";
  if (days <= 30) return "#c98a2e";
  return "var(--accent)";
}

export function formatEUR(value: number): string {
  return new Intl.NumberFormat("en-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

export function yearOneTotal(costs: Costs): number {
  return costs.blockedAccountYear + costs.semesterFee + costs.apsFee + costs.uniAssistFee +
    costs.visaFee + costs.tuitionPerSemester + costs.healthInsuranceMonthly * costs.months;
}

export function mergeTimeline(
  universities: University[],
  scholarships: Scholarship[],
  customEvents: CustomEvent[]
) {
  return [
    ...universities.map((u) => ({ id: `uni-${u.id}`, label: u.name, type: "University", date: u.deadline, source: "university" as const, sourceId: u.id })),
    ...scholarships.filter((s) => s.deadline).map((s) => ({ id: `sch-${s.id}`, label: s.name, type: "Scholarship", date: s.deadline as string, source: "scholarship" as const, sourceId: s.id })),
    ...customEvents.map((e) => ({ id: `custom-${e.id}`, label: e.label, type: "Custom", date: e.date, source: "custom" as const, sourceId: e.id }))
  ].map((event) => ({ ...event, days: daysUntil(event.date), color: urgencyColor(daysUntil(event.date)) }))
    .sort((a, b) => new Date(`${a.date}T00:00:00`).getTime() - new Date(`${b.date}T00:00:00`).getTime());
}
