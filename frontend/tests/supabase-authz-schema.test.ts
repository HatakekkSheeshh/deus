import fs from "node:fs";
import path from "node:path";

const migrationsDir = path.join(process.cwd(), "..", "supabase", "migrations");

function readMigrations() {
  return fs.readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => fs.readFileSync(path.join(migrationsDir, file), "utf8"))
    .join("\n");
}

it("defines the Supabase auth and authorization foundation tables", () => {
  const sql = readMigrations();

  for (const table of ["profiles", "workspaces", "workspace_members", "access_tokens", "access_token_audit_logs"]) {
    expect(sql).toMatch(new RegExp(`create table public\\.${table}\\b`, "i"));
    expect(sql).toMatch(new RegExp(`alter table public\\.${table}\\s+enable row level security`, "i"));
  }

  expect(sql).toMatch(/role\s+public\.workspace_role\s+not null/i);
  expect(sql).toMatch(/create type public\.workspace_role as enum \('applicant', 'family', 'counselor'\)/i);
  expect(sql).toMatch(/workspace_id uuid not null references public\.workspaces\(id\) on delete cascade/i);
  expect(sql).toMatch(/user_id uuid references auth\.users\(id\) on delete cascade/i);
});

it("stores access tokens as hashes with expiry and revocation fields", () => {
  const sql = readMigrations();

  expect(sql).toMatch(/token_hash text not null unique/i);
  expect(sql).toMatch(/expires_at timestamptz not null/i);
  expect(sql).toMatch(/status public\.access_token_status not null default 'active'/i);
  expect(sql).toMatch(/last_used_at timestamptz/i);
  expect(sql).toMatch(/redeemed_at timestamptz/i);
  expect(sql).toMatch(/revoked_at timestamptz/i);
  expect(sql).not.toMatch(/\btoken text\b/i);
  expect(sql).not.toMatch(/\braw_token\b/i);
});

it("records simple access-token audit events without storing plaintext tokens", () => {
  const sql = readMigrations();

  expect(sql).toMatch(/create type public\.access_token_status as enum \('active', 'redeemed', 'revoked', 'expired'\)/i);
  expect(sql).toMatch(/create table public\.access_token_audit_logs/i);
  expect(sql).toMatch(/access_token_id uuid references public\.access_tokens\(id\) on delete set null/i);
  expect(sql).toMatch(/event text not null check \(event in \('generated', 'redeemed', 'revoked', 'failed_redeem'\)\)/i);
  expect(sql).toMatch(/metadata jsonb not null default '\{\}'::jsonb/i);
  expect(sql).not.toMatch(/access_token_audit_logs[\s\S]*\btoken text\b/i);
});

it("creates profile bootstrap and RLS policies for owner read-write and shared read-only access", () => {
  const sql = readMigrations();

  expect(sql).toMatch(/create or replace function public\.handle_new_auth_user\(\)/i);
  expect(sql).toMatch(/create trigger on_auth_user_created/i);
  expect(sql).toMatch(/after insert on auth\.users/i);
  expect(sql).toMatch(/public\.is_workspace_member\(workspace_id uuid, allowed_roles public\.workspace_role\[\]\)/i);
  expect(sql).toMatch(/for all\s+to authenticated\s+using\s+\(public\.is_workspace_member\(id, array\['applicant'\]::public\.workspace_role\[\]\)\)/i);
  expect(sql).toMatch(/for select\s+to authenticated\s+using\s+\(public\.is_workspace_member\(id, array\['applicant', 'family', 'counselor'\]::public\.workspace_role\[\]\)\)/i);
  expect(sql).toMatch(/with check\s+\(public\.is_workspace_member\(id, array\['applicant'\]::public\.workspace_role\[\]\)\)/i);
});
