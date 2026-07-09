import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerEnv } from "./env";

export function createSupabaseServiceRoleClient() {
  const env = getSupabaseServerEnv({ requireServiceRole: true });
  if (!env.serviceRoleKey) throw new Error("Missing Supabase environment variable: SUPABASE_SERVICE_ROLE_KEY");

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
