import { dictionaries, labelForView } from "@/lib/i18n";

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
