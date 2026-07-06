"use client";

import type { Lang } from "@/lib/types";

const labels: Lang[] = ["en", "de", "vi"];

export default function LanguageSwitch({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return (
    <div className="language-switch" aria-label="Language">
      {labels.map((item) => (
        <button key={item} type="button" aria-pressed={lang === item} onClick={() => onChange(item)}>
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
