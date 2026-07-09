import { NextResponse } from "next/server";
import { hashAccessToken, normalizeAccessToken } from "@/lib/server/access-token";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";

async function recordFailedRedeem(admin: ReturnType<typeof createSupabaseServiceRoleClient>, reason: string) {
  await admin.from("access_token_audit_logs").insert({
    event: "failed_redeem",
    metadata: { reason }
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { token?: unknown };
  const cleaned = typeof body.token === "string" ? normalizeAccessToken(body.token) : "";
  if (!cleaned) return NextResponse.json({ error: "Access token is required" }, { status: 400 });

  const admin = createSupabaseServiceRoleClient();
  const { data: accessToken, error: lookupError } = await admin
    .from("access_tokens")
    .select("id, workspace_id, role, token_hash, expires_at, redeemed_at, revoked_at, status")
    .eq("token_hash", hashAccessToken(cleaned))
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: "Could not redeem access token" }, { status: 500 });
  if (!accessToken) {
    await recordFailedRedeem(admin, "not_found");
    return NextResponse.json({ error: "Invalid or expired access token" }, { status: 401 });
  }

  const expired = new Date(accessToken.expires_at).getTime() <= Date.now();
  if (accessToken.status !== "active" || accessToken.revoked_at || accessToken.redeemed_at || expired) {
    await admin.from("access_token_audit_logs").insert({
      access_token_id: accessToken.id,
      workspace_id: accessToken.workspace_id,
      event: "failed_redeem",
      metadata: { reason: expired ? "expired" : "inactive", status: accessToken.status }
    });
    return NextResponse.json({ error: "Invalid or expired access token" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const { error: updateError } = await admin
    .from("access_tokens")
    .update({
      last_used_at: now,
      redeemed_at: now,
      status: "redeemed"
    })
    .eq("id", accessToken.id);

  if (updateError) return NextResponse.json({ error: "Could not redeem access token" }, { status: 500 });

  await admin.from("workspace_members").insert({
    workspace_id: accessToken.workspace_id,
    role: accessToken.role,
    invited_email: `access-token-${accessToken.id}@local.invalid`
  });

  await admin.from("access_token_audit_logs").insert({
    access_token_id: accessToken.id,
    workspace_id: accessToken.workspace_id,
    event: "redeemed",
    metadata: { role: accessToken.role }
  });

  return NextResponse.json({
    role: accessToken.role,
    workspaceId: accessToken.workspace_id
  });
}
