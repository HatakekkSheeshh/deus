type EnvSource = Record<string, string | undefined>;

export interface SupabaseBrowserEnv {
  url: string;
  anonKey: string;
}

export interface SupabaseServerEnv extends SupabaseBrowserEnv {
  serviceRoleKey?: string;
  accessTokenPepper?: string;
}

function required(env: EnvSource, key: string) {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing Supabase environment variable: ${key}`);
  return value;
}

export function getSupabaseBrowserEnvFrom(env: EnvSource): SupabaseBrowserEnv {
  return {
    url: required(env, "NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: required(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  };
}

export function getSupabaseServerEnvFrom(
  env: EnvSource,
  options: { requireServiceRole?: boolean } = {}
): SupabaseServerEnv {
  const browserEnv = getSupabaseBrowserEnvFrom(env);
  const serviceRoleKey = options.requireServiceRole
    ? required(env, "SUPABASE_SERVICE_ROLE_KEY")
    : env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  return {
    ...browserEnv,
    ...(serviceRoleKey ? { serviceRoleKey } : {}),
    ...(env.ACCESS_TOKEN_PEPPER?.trim() ? { accessTokenPepper: env.ACCESS_TOKEN_PEPPER.trim() } : {})
  };
}

export function getSupabaseBrowserEnv() {
  return getSupabaseBrowserEnvFrom(process.env);
}

export function getSupabaseServerEnv(options: { requireServiceRole?: boolean } = {}) {
  return getSupabaseServerEnvFrom(process.env, options);
}
