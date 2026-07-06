import type { Lang } from "./types";

export type GlossaryTerm = {
  term: string;
  short: string;
  detail: string;
};

const glossaryByLang: Record<Lang, GlossaryTerm[]> = {
  en: [
    {
      term: "APS",
      short: "Academic Evaluation Center certificate.",
      detail: "Academic Evaluation Center certificate required for many Vietnam-based applicants before German university or visa steps."
    },
    {
      term: "uni-assist",
      short: "Application pre-check portal.",
      detail: "Central service used by many German universities to review international documents before the university makes its own decision."
    },
    {
      term: "Blocked account",
      short: "Proof of funds for the visa.",
      detail: "A restricted bank account used to show enough money for the first year of study and living costs in Germany."
    },
    {
      term: "DAAD",
      short: "Major German scholarship organization.",
      detail: "German Academic Exchange Service, a major source of scholarship information and funding programs."
    }
  ],
  de: [
    {
      term: "APS",
      short: "Zertifikat der Akademischen Prüfstelle.",
      detail: "Zertifikat der Akademischen Prüfstelle, das viele Bewerber aus Vietnam vor Universitäts- oder Visaschritten benötigen."
    },
    {
      term: "uni-assist",
      short: "Portal zur Vorprüfung von Bewerbungen.",
      detail: "Zentrale Stelle, über die viele deutsche Universitäten internationale Dokumente prüfen lassen, bevor die Universität selbst entscheidet."
    },
    {
      term: "Blocked account",
      short: "Finanzierungsnachweis für das Visum.",
      detail: "Ein Sperrkonto, mit dem genügend Geld für das erste Studien- und Lebensjahr in Deutschland nachgewiesen wird."
    },
    {
      term: "DAAD",
      short: "Wichtige deutsche Stipendienorganisation.",
      detail: "Deutscher Akademischer Austauschdienst, eine zentrale Quelle für Stipendieninformationen und Förderprogramme."
    }
  ],
  vi: [
    {
      term: "APS",
      short: "Chứng chỉ của Trung tâm Thẩm tra Học thuật.",
      detail: "Chứng chỉ thẩm tra học thuật thường cần cho ứng viên từ Việt Nam trước các bước nộp trường hoặc visa Đức."
    },
    {
      term: "uni-assist",
      short: "Cổng kiểm tra sơ bộ hồ sơ.",
      detail: "Dịch vụ trung tâm được nhiều trường Đức dùng để kiểm tra giấy tờ quốc tế trước khi trường tự ra quyết định."
    },
    {
      term: "Blocked account",
      short: "Chứng minh tài chính cho visa.",
      detail: "Tài khoản phong tỏa dùng để chứng minh có đủ tiền cho năm học và sinh hoạt đầu tiên tại Đức."
    },
    {
      term: "DAAD",
      short: "Tổ chức học bổng lớn của Đức.",
      detail: "Cơ quan Trao đổi Hàn lâm Đức, nguồn quan trọng cho thông tin học bổng và chương trình tài trợ."
    }
  ]
};

export const admissionsGlossary = glossaryByLang.en;

export function admissionsGlossaryFor(lang: Lang): GlossaryTerm[] {
  return glossaryByLang[lang] ?? glossaryByLang.en;
}

export function glossaryDetail(term: string, lang: Lang = "en") {
  return admissionsGlossaryFor(lang).find((item) => item.term.toLowerCase() === term.toLowerCase())?.detail;
}
