import CostDonut from "./CostDonut";
import QuickStartPanel from "./QuickStartPanel";
import ScholarshipBars from "./ScholarshipBars";
import StatCard from "./StatCard";
import GlossaryPanel from "@/components/help/GlossaryPanel";
import { daysUntil, formatEUR, mergeTimeline, yearOneTotal } from "@/lib/derived";
import { documentCategoryLabel, statusLabel, t, timelineTypeLabel } from "@/lib/i18n";
import type { AppState, Lang, View } from "@/lib/types";

function nextBestAction(lang: Lang, state: AppState): { title: string; detail: string; reason: string; view: View; cta: string } {
  const missingDocument = state.documents.find((doc) => !doc.done);
  if (missingDocument) {
    return {
      title: t(lang, "dashboard.action.finishDoc", { name: missingDocument.name }),
      detail: t(lang, "dashboard.action.finishDocDetail", { category: documentCategoryLabel(lang, missingDocument.category) }),
      reason: t(lang, "dashboard.reason.document"),
      view: "documents",
      cta: t(lang, "dashboard.openDocuments")
    };
  }

  const nextEvent = mergeTimeline(state.universities, state.scholarships, state.customEvents)[0];
  if (nextEvent) {
    return {
      title: t(lang, "dashboard.action.prepare", { name: nextEvent.label }),
      detail: nextEvent.days !== null ? t(lang, "dashboard.action.prepareDays", { count: nextEvent.days }) : t(lang, "dashboard.action.prepareReview"),
      reason: t(lang, "dashboard.reason.deadline"),
      view: "timeline",
      cta: t(lang, "dashboard.openTimeline")
    };
  }

  const unsubmitted = state.universities.find((university) => university.status !== "Submitted" && university.status !== "Offer");
  if (unsubmitted) {
    return {
      title: t(lang, "dashboard.action.move", { name: unsubmitted.name }),
      detail: t(lang, "dashboard.action.moveDetail", { status: statusLabel(lang, unsubmitted.status) }),
      reason: t(lang, "dashboard.reason.unsubmitted"),
      view: "universities",
      cta: t(lang, "dashboard.openUniversities")
    };
  }

  return {
    title: t(lang, "dashboard.action.reviewScholarships"),
    detail: t(lang, "dashboard.action.reviewScholarshipsDetail"),
    reason: t(lang, "dashboard.reason.funding"),
    view: "scholarships",
    cta: t(lang, "dashboard.openScholarships")
  };
}

export default function DashboardView({
  state,
  lang = "en",
  onNavigate,
  showQuickStart = false,
  onDismissQuickStart
}: {
  state: AppState;
  lang?: Lang;
  onNavigate: (view: View) => void;
  showQuickStart?: boolean;
  onDismissQuickStart?: () => void;
}) {
  const doneDocs = state.documents.filter((doc) => doc.done).length;
  const events = mergeTimeline(state.universities, state.scholarships, state.customEvents);
  const next = events[0];
  const submitted = state.universities.filter((university) => university.status === "Submitted" || university.status === "Offer").length;
  const action = nextBestAction(lang, state);

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <h1 className="page-title">{t(lang, "dashboard.title")}</h1>
          <p className="page-kicker">{t(lang, "dashboard.kicker")}</p>
        </div>
        <span className="chip">{t(lang, "dashboard.today")}</span>
      </header>
      {showQuickStart && onDismissQuickStart ? (
        <QuickStartPanel lang={lang} state={state} onNavigate={onNavigate} onDismiss={onDismissQuickStart} />
      ) : null}
      <section className="action-panel">
        <div>
          <h2 className="card-title">{t(lang, "dashboard.nextAction")}</h2>
          <span className="chip chip-muted">{t(lang, "dashboard.reason", { reason: action.reason })}</span>
          <p className="action-title">{action.title}</p>
          <p className="muted">{action.detail}</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => onNavigate(action.view)}>
          {action.cta}
        </button>
      </section>
      <section className="dashboard-stat-grid">
        <StatCard label={t(lang, "dashboard.universitiesShortlisted")} value={String(state.universities.length)} detail={t(lang, "dashboard.submittedOrOffer", { count: submitted })} />
        <section className="card stat-card">
          <p className="muted">{t(lang, "dashboard.documentsReady")}</p>
          <strong className="stat-value">{doneDocs} / {state.documents.length}</strong>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(doneDocs / state.documents.length * 100)}%` }} /></div>
        </section>
        <StatCard label={t(lang, "dashboard.yearCost")} value={formatEUR(yearOneTotal(state.costs))} detail={t(lang, "dashboard.blockedPlusFees")} />
        <StatCard label={t(lang, "dashboard.nextDeadline")} value={next ? t(lang, "timeline.days", { count: next.days ?? 0 }) : t(lang, "dashboard.none")} detail={next?.label} />
      </section>
      <section className="dashboard-panel-grid">
        <div className="card">
          <h2 className="card-title">{t(lang, "dashboard.upcomingDeadlines")}</h2>
          <div className="row-list">
            {events.slice(0, 4).map((event) => (
              <button className="row" key={event.id} type="button" onClick={() => onNavigate("timeline")}>
                <span className="row-main truncate"><strong>{event.label}</strong><br /><span className="muted">{timelineTypeLabel(lang, event.source)}</span></span>
                <span className={event.days !== null && event.days <= 30 ? "chip chip-warning" : "chip"}>{t(lang, "timeline.days", { count: event.days ?? 0 })}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="card-title">{t(lang, "dashboard.applicationStatus")}</h2>
          <div className="row-list">
            {state.universities.map((university) => (
              <div className="row" key={university.id}>
                <span className="truncate">{university.name}</span>
                <span className="chip chip-info">{statusLabel(lang, university.status)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="dashboard-panel-grid">
        <div className="card">
          <h2 className="card-title">{t(lang, "dashboard.costShape")}</h2>
          <CostDonut costs={state.costs} />
        </div>
        <div className="card">
          <h2 className="card-title">{t(lang, "dashboard.scholarshipProgress")}</h2>
          <ScholarshipBars scholarships={state.scholarships} />
        </div>
      </section>
      <GlossaryPanel lang={lang} />
    </div>
  );
}
