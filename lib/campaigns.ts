import type { CampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Human-readable labels for every campaign status, plus a convenience UPCOMING
 *  label used on the homepage calendar for campaigns that haven't started yet. */
export const statusLabel: Record<CampaignStatus | "UPCOMING", string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  FUNDED: "Funded",
  ACTIVE: "Live",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
  FINALIZED: "Finalized",
  UPCOMING: "Upcoming",
};

/* -------------------------------------------------------------------------- */
/*  Campaign helpers used by game-session API routes                          */
/* -------------------------------------------------------------------------- */

interface CampaignLike {
  status: CampaignStatus;
  startsAt: Date;
  endsAt: Date;
  rules: unknown;
}

/**
 * Compute a display status string for a campaign, factoring in the current
 * wall-clock time so that an ACTIVE campaign whose window has closed is shown
 * as ended.
 */
export function displayStatus(campaign: CampaignLike): string {
  const now = Date.now();
  if (campaign.status === "ACTIVE" && campaign.endsAt.getTime() > now && campaign.startsAt.getTime() <= now) {
    return "LIVE";
  }
  if (
    (campaign.status === "PUBLISHED" || campaign.status === "FUNDED") &&
    campaign.startsAt.getTime() > now
  ) {
    return "UPCOMING";
  }
  return campaign.status;
}

/**
 * Return the maximum number of game-session attempts a player is allowed
 * for a given campaign.  Defaults to 5 if not specified in the campaign rules.
 */
export function attemptLimit(campaign: { rules: unknown }): number {
  const rules = campaign.rules as Record<string, unknown> | null;
  if (rules && typeof rules.maxAttempts === "number" && rules.maxAttempts > 0) {
    return rules.maxAttempts;
  }
  return 5;
}

/**
 * Count how many completed (non-cancelled) game sessions a player has
 * already used for a campaign.
 */
export async function attemptsUsed(campaignId: string, userId: string): Promise<number> {
  return prisma.gameSession.count({
    where: {
      campaignId,
      playerId: userId,
      status: { notIn: ["CANCELLED"] },
    },
  });
}
