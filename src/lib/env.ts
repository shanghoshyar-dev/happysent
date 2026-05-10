type EnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "RESEND_API_KEY"
  | "ADMIN_EMAIL"
  | "CRON_SECRET";

/**
 * Public env vars MUST be accessed by literal property name in source so that
 * Next.js's compile-time string replacement inlines them into the client
 * bundle. `process.env[key]` (computed access) only works server-side.
 *
 * Server-only vars are looked up dynamically — fine since they're only read
 * from server code.
 */
function readEnv(key: EnvKey): string | undefined {
  switch (key) {
    case "NEXT_PUBLIC_SUPABASE_URL":
      return process.env.NEXT_PUBLIC_SUPABASE_URL;
    case "NEXT_PUBLIC_SUPABASE_ANON_KEY":
      return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    default:
      return process.env[key];
  }
}

const PUBLIC_KEYS: EnvKey[] = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

export function requireEnv(key: EnvKey): string {
  const value = readEnv(key);
  if (!value || value.length === 0) {
    if (typeof window !== "undefined" && !PUBLIC_KEYS.includes(key)) {
      throw new Error(
        `Server-only env var ${key} was accessed from the browser. This is a bug.`,
      );
    }
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Copy .env.local.example to .env.local and fill it in.`,
    );
  }
  return value;
}

export function optionalEnv(key: EnvKey): string | undefined {
  return readEnv(key);
}
