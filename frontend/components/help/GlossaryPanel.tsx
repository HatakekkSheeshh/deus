import { admissionsGlossary } from "@/lib/glossary";

export default function GlossaryPanel() {
  return (
    <section className="card glossary-panel" aria-labelledby="admissions-glossary-title">
      <div>
        <h2 className="card-title" id="admissions-glossary-title">Admissions glossary</h2>
        <p className="muted">German application terms translated into plain workflow language.</p>
      </div>
      <dl className="glossary-list">
        {admissionsGlossary.map((item) => (
          <div className="glossary-item" key={item.term}>
            <dt>{item.term}</dt>
            <dd>{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
