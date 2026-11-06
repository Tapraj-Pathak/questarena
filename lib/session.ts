import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { config } from "@/lib/config";

/**
 * Custom error class that API route handlers translate into JSON error
 * responses with the appropriate HTTP status code.
 */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Development-mode fallback user seed id. Used when Clerk is not configured so
 * that the app still functions with a seeded account.
 */
const DEV_USER_CLERK_ID = "dev_user_001";

/**
 * Return the current database User row for the signed-in user, or `null` if
 * the visitor is not authenticated.
 *
 * When Clerk is disabled it returns the first seeded user (if any).
 */
export async function getSessionUser() {
  if (config.clerkEnabled) {
    const session = await auth();
    if (!session.userId) return null;
    return prisma.user.findUnique({ where: { clerkUserId: session.userId } });
  }

  // Dev mode: return the first seeded user.
  return prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
}

/**
 * Like `getSessionUser` but throws a 401 `ApiError` when no user is found.
 * Intended for API route handlers that require authentication.
 */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "You must be signed in.");
  return user;
}

