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
