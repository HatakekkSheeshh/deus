import { mergeTimeline } from "@/lib/derived";
import type { AppState, View } from "@/lib/types";

export default function QuickStartPanel({
  state,
  onNavigate,
  onDismiss
}: {
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
          <h2 className="card-title" id="quick-start-title">Quick start</h2>
          <p className="muted">Three checks that make the tracker useful right away.</p>
        </div>
        <button className="btn btn-quiet" type="button" onClick={onDismiss}>Dismiss quick start</button>
      </div>
      <div className="quick-start-grid">
        <button className="quick-start-step" type="button" onClick={() => onNavigate("timeline")}>
          <span className="step-index">1</span>
          <span>
            <strong>Review next deadline</strong>
            <span className="muted">{nextEvent ? `${nextEvent.label} is ${nextEvent.days} days away.` : "Add a timeline milestone when you know one."}</span>
          </span>
        </button>
        <button className="quick-start-step" type="button" onClick={() => onNavigate("documents")}>
          <span className="step-index">2</span>
          <span>
            <strong>Finish blocking document</strong>
            <span className="muted">{missingDocument ? `${missingDocument.name} is still open.` : "Core documents are marked ready."}</span>
          </span>
        </button>
        <div className="quick-start-step">
          <span className="step-index">3</span>
          <span>
            <strong>Confirm local autosave</strong>
            <span className="muted">Changes are saved on this device now; API sync can come later.</span>
          </span>
        </div>
      </div>
    </section>
  );
}
