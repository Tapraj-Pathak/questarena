import { NextResponse } from "next/server";
import { z } from "zod";

const resultSchema = z.object({
  events: z.array(z.object({
    type: z.enum(["hit", "miss"]),
    reactionMs: z.number().int().min(0).max(1400).optional(),
  })).length(10),
});

export async function POST(request: Request, context: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await context.params;
  const parsed = resultSchema.safeParse(await request.json());
  if (!parsed.success || !sessionId || sessionId.length > 128) {
    return NextResponse.json({ error: "Invalid result payload" }, { status: 400 });
  }

  const hits = parsed.data.events.filter((event) => event.type === "hit");
  const score = hits.reduce((total, event) => {
    const reaction = event.reactionMs ?? 1400;
    return total + Math.max(100, 1100 - reaction);
  }, 0);
  const scoreAccuracy = Math.round((hits.length / parsed.data.events.length) * 100);

  return NextResponse.json({
    sessionId,
    result: {
      score,
      accuracy: scoreAccuracy,
      hits: hits.length,
      misses: parsed.data.events.length - hits.length,
      averageReactionMs: hits.length
        ? Math.round(hits.reduce((total, event) => total + (event.reactionMs ?? 1400), 0) / hits.length)
        : null,
    },
  });
}
