import { mergeTimeline } from "@/lib/derived";
import { t } from "@/lib/i18n";
import type { AppState, Lang, View } from "@/lib/types";

export default function QuickStartPanel({
  lang = "en",
  state,
  onNavigate,
  onDismiss
}: {
  lang?: Lang;
  state: AppState;
  onNavigate: (view: View) => void;
  onDismiss: () => void;
}) {
  const nextEvent = mergeTimeline(state.universities, state.scholarships, state.customEvents)[0];
  const missingDocument = state.documents.find((doc) => !doc.done);

  return (
    <section className="card quick-start-panel" aria-labelledby="quick-start-title">
      <div className="quick-start-head">
        <div>
          <h2 className="card-title" id="quick-start-title">{t(lang, "quick.title")}</h2>
          <p className="muted">{t(lang, "quick.kicker")}</p>
        </div>
        <button className="btn btn-quiet" type="button" onClick={onDismiss}>{t(lang, "quick.dismiss")}</button>
      </div>
      <div className="quick-start-grid">
        <button className="quick-start-step" type="button" onClick={() => onNavigate("timeline")}>
          <span className="step-index">1</span>
          <span>
            <strong>{t(lang, "quick.reviewDeadline")}</strong>
            <span className="muted">{nextEvent ? t(lang, "quick.deadlineAway", { name: nextEvent.label, count: nextEvent.days ?? 0 }) : t(lang, "quick.addMilestone")}</span>
          </span>
        </button>
        <button className="quick-start-step" type="button" onClick={() => onNavigate("documents")}>
          <span className="step-index">2</span>
          <span>
            <strong>{t(lang, "quick.finishDocument")}</strong>
            <span className="muted">{missingDocument ? t(lang, "quick.documentOpen", { name: missingDocument.name }) : t(lang, "quick.documentsReady")}</span>
          </span>
        </button>
        <div className="quick-start-step">
          <span className="step-index">3</span>
          <span>
            <strong>{t(lang, "quick.confirmAutosave")}</strong>
            <span className="muted">{t(lang, "quick.autosaveDetail")}</span>
          </span>
        </div>
      </div>
    </section>
  );
}
