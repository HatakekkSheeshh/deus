import fs from "node:fs";

it("defines required design tokens, layout tokens, and theme presets", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");
  for (const token of ["--bg", "--sidebar-bg", "--card", "--accent", "--ink", "--ink-06", "--ink-7", "--r-lg", "--font-heading", "--space-sm", "--space-6xl", "--sidebar-w", "--chat-panel-w", "--timeline-days-pill", "--z-chat"]) {
    expect(css).toContain(token);
  }
  for (const theme of ['data-theme="warm"', 'data-theme="cool"', 'data-theme="forest"', 'data-theme="terracotta"']) {
    expect(css).toContain(theme);
  }
});
