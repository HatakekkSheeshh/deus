import fs from "node:fs";

it("uses a phone-specific shell instead of compressing the desktop sidebar", () => {
  const sidebar = fs.readFileSync("components/Sidebar.tsx", "utf8");
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(sidebar).toContain("mobile-shell-menu");
  expect(sidebar).toContain('t(lang, "app.more")');
  expect(css).toContain(".mobile-shell-menu");
  expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.nav-list[\s\S]*position: fixed/);
  expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.nav-list[\s\S]*bottom: 0/);
  expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.nav-list[\s\S]*overflow-x: auto/);
});

it("prevents dense phone layouts from forcing page-level horizontal zoom", () => {
  const css = fs.readFileSync("app/globals.css", "utf8");

  expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.app-main[\s\S]*overflow-x: clip/);
  expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.card[\s\S]*min-width: 0/);
  expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.toolbar-card[\s\S]*min-width: 0/);
  expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*\.document-row[\s\S]*min-width: 0/);
});
