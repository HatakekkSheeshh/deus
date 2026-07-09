import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/admin";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { generateAccessToken, hashAccessToken, type ShareRole } from "@/lib/server/access-token";

const shareRoles = new Set(["family", "counselor"]);

function isShareRole(role: unknown): role is ShareRole {
  return typeof role === "string" && shareRoles.has(role);
}

export async function POST(request: Request) {
  const routeClient = await createSupabaseRouteClient();
  const { data: authData, error: authError } = await routeClient.auth.getUser();
  if (authError || !authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { role?: unknown };
  if (!isShareRole(body.role)) return NextResponse.json({ error: "Role must be family or counselor" }, { status: 400 });

  const admin = createSupabaseServiceRoleClient();
  const { data: membership, error: membershipError } = await admin
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", authData.user.id)
    .eq("role", "applicant")
    .limit(1)
    .maybeSingle();

  if (membershipError) return NextResponse.json({ error: "Could not verify workspace access" }, { status: 500 });
  if (!membership) return NextResponse.json({ error: "Applicant workspace not found" }, { status: 404 });

  const token = generateAccessToken(body.role);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const { data: inserted, error: insertError } = await admin
    .from("access_tokens")
    .insert({
      workspace_id: membership.workspace_id,
      role: body.role,
      token_hash: hashAccessToken(token),
      created_by: authData.user.id,
      expires_at: expiresAt,
      status: "active"
    })
    .select("id")
    .single();

  if (insertError) return NextResponse.json({ error: "Could not generate access token" }, { status: 500 });

  await admin.from("access_token_audit_logs").insert({
    access_token_id: inserted.id,
    workspace_id: membership.workspace_id,
    actor_user_id: authData.user.id,
    event: "generated",
    metadata: { role: body.role }
  });

  return NextResponse.json({ role: body.role, token, expiresAt });
}
