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

it("uses a blue main accent for the forest theme", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/\[data-theme="forest"\]\s*{[^}]*--accent:\s*#7bb7e6;/s);
});

it("keeps the assistant panel floating without an inner chat frame", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/\.floating-chat-panel\s*{[^}]*position:\s*fixed;[^}]*border:\s*0;/s);
  expect(css).toMatch(/\.chat-log\s*{[^}]*background:\s*transparent;[^}]*border:\s*0;/s);
});

it("lays out the dashboard cost breakdown as a pie chart with a right-side legend", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/\.cost-breakdown\s*{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(140px,\s*180px\) minmax\(0,\s*1fr\);/s);
  expect(css).toMatch(/\.cost-pie\s*{[^}]*aspect-ratio:\s*1;[^}]*border-radius:\s*999px;/s);
  expect(css).toMatch(/\.cost-legend\s*{[^}]*display:\s*grid;[^}]*gap:\s*var\(--space-sm\);/s);
  expect(css).toMatch(/\.cost-legend-row\s*{[^}]*grid-template-columns:\s*12px minmax\(0,\s*1fr\) auto;/s);
});

it("styles the upcoming deadline preview as a light divided list", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/\.dashboard-card-head\s*{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;/s);
  expect(css).toMatch(/\.deadline-preview-list\s*{[^}]*display:\s*grid;[^}]*list-style:\s*none;/s);
  expect(css).toMatch(/\.deadline-preview-row\s*{[^}]*grid-template-columns:\s*10px minmax\(0,\s*1fr\) auto;/s);
  expect(css).toMatch(/\.deadline-dot\s*{[^}]*background:\s*var\(--accent\);[^}]*border-radius:\s*999px;/s);
  expect(css).toMatch(/\.deadline-preview-item\s*\+\s*\.deadline-preview-item\s*{[^}]*border-top:\s*1px solid var\(--ink-08\);/s);
});

it("adapts the app shell and controls for touch-sized mobile screens", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/@media\s*\(pointer:\s*coarse\)\s*{[^}]*\.btn,[^}]*\.icon-btn,[^}]*\.nav-item,[^}]*\.field input,[^}]*\.field select,[^}]*\.field textarea\s*{[^}]*min-height:\s*44px;/s);
  expect(css).toMatch(/@media\s*\(max-width:\s*900px\)/);
  expect(css).toMatch(/\.app-sidebar\s*{[^}]*position:\s*sticky;[^}]*top:\s*0;/s);
  expect(css).toMatch(/\.nav-list\s*{[^}]*display:\s*flex;[^}]*overflow-x:\s*auto;/s);
  expect(css).toMatch(/@media\s*\(max-width:\s*640px\)/);
  expect(css).toMatch(/\.floating-chat-panel\s*{[^}]*left:\s*max\(12px,\s*env\(safe-area-inset-left\)\);[^}]*right:\s*max\(12px,\s*env\(safe-area-inset-right\)\);/s);
});

it("standardizes placeholder contrast across field controls", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/\.field input::placeholder,[\s\r\n]+\.field textarea::placeholder\s*{[^}]*color:\s*var\(--ink-65\);[^}]*opacity:\s*1;/s);
});

it("polishes shared controls with consistent state feedback", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/\.btn,[\s\r\n]+\.icon-btn,[\s\r\n]+\.nav-item,[\s\r\n]+\.auth-mode-tab,[\s\r\n]+\.segmented-control button\s*{[^}]*transition:\s*background-color 180ms ease,[^}]*color 180ms ease,[^}]*transform 180ms ease;/s);
  expect(css).toMatch(/\.btn:not\(:disabled\):hover,[\s\r\n]+\.icon-btn:not\(:disabled\):hover,[\s\r\n]+\.nav-item:hover,[\s\r\n]+\.auth-mode-tab:hover,[\s\r\n]+\.segmented-control button:hover\s*{[^}]*transform:\s*translateY\(-1px\);/s);
  expect(css).toMatch(/\.btn:not\(:disabled\):active,[\s\r\n]+\.icon-btn:not\(:disabled\):active,[\s\r\n]+\.nav-item:active,[\s\r\n]+\.auth-mode-tab:active,[\s\r\n]+\.segmented-control button:active\s*{[^}]*transform:\s*translateY\(0\);/s);
});

it("provides a visible loading surface for code-split workspace views", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toContain(".view-loading");
  expect(css).toContain(".skeleton-line");
  expect(css).toMatch(/\.skeleton-line\s*{[^}]*background:\s*linear-gradient/s);
});

it("avoids alignment keywords that create autoprefixer noise", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).not.toMatch(/justify-(?:self|items):\s*(?:start|end);/);
});

it("stretches the login card within narrow mobile viewports", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/@media\s*\(max-width:\s*640px\)\s*{[\s\S]*\.login-screen\s*{[^}]*justify-items:\s*stretch;/s);
  expect(css).toMatch(/\.login-card\s*{[^}]*max-width:\s*100%;[^}]*min-width:\s*0;/s);
});

it("keeps the language switch compact inside grid layouts", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/\.language-switch\s*{[^}]*justify-self:\s*flex-start;/s);
});
