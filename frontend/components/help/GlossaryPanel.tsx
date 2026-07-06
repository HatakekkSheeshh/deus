import { admissionsGlossaryFor } from "@/lib/glossary";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export default function GlossaryPanel({ lang }: { lang: Lang }) {
  return (
    <section className="card glossary-panel" aria-labelledby="admissions-glossary-title">
      <div>
        <h2 className="card-title" id="admissions-glossary-title">{t(lang, "glossary.title")}</h2>
        <p className="muted">{t(lang, "glossary.kicker")}</p>
      </div>
      <dl className="glossary-list">
        {admissionsGlossaryFor(lang).map((item) => (
          <div className="glossary-item" key={item.term}>
            <dt>{item.term}</dt>
            <dd>{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
