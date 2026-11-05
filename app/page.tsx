import Link from "next/link";
import { ArrowRight, Gamepad2, ShieldCheck, Trophy, Users } from "lucide-react";

const competitions = [
  {
    title: "Neon Reaction",
    category: "Reaction challenge",
    reward: "$250 USDC",
    entries: "128 players",
    accent: "cyan",
  },
  {
    title: "Daily Reflex Sprint",
    category: "Sponsored tournament",
    reward: "$500 USDC",
    entries: "246 players",
    accent: "purple",
  },
  {
    title: "Precision Circuit",
    category: "Skill competition",
    reward: "$150 USDC",
    entries: "92 players",
    accent: "orange",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="site-brand" href="/" aria-label="QuestArena home">
          <span className="brand-mark"><Gamepad2 size={19} /></span>
          QUESTARENA
        </Link>
        <div className="nav-links">
          <Link href="#competitions">Competitions</Link>
          <Link href="/games/neon-reaction">Games</Link>
          <Link href="#how-it-works">Leaderboards</Link>
          <Link href="#sponsors">For Sponsors</Link>
        </div>
        <div className="nav-actions">
          <Link className="nav-sign-in" href="/sign-in">Sign in</Link>
          <Link className="nav-sign-up" href="/sign-up">Create account</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Live competitions are open</div>
          <h1>Your next competition<br />starts here.</h1>
          <p>Discover sponsored games, compete in challenges, and earn rewards.</p>
          <div className="hero-actions">
            <Link className="primary-button" href="/games/neon-reaction">
              Explore games <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" href="/sign-up">Launch a campaign</Link>
          </div>
          <div className="hero-proof">
            <span><strong>12K+</strong> active players</span>
            <span><strong>$48K</strong> rewards distributed</span>
            <span><strong>Verified</strong> competition results</span>
          </div>
        </div>

        <div className="hero-panel" aria-label="Featured competition">
          <div className="panel-grid" />
          <div className="live-chip"><span /> LIVE NOW</div>
          <div className="target-display">
            <div className="target-ring target-ring-outer">
              <div className="target-ring target-ring-inner" />
            </div>
            <Gamepad2 className="target-icon" size={34} />
          </div>
          <div className="panel-footer">
            <div>
              <span>Featured challenge</span>
              <strong>Neon Reaction</strong>
            </div>
            <div className="panel-prize">
              <span>Prize pool</span>
              <strong>$250 USDC</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section" id="competitions">
        <div className="section-heading">
          <div>
            <span className="section-kicker">COMPETE THIS WEEK</span>
            <h2>Featured competitions</h2>
          </div>
          <Link href="/games/neon-reaction">View all competitions <ArrowRight size={16} /></Link>
        </div>
        <div className="competition-grid">
          {competitions.map((competition) => (
            <Link className={`competition-card accent-${competition.accent}`} href="/games/neon-reaction" key={competition.title}>
              <div className="competition-art">
                <div className="competition-orbit" />
                <Trophy size={28} />
              </div>
              <div className="competition-content">
                <span className="competition-category">{competition.category}</span>
                <h3>{competition.title}</h3>
                <div className="competition-meta">
                  <span><strong>{competition.reward}</strong> prize pool</span>
                  <span>{competition.entries}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <span className="section-kicker">HOW IT WORKS</span>
            <h2>From play to reward</h2>
          </div>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <Gamepad2 />
            <span>01</span>
            <h3>Choose a challenge</h3>
            <p>Enter a sponsored competition built around a real playable game.</p>
          </div>
          <div className="step-card">
            <ShieldCheck />
            <span>02</span>
            <h3>Play and prove</h3>
            <p>Complete the challenge while QuestArena records and verifies your result.</p>
          </div>
          <div className="step-card">
            <Users />
            <span>03</span>
            <h3>Climb the rankings</h3>
            <p>Compare your score and collect rewards when the competition closes.</p>
          </div>
        </div>
      </section>

      <section className="sponsor-banner" id="sponsors">
        <div>
          <span className="section-kicker">FOR BRANDS & DEVELOPERS</span>
          <h2>Turn your audience into active players.</h2>
        </div>
        <Link className="secondary-button" href="/sign-up">
          Launch a campaign <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
