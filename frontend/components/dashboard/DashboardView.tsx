import CostDonut from "./CostDonut";
import QuickStartPanel from "./QuickStartPanel";
import ScholarshipBars from "./ScholarshipBars";
import StatCard from "./StatCard";
import GlossaryPanel from "@/components/help/GlossaryPanel";
import { daysUntil, formatEUR, mergeTimeline, yearOneTotal } from "@/lib/derived";
import type { AppState, View } from "@/lib/types";

function nextBestAction(state: AppState): { title: string; detail: string; reason: string; view: View; cta: string } {
  const missingDocument = state.documents.find((doc) => !doc.done);
  if (missingDocument) {
    return {
      title: `Finish ${missingDocument.name}`,
      detail: `${missingDocument.category} is still blocking a complete application packet.`,
      reason: "missing required document",
      view: "documents",
      cta: "Open documents"
    };
  }

  const nextEvent = mergeTimeline(state.universities, state.scholarships, state.customEvents)[0];
  if (nextEvent) {
    return {
      title: `Prepare for ${nextEvent.label}`,
      detail: nextEvent.days !== null ? `${nextEvent.days} days left on the timeline.` : "Review this timeline item.",
      reason: "nearest deadline",
      view: "timeline",
      cta: "Open timeline"
    };
  }

  const unsubmitted = state.universities.find((university) => university.status !== "Submitted" && university.status !== "Offer");
  if (unsubmitted) {
    return {
      title: `Move ${unsubmitted.name} forward`,
      detail: `Current status is ${unsubmitted.status}.`,
      reason: "application not submitted",
      view: "universities",
      cta: "Open universities"
    };
  }

  return {
    title: "Review scholarship progress",
    detail: "Applications and core documents look covered; check funding next.",
    reason: "funding opportunity",
    view: "scholarships",
    cta: "Open scholarships"
  };
}

export default function DashboardView({
  state,
  onNavigate,
  showQuickStart = false,
  onDismissQuickStart
}: {
  state: AppState;
  onNavigate: (view: View) => void;
  showQuickStart?: boolean;
  onDismissQuickStart?: () => void;
}) {
  const doneDocs = state.documents.filter((doc) => doc.done).length;
  const events = mergeTimeline(state.universities, state.scholarships, state.customEvents);
  const next = events[0];
  const submitted = state.universities.filter((university) => university.status === "Submitted" || university.status === "Offer").length;
  const action = nextBestAction(state);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1 className="page-title">Application Control Room</h1>
          <p className="page-kicker">Your German Master's process, readable at a glance.</p>
        </div>
        <span className="chip">Today</span>
      </header>
      {showQuickStart && onDismissQuickStart ? (
        <QuickStartPanel state={state} onNavigate={onNavigate} onDismiss={onDismissQuickStart} />
      ) : null}
      <section className="action-panel">
        <div>
          <h2 className="card-title">Next best action</h2>
          <span className="chip chip-muted">Reason: {action.reason}</span>
          <p className="action-title">{action.title}</p>
          <p className="muted">{action.detail}</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => onNavigate(action.view)}>
          {action.cta}
        </button>
      </section>
      <section className="dashboard-stat-grid">
        <StatCard label="Universities shortlisted" value={String(state.universities.length)} detail={`${submitted} submitted or offer`} />
        <section className="card stat-card">
          <p className="muted">Documents ready</p>
          <strong className="stat-value">{doneDocs} / {state.documents.length}</strong>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(doneDocs / state.documents.length * 100)}%` }} /></div>
        </section>
        <StatCard label="Est. year-1 cost" value={formatEUR(yearOneTotal(state.costs))} detail="Blocked account plus fees" />
        <StatCard label="Next deadline" value={next ? `${next.days} days` : "None"} detail={next?.label} />
      </section>
      <section className="dashboard-panel-grid">
        <div className="card">
          <h2 className="card-title">Upcoming deadlines</h2>
          <div className="row-list">
            {events.slice(0, 4).map((event) => (
              <button className="row" key={event.id} type="button" onClick={() => onNavigate("timeline")}>
                <span className="row-main truncate"><strong>{event.label}</strong><br /><span className="muted">{event.type}</span></span>
                <span className={event.days !== null && event.days <= 30 ? "chip chip-warning" : "chip"}>{event.days} days</span>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">Application status</h2>
          <div className="row-list">
            {state.universities.map((university) => (
              <div className="row" key={university.id}>
                <span className="truncate">{university.name}</span>
                <span className="chip chip-info">{university.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="dashboard-panel-grid">
        <div className="card">
          <h2 className="card-title">Cost shape</h2>
          <CostDonut costs={state.costs} />
        </div>
        <div className="card">
          <h2 className="card-title">Scholarship progress</h2>
          <ScholarshipBars scholarships={state.scholarships} />
        </div>
      </section>
      <GlossaryPanel />
    </div>
  );
}
