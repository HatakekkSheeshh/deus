import { execFileSync } from "node:child_process";

const runtimeSources = [
  "lib/onboarding.ts",
  "lib/persistence.ts",
  "lib/reducer.ts",
  "lib/i18n.ts"
];

function isGitIgnored(path: string) {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { cwd: process.cwd(), stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

it("keeps runtime frontend source files visible to Vercel's git checkout", () => {
  for (const source of runtimeSources) {
    expect(isGitIgnored(source)).toBe(false);
  }
});
