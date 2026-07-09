import {
  getSupabaseBrowserEnvFrom,
  getSupabaseServerEnvFrom
} from "@/lib/supabase/env";

it("reads the browser-safe Supabase env contract", () => {
  const env = getSupabaseBrowserEnvFrom({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "server-only"
  });

  expect(env).toEqual({
    url: "https://example.supabase.co",
    anonKey: "anon-key"
  });
});

it("throws a specific error when browser Supabase env is missing", () => {
  expect(() => getSupabaseBrowserEnvFrom({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }))
    .toThrow("Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
});

it("reads server-only Supabase env without exposing it to browser helpers", () => {
  const env = getSupabaseServerEnvFrom({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role",
    ACCESS_TOKEN_PEPPER: "pepper"
  });

  expect(env).toEqual({
    url: "https://example.supabase.co",
    anonKey: "anon-key",
    serviceRoleKey: "service-role",
    accessTokenPepper: "pepper"
  });
});

it("requires service role key when requested for privileged server clients", () => {
  expect(() => getSupabaseServerEnvFrom({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key"
  }, { requireServiceRole: true })).toThrow("Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY");
});
