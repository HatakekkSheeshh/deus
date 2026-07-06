import { dictionaries, labelForView, t } from "@/lib/i18n";

it("uses Vietnamese diacritics for navigation labels", () => {
  expect(dictionaries.vi).toEqual({
    dashboard: "Tổng quan",
    universities: "Trường",
    documents: "Hồ sơ",
    library: "Thư viện",
    cost: "Chi phí",
    timeline: "Lịch trình",
    scholarships: "Học bổng",
    access: "Chia sẻ"
  });
  expect(labelForView("vi", "dashboard")).toBe("Tổng quan");
});

it("translates core page copy for Vietnamese and German", () => {
  expect(t("vi", "dashboard.title")).toBe("Phòng điều phối hồ sơ");
  expect(t("vi", "universities.add")).toBe("Thêm trường");
  expect(t("vi", "documents.add")).toBe("Thêm giấy tờ");
  expect(t("vi", "access.title")).toBe("Truy cập & chia sẻ");

  expect(t("de", "dashboard.title")).toBe("Bewerbungszentrale");
  expect(t("de", "universities.add")).toBe("Universität hinzufügen");
  expect(t("de", "documents.add")).toBe("Dokument hinzufügen");
  expect(t("de", "access.title")).toBe("Zugriff & Freigabe");
});
