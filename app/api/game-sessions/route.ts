import { createHash, randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handle, readJson } from "@/lib/api";
import { ApiError, requireUser } from "@/lib/session";
import { getAdapter, memoryDifficulties } from "@/lib/game-adapters";
import { attemptLimit, attemptsUsed, displayStatus } from "@/lib/campaigns";

const schema = z.object({
  campaignSlug: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const POST = handle(async (request: Request) => {
  const user = await requireUser();
  const { campaignSlug, difficulty } = await readJson(request, schema);

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    include: { game: true, participants: { where: { userId: user.id } } },
  });
  if (!campaign) throw new ApiError(404, "Competition not found.");
  if (displayStatus(campaign) !== "LIVE") throw new ApiError(409, "This competition is not open for runs.");
  if (campaign.participants.length === 0) throw new ApiError(403, "Join the competition before playing.");

  const adapter = getAdapter(campaign.game.slug);
  if (!adapter) throw new ApiError(409, "This game is not playable inside QuestArena.");

  const rules = (campaign.rules ?? {}) as Record<string, unknown>;
  const used = await attemptsUsed(campaign.id, user.id);
  const limit = attemptLimit(campaign);
  if (used >= limit) throw new ApiError(409, `You have used all ${limit} attempts for this competition.`);

  const openSession = await prisma.gameSession.findFirst({
    where: { campaignId: campaign.id, playerId: user.id, status: { in: ["CREATED", "ACTIVE"] } },
    orderBy: { createdAt: "desc" },
  });
  if (openSession && openSession.expiresAt.getTime() > Date.now()) {
    return NextResponse.json({
      sessionId: openSession.id,
      configuration: openSession.configuration,
      attempt: used + 1,
      attemptsLeft: limit - used,
      resumed: true,
    });
  }

  const seed = randomUUID();
  const chosenDifficulty = difficulty ?? (typeof rules.difficulty === "string" ? rules.difficulty : "medium");
  if (!memoryDifficulties().includes(chosenDifficulty) && campaign.game.slug === "memory-match") {
    throw new ApiError(400, "Unknown difficulty.");
  }

  const configuration = adapter.createConfig({ difficulty: chosenDifficulty, seed, rules }) as Prisma.InputJsonValue;
  const session = await prisma.gameSession.create({
    data: {
      campaignId: campaign.id,
      gameId: campaign.gameId,
      playerId: user.id,
      rulesHash: createHash("sha256").update(JSON.stringify(rules)).digest("hex"),
      seed,
      configuration,
      status: "ACTIVE",
      startsAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60_000),
    },
  });

  return NextResponse.json({
    sessionId: session.id,
    configuration,
    attempt: used + 1,
    attemptsLeft: limit - used - 1,
  });
});
