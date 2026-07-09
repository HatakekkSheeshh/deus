"use client";

import { createBrowserClient } from "@supabase/ssr";

function required(value: string | undefined, key: string) {
  const cleaned = value?.trim();
  if (!cleaned) throw new Error(`Missing Supabase environment variable: ${key}`);
  return cleaned;
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    required(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    required(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
