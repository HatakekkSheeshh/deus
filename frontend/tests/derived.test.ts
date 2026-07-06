import { daysUntil, formatEUR, mergeTimeline, urgencyColor, yearOneTotal } from "@/lib/derived";

it("computes year one total from cost fields", () => {
  expect(yearOneTotal({
    blockedAccountYear: 11904,
    semesterFee: 250,
    apsFee: 200,
    uniAssistFee: 75,
    visaFee: 75,
    tuitionPerSemester: 0,
    healthInsuranceMonthly: 110,
    months: 12
  })).toBe(13824);
});

it("labels overdue and soon deadlines semantically", () => {
  expect(daysUntil("2026-07-05")).toBe(0);
  expect(urgencyColor(-1)).toBe("#c65b43");
  expect(urgencyColor(30)).toBe("#c98a2e");
});

it("merges and sorts timeline records from source entities", () => {
  const events = mergeTimeline(
    [{ id: "tum", name: "TU Munich", program: "MSc AI", city: "Munich", gpaReq: "2.5", languageReq: "IELTS 6.5", apsRequired: true, tuitionPerSemester: 0, deadline: "2026-08-01", status: "Researching", link: "#" }],
    [{ id: "daad", name: "DAAD Study Scholarships", provider: "DAAD", amount: "Varies", deadline: "2026-07-20", link: "#", status: "In progress" }],
    [{ id: "visa", label: "Book visa appointment", date: "2026-07-10" }]
  );
  expect(events.map((e) => e.label)).toEqual(["Book visa appointment", "DAAD Study Scholarships", "TU Munich"]);
});

it("formats euro values without cents", () => {
  expect(formatEUR(13824)).toContain("13,824");
});
