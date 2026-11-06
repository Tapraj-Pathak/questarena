import Link from "next/link";

interface GameCardProps {
  game: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    developerName: string;
    thumbnailUrl: string | null;
    bannerUrl: string | null;
    integrationType: string;
    launchUrl: string | null;
    playable: boolean;
    featured: boolean;
    rules: unknown;
    _count: { campaigns: number };
  };
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/games/${game.slug}`} className="game-card" aria-label={`Open ${game.name}`}>
      {game.thumbnailUrl && (
        <img
          src={game.thumbnailUrl}
          alt=""
          width={640}
          height={360}
          className="game-card-thumb"
        />
      )}
      <div className="game-card-body">
        <div className="inline" style={{ gap: 6 }}>
          <span className="badge badge-game">{game.category}</span>
          {game.playable ? (
            <span className="badge badge-live">Playable</span>
          ) : (
            <span className="badge">External</span>
          )}
        </div>
        <strong className="game-card-name">{game.name}</strong>
        <span className="faint" style={{ fontSize: 12 }}>
          {game.developerName} · {game._count.campaigns} campaign{game._count.campaigns !== 1 ? "s" : ""}
        </span>
      </div>
    </Link>
  );
}

