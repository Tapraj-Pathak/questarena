import { prisma } from "@/lib/prisma";

/**
 * Aggregate stats shown in the hero section of the homepage.
 */
export async function catalogStats() {
  const now = new Date();

  const [liveCampaigns, players, poolAgg] = await Promise.all([
    prisma.campaign.count({
      where: { status: "ACTIVE", endsAt: { gt: now } },
    }),
    prisma.user.count(),
    prisma.campaign.aggregate({
      where: { status: "ACTIVE", endsAt: { gt: now } },
      _sum: { prizePoolUnits: true },
    }),
  ]);

  return {
    liveCampaigns,
    players,
    pool: poolAgg._sum.prizePoolUnits ?? BigInt(0),
  };
}
