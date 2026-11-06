import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { ApiError } from "@/lib/session";

/**
 * Wrap an async handler so it catches `ApiError` instances and returns
 * structured JSON error responses.
 */
export function handle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (request: Request, context: any) => Promise<NextResponse>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: Request, context: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      console.error("[api]", error);
      return NextResponse.json({ error: "Internal server error." }, { status: 500 });
    }
  };
}

/**
 * Read and validate JSON from a request body using a Zod schema. Throws a
 * 400 `ApiError` when parsing fails.
 */
export async function readJson<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body.");
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, result.error.issues.map((issue) => issue.message).join("; "));
  }
  return result.data;
}
