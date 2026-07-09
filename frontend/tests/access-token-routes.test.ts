import fs from "node:fs";
import path from "node:path";

const generateRoutePath = path.join(process.cwd(), "app", "api", "v1", "access-tokens", "generate", "route.ts");
const redeemRoutePath = path.join(process.cwd(), "app", "api", "v1", "access-tokens", "redeem", "route.ts");
const legacyRoleRoutePath = path.join(process.cwd(), "app", "api", "v1", "access-tokens", "[role]", "route.ts");
const callbackRoutePath = path.join(process.cwd(), "app", "auth", "callback", "route.ts");

function readRoute(routePath: string) {
  return fs.readFileSync(routePath, "utf8");
}

it("implements access-token generation as an authenticated service-role route", () => {
  const source = readRoute(generateRoutePath);

  expect(source).toMatch(/export async function POST/i);
  expect(source).toMatch(/createSupabaseRouteClient/i);
  expect(source).toMatch(/createSupabaseServiceRoleClient/i);
  expect(source).toMatch(/auth\.getUser\(\)/i);
  expect(source).toMatch(/generateAccessToken/i);
  expect(source).toMatch(/hashAccessToken/i);
  expect(source).toMatch(/access_tokens/i);
  expect(source).toMatch(/access_token_audit_logs/i);
  expect(source).toMatch(/status:\s*"active"/i);
  expect(source).not.toMatch(/serviceRoleKey/i);
});

it("does not keep the old mock role-based access-token route", () => {
  expect(fs.existsSync(legacyRoleRoutePath)).toBe(false);
});

it("implements access-token redeem with hash lookup, last-used tracking, and audit events", () => {
  const source = readRoute(redeemRoutePath);

  expect(source).toMatch(/export async function POST/i);
  expect(source).toMatch(/createSupabaseServiceRoleClient/i);
  expect(source).toMatch(/hashAccessToken/i);
  expect(source).toMatch(/normalizeAccessToken/i);
  expect(source).toMatch(/token_hash/i);
  expect(source).toMatch(/last_used_at/i);
  expect(source).toMatch(/redeemed_at/i);
  expect(source).toMatch(/status:\s*"redeemed"/i);
  expect(source).toMatch(/workspace_members/i);
  expect(source).toMatch(/access_token_audit_logs/i);
  expect(source).not.toMatch(/\braw_token\b/i);
  expect(source).not.toMatch(/\btoken:\s*cleaned/i);
});

it("implements the Supabase OAuth callback route for Google sign-in", () => {
  const source = readRoute(callbackRoutePath);

  expect(source).toMatch(/export async function GET/i);
  expect(source).toMatch(/createSupabaseRouteClient/i);
  expect(source).toMatch(/exchangeCodeForSession/i);
  expect(source).toMatch(/NextResponse\.redirect/i);
});
