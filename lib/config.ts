/** Runtime configuration, safe for server and client code. */
export const config = {
  /** Whether real Clerk authentication is configured (keys present). */
  clerkEnabled: !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
  ),

  /** Base URL for the app. */
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",

  /** Database URL (server-only, but safe to reference as env). */
  databaseUrl: process.env.DATABASE_URL ?? "",
} as const;

