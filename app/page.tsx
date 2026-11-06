import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Flame, ShieldCheck, Swords, Trophy, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { catalogStats } from "@/lib/catalog";
import { GameCard } from "@/components/game-card";
import { CampaignCard } from "@/components/campaign-card";
import { usdc } from "@/lib/format";
import { statusLabel } from "@/lib/campaigns";


const include = {
  game: { select: { name: true, slug: true, thumbnailUrl: true, category: true } },
  _count: { select: { participants: true } },
} as const;

async function DynamicHome() {
  await connection();
  const now = new Date();
  const [stats, featured, live, gameSponsored, brandSponsored, upcoming, completed, games, brands] = await Promise.all([
    catalogStats(),
    prisma.campaign.findFirst({
      where: { status: "ACTIVE", endsAt: { gt: now }, sponsorType: "BRAND" },
      orderBy: { startsAt: "desc" },
      include,
    }),
    prisma.campaign.findMany({
      where: { status: "ACTIVE", endsAt: { gt: now } },
      orderBy: { prizePoolUnits: "desc" },
      take: 4,
      include,
    }),
    prisma.campaign.findMany({
      where: { status: "ACTIVE", endsAt: { gt: now }, sponsorType: "GAME_DEVELOPER" },
      orderBy: { endsAt: "asc" },
      take: 3,
      include,
    }),
    prisma.campaign.findMany({
      where: { sponsorType: "BRAND", status: { in: ["ACTIVE", "PUBLISHED"] } },
      orderBy: { startsAt: "asc" },
      take: 3,
      include,
    }),
    prisma.campaign.findMany({
      where: { status: { in: ["PUBLISHED", "FUNDED"] }, startsAt: { gt: now } },
      orderBy: { startsAt: "asc" },
      take: 3,
      include,
    }),
    prisma.campaign.findMany({
      where: { status: "FINALIZED" },
      orderBy: { endsAt: "desc" },
      take: 3,
      include,
    }),
    prisma.game.findMany({
      orderBy: [{ playable: "desc" }, { createdAt: "asc" }],
      take: 6,
      select: {
        id: true, slug: true, name: true, description: true, category: true, developerName: true,
        thumbnailUrl: true, bannerUrl: true, integrationType: true, launchUrl: true, playable: true,
        featured: true, rules: true, _count: { select: { campaigns: true } },
      },
    }),
    prisma.brandSponsorProfile.findMany({ take: 5, orderBy: { createdAt: "asc" } }),
  ]);

  const featuredGame = games.find((game) => game.playable && game.featured) ?? games.find((game) => game.playable) ?? games[0];
  const trending = games.slice(0, 3);

  return (
    <main>
      <div className="container-qa">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">Your next competition starts here.</h1>
            <p className="lead">
              Discover sponsored games, compete in challenges, and earn rewards. Every run is scored by the arena, verified
              by five independent checks and ranked on a public board.
            </p>
            <div className="hero-actions">
              <Link href="/games" className="btn btn-primary btn-lg">
                Explore games <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/for-sponsors" className="btn btn-secondary btn-lg">Launch a campaign</Link>
            </div>
            <dl className="hero-facts">
              <div><strong className="tabular">{stats.liveCampaigns}</strong> live competitions</div>
              <div><strong className="tabular">{stats.players}</strong> registered players</div>
              <div><strong className="tabular prize">{usdc(stats.pool)}</strong> prize pools open</div>
            </dl>
          </div>

          {featuredGame && (
            <Link href={`/games/${featuredGame.slug}`} className="hero-feature" aria-label={`Open ${featuredGame.name}`}>
              {featuredGame.thumbnailUrl && (
                <img src={featuredGame.thumbnailUrl} alt="" width={1360} height={768} />
              )}
              <span className="badge badge-game hero-feature-cta">Featured game</span>
              <div className="hero-feature-info">
                <div>
                  <h2>{featuredGame.name}</h2>
                  <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{featuredGame.category} · {featuredGame.developerName}</p>
                </div>
                <dl>
                  <div><dt>Format</dt><dd>{featuredGame.playable ? "Play now" : "External"}</dd></div>
                  <div><dt>Entry</dt><dd>Free</dd></div>
                </dl>
              </div>
            </Link>
          )}
        </section>

        {featured && (
          <section className="section" aria-labelledby="spotlight-title">
            <div className="section-head">
              <div>
                <h2 id="spotlight-title">Sponsored spotlight</h2>
                <p>Paid brand placements are labelled. The prize pool is sponsor-funded and held in escrow.</p>
              </div>
              <Link href="/competitions" className="text-link">All competitions</Link>
            </div>
            <div className="spotlight">
              <Link href={`/competitions/${featured.slug}`} className="spotlight-main">
                {featured.game.thumbnailUrl && <img src={featured.game.thumbnailUrl} alt="" width={1360} height={768} />}
                <div className="spotlight-copy">
                  <div className="inline">
                    <span className="badge badge-brand">Brand sponsored</span>
                    <span className="badge demo-note">Demo sponsor</span>
                    <span className="status status-live">Live now</span>
                  </div>
                  <h2>{featured.title}</h2>
                  <p>{featured.description}</p>
                  <div className="inline" style={{ marginTop: 4 }}>
                    <span className="badge badge-prize"><Trophy size={12} aria-hidden="true" /> {usdc(featured.prizePoolUnits)} pool</span>
                    <span className="badge"><Users size={12} aria-hidden="true" /> {featured._count.participants} joined</span>
                  </div>
                </div>
              </Link>
              <div className="spotlight-side">
                {live.slice(0, 2).map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section" aria-labelledby="categories-title">
          <div className="section-head">
            <div>
              <h2 id="categories-title">Browse by format</h2>
              <p>Every game is scored by its adapter. Reaction ladders, memory decks and strategy boards each have their own rules.</p>
            </div>
          </div>
          <div className="category-row">
            {Array.from(new Set(games.map((game) => game.category))).map((category) => (
              <Link key={category} href={`/games?category=${encodeURIComponent(category)}`} className="category-card">
                <strong>{category}</strong>
                <span>{games.filter((game) => game.category === category).length} game(s)</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="games-title">
          <div className="section-head">
            <div>
              <h2 id="games-title">Play now</h2>
              <p>Built-in games run in the arena. External titles open on the partner site.</p>
            </div>
            <Link href="/games" className="text-link">All games</Link>
          </div>
          {trending.length ? (
            <div className="game-grid">
              {trending.map((game) => <GameCard key={game.id} game={game} />)}
            </div>
          ) : (
            <p className="state-panel muted">No games are published yet.</p>
          )}
        </section>

        <section className="section" aria-labelledby="split-title">
          <h2 id="split-title" className="visually-hidden">Sponsorship types</h2>
          <div className="dual-band">
            <div className="band">
              <div>
                <span className="badge badge-game">Game sponsored</span>
                <h2 style={{ marginTop: 10 }}>Studios promote their own games</h2>
                <p>Register a title, set the rules and run a launch cup or seasonal ladder. Players see the studio as the sponsor on every surface.</p>
              </div>
              <div className="dash-section" style={{ width: "100%" }}>
                {gameSponsored.length ? gameSponsored.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                )) : <p className="empty-mini">No game-sponsored competitions are open.</p>}
              </div>
              <Link href="/for-developers" className="text-link">How game sponsorship works</Link>
            </div>
            <div className="band">
              <div>
                <span className="badge badge-brand">Brand sponsored</span>
                <h2 style={{ marginTop: 10 }}>Brands sponsor built-in games</h2>
                <p>Pick a QuestArena game, fund the prize pool and choose placements: competition badge, page banner, discovery card or results sponsor.</p>
              </div>
              <div className="dash-section" style={{ width: "100%" }}>
                {brandSponsored.length ? brandSponsored.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                )) : <p className="empty-mini">No brand-sponsored competitions are scheduled.</p>}
              </div>
              <Link href="/for-sponsors" className="text-link">How brand sponsorship works</Link>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="calendar-title">
          <div className="section-head">
            <div>
              <h2 id="calendar-title">Calendar</h2>
              <p>Upcoming opens and recently finalized boards.</p>
            </div>
          </div>
          <div className="dual-band">
            <div className="panel">
              <div className="panel-head"><h2>Upcoming</h2><span className="faint" style={{ fontSize: 12 }}>{upcoming.length} scheduled</span></div>
              <div className="panel-body">
                {upcoming.length ? upcoming.map((campaign) => (
                  <Link key={campaign.id} href={`/competitions/${campaign.slug}`} className="inline" style={{ justifyContent: "space-between", textDecoration: "none" }}>
                    <span>
                      <strong style={{ fontSize: 14 }}>{campaign.title}</strong>
                      <span className="faint" style={{ display: "block", fontSize: 12 }}>{campaign.game.name} · opens {campaign.startsAt.toLocaleDateString()}</span>
                    </span>
                    <span className="status status-upcoming">{statusLabel.UPCOMING}</span>
                  </Link>
                )) : <p className="empty-mini">Nothing scheduled yet.</p>}
              </div>
            </div>
            <div className="panel">
              <div className="panel-head"><h2>Recently finalized</h2><span className="faint" style={{ fontSize: 12 }}>{completed.length} boards</span></div>
              <div className="panel-body">
                {completed.length ? completed.map((campaign) => (
                  <Link key={campaign.id} href={`/competitions/${campaign.slug}`} className="inline" style={{ justifyContent: "space-between", textDecoration: "none" }}>
                    <span>
                      <strong style={{ fontSize: 14 }}>{campaign.title}</strong>
                      <span className="faint" style={{ display: "block", fontSize: 12 }}>{campaign.game.name} · {campaign._count.participants} players</span>
                    </span>
                    <span className="prize tabular">{usdc(campaign.prizePoolUnits)}</span>
                  </Link>
                )) : <p className="empty-mini">No finalized competitions yet.</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="sponsors-title">
          <div className="section-head">
            <div>
              <h2 id="sponsors-title">Featured sponsors</h2>
              <p>Demo brands are fictional and labelled. Developer sponsors are studios with a registered game.</p>
            </div>
          </div>
          <div className="sponsor-strip">
            {brands.map((brand) => (
              <span key={brand.id} className="sponsor-chip">
                <span className="sponsor-logo" aria-hidden="true">{brand.brandName.charAt(0)}</span>
                {brand.brandName}
                {brand.isDemo && <span className="badge badge-demo">Demo</span>}
              </span>
            ))}
          </div>
        </section>

        <section className="section" aria-labelledby="how-title">
          <div className="section-head">
            <div>
              <h2 id="how-title">How QuestArena works</h2>
              <p>Four steps, each backed by a real record in the platform.</p>
            </div>
          </div>
          <div className="tile-grid">
            {[
              [Swords, "Join a competition", "Registration is stored in the database with its own eligibility checks."],
              [Flame, "Play the run", "The server issues the session, seed and scoring configuration."],
              [ShieldCheck, "Get verified", "Five verifier keys re-check the evidence. Three signatures are required."],
              [Trophy, "Claim the reward", "Finalized boards pay out by pull claim in USDC on Arc."],
            ].map(([Icon, title, body], index) => {
              const Component = Icon as typeof Swords;
              return (
                <div key={title as string} className="stat-tile">
                  <Component size={18} aria-hidden="true" color="#5fd8e0" />
                  <strong style={{ fontSize: 24, marginTop: 8 }}>{index + 1}. {title as string}</strong>
                  <small>{body as string}</small>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="container-qa page-main"><p className="muted">Loading QuestArena...</p></main>}>
      <DynamicHome />
    </Suspense>
  );
}
