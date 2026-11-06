import Link from "next/link";
import { Trophy, Users } from "lucide-react";
import { usdc } from "@/lib/format";

interface CampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    title: string;
    description: string;
    sponsorType: "GAME_DEVELOPER" | "BRAND";
    sponsorName: string;
    status: string;
    prizePoolUnits: bigint | number;
    startsAt: Date;
    endsAt: Date;
    game: {
      name: string;
      slug: string;
      thumbnailUrl: string | null;
      category: string;
    };
    _count: {
      participants: number;
    };
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const isLive = campaign.status === "ACTIVE";
  const isBrand = campaign.sponsorType === "BRAND";

  return (
    <Link
      href={`/competitions/${campaign.slug}`}
      className="campaign-card"
      aria-label={`Open ${campaign.title}`}
    >
      {campaign.game.thumbnailUrl && (
        <img
          src={campaign.game.thumbnailUrl}
          alt=""
          width={640}
          height={360}
          className="campaign-card-thumb"
        />
      )}
      <div className="campaign-card-body">
        <div className="inline" style={{ gap: 6 }}>
          <span className={`badge ${isBrand ? "badge-brand" : "badge-game"}`}>
            {isBrand ? "Brand" : "Game dev"}
          </span>
          {isLive && <span className="status status-live">Live</span>}
        </div>
        <strong className="campaign-card-title">{campaign.title}</strong>
        <span className="faint" style={{ fontSize: 12 }}>
          {campaign.game.name} · {campaign.sponsorName}
        </span>
        <div className="inline" style={{ gap: 8, marginTop: 4 }}>
          <span className="badge badge-prize">
            <Trophy size={12} aria-hidden="true" /> {usdc(campaign.prizePoolUnits)}
          </span>
          <span className="badge">
            <Users size={12} aria-hidden="true" /> {campaign._count.participants}
          </span>
        </div>
      </div>
    </Link>
  );
}

