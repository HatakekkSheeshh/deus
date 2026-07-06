import fs from "node:fs";
import path from "node:path";

function readFiles(dir: string): string {
  return fs.readdirSync(dir, { withFileTypes: true }).map((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return readFiles(full);
    if (!/\.(ts|tsx)$/.test(entry.name)) return "";
    return fs.readFileSync(full, "utf8");
  }).join("\n");
}

it("does not reference backend service URLs in React components", () => {
  const source = readFiles("components");
  expect(source).not.toContain("DB_SERVICE_URL");
  expect(source).not.toContain("AI_SERVICE_URL");
});
