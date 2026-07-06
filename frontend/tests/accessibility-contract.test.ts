import fs from "node:fs";

it("includes reduced motion and focus-visible styles", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");
  expect(css).toContain("prefers-reduced-motion");
  expect(css).toContain(":focus-visible");
});

it("includes the app shell and responsive layout contract", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");
  for (const required of ["--sidebar-w", "--main-pad-x", "--z-chat", ".app-shell", ".app-sidebar", ".app-main", ".dashboard-stat-grid", "max-width: calc(100vw - 32px)"]) {
    expect(css).toContain(required);
  }
});

it("keeps banned visual patterns out of global CSS", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");
  expect(css).not.toContain("background-clip: text");
  expect(css).not.toContain("repeating-linear-gradient");
  expect(css).not.toContain("border-left: 4px");
});

it("keeps action layouts in reusable classes instead of inline flex styles", () => {
  const accessView = fs.readFileSync("components/access/AccessSharingView.tsx", "utf8");
  const documentLibrary = fs.readFileSync("components/library/DocumentLibrary.tsx", "utf8");

  expect(accessView).toContain("token-actions");
  expect(documentLibrary).toContain("library-file-actions");
  expect(accessView).not.toContain('style={{ display: "flex"');
  expect(documentLibrary).not.toContain('style={{ display: "flex"');
});

it("keeps dynamic timeline pill colors tokenized", () => {
  const timelineView = fs.readFileSync("components/timeline/TimelineView.tsx", "utf8");

  expect(timelineView).not.toContain('"#fff"');
  expect(timelineView).toContain("var(--card)");
});

it("declares a responsive viewport for mobile browsers", () => {
  const layout = fs.readFileSync("app/layout.tsx", "utf8");

  expect(layout).toContain("Viewport");
  expect(layout).toContain("width: \"device-width\"");
  expect(layout).toContain("initialScale: 1");
});
