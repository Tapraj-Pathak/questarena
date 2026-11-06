import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/api";
import { ApiError, requireUser } from "@/lib/session";
import { getAdapter } from "@/lib/game-adapters";
import { recordWorkflow, runVerification } from "@/lib/verification";

const schema = z.object({ payload: z.unknown() });

export const POST = handle(async (request: Request, context: { params: Promise<{ sessionId: string }> }) => {
  const user = await requireUser();
  const { sessionId } = await context.params;
  const { payload } = await readJson(request, schema);

  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { game: true, campaign: true, result: true, evidence: true },
  });
  if (!session) throw new ApiError(404, "Game session not found.");
  if (session.playerId !== user.id) throw new ApiError(403, "This session belongs to another player.");
  if (session.result) throw new ApiError(409, "This session has already been submitted.");
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.gameSession.update({ where: { id: session.id }, data: { status: "EXPIRED" } });
    throw new ApiError(409, "This session expired. Start a new attempt.");
  }

  const adapter = getAdapter(session.game.slug);
  if (!adapter) throw new ApiError(409, "No adapter for this game.");

  const outcome = adapter.validate(session.configuration as Record<string, unknown>, payload);
  if (!outcome.ok) throw new ApiError(422, outcome.reason);

  const resultHash = adapter.resultHash({ seed: session.seed, payload, score: outcome.score });

  const result = await prisma.$transaction(async (tx) => {
    await tx.gameSession.update({
      where: { id: session.id },
      data: { status: "SUBMITTED", endsAt: new Date() },
    });
    await tx.gameEvidence.create({
      data: {
        sessionId: session.id,
        resultHash,
        // Local evidence store; the interface allows IPFS/CID references.
        evidenceRef: `local://evidence/${session.id}.json`,
        payload: payload as object,
      },
    });
    return tx.gameResult.create({
      data: {
        sessionId: session.id,
        score: BigInt(outcome.score),
        accuracy: outcome.accuracy,
        completionMs: outcome.completionMs,
        moves: outcome.moves,
        resultHash,
        requiredCount: session.campaign.verifyThreshold || 3,
      },
    });
  });

  await recordWorkflow(session.campaignId, result.id);
  const verification = await runVerification(result.id);

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "RESULT_SUBMITTED",
      title: "Run submitted",
      message: `${outcome.score.toLocaleString()} points in ${session.campaign.title}. ${verification.status === "verified" ? "Verifiers approved it." : "Verification is in progress."}`,
    },
  });

  const updated = await prisma.gameResult.findUnique({ where: { id: result.id } });

  return NextResponse.json({
    result: {
      id: result.id,
      score: Number(updated?.score ?? outcome.score),
      accuracy: updated?.accuracy ?? outcome.accuracy,
      completionMs: updated?.completionMs ?? outcome.completionMs,
      moves: updated?.moves ?? outcome.moves,
      status: updated?.status ?? "PENDING",
      verifiedCount: updated?.verifiedCount ?? 0,
      requiredCount: updated?.requiredCount ?? 3,
      detail: outcome.detail,
    },
    verification: verification.status,
  });
});
