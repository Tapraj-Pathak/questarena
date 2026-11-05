import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

const startSchema = z.object({
  gameSlug: z.literal("neon-reaction"),
  rounds: z.literal(10),
});

type DevelopmentSession = {
  id: string;
  gameSlug: string;
  rounds: number;
  expiresAt: number;
};

const sessions = new Map<string, DevelopmentSession>();

export async function POST(request: Request) {
  const parsed = startSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid game session request" }, { status: 400 });
  }

  const session: DevelopmentSession = {
    id: randomUUID(),
    gameSlug: parsed.data.gameSlug,
    rounds: parsed.data.rounds,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  sessions.set(session.id, session);

  return NextResponse.json({
    sessionId: session.id,
    configuration: {
      rounds: session.rounds,
      targetLifetimeMs: 1400,
      seed: randomUUID(),
    },
    expiresAt: new Date(session.expiresAt).toISOString(),
  });
}
