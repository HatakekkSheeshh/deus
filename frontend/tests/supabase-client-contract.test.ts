import fs from "node:fs";

it("declares the Supabase packages used by browser, server, and admin clients", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8")) as { dependencies?: Record<string, string> };

  expect(pkg.dependencies?.["@supabase/ssr"]).toBeTruthy();
  expect(pkg.dependencies?.["@supabase/supabase-js"]).toBeTruthy();
});

it("keeps service-role Supabase access in a server-only admin client", () => {
  const adminClient = fs.readFileSync("lib/supabase/admin.ts", "utf8");
  const browserClient = fs.readFileSync("lib/supabase/browser.ts", "utf8");

  expect(adminClient).toContain("server-only");
  expect(adminClient).toContain("createClient");
  expect(adminClient).toContain("requireServiceRole: true");
  expect(browserClient).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  expect(browserClient).not.toContain("serviceRoleKey");
});

it("uses direct NEXT_PUBLIC env references in the browser client for Next.js bundling", () => {
  const browserClient = fs.readFileSync("lib/supabase/browser.ts", "utf8");

  expect(browserClient).toContain("process.env.NEXT_PUBLIC_SUPABASE_URL");
  expect(browserClient).toContain("process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  expect(browserClient).not.toContain("getSupabaseBrowserEnv()");
});

it("uses the SSR cookie adapter for Next route-handler Supabase sessions", () => {
  const serverClient = fs.readFileSync("lib/supabase/server.ts", "utf8");

  expect(serverClient).toContain("createServerClient");
  expect(serverClient).toContain("cookies");
  expect(serverClient).toContain("getAll()");
  expect(serverClient).toContain("setAll");
});
