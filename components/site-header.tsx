import Link from "next/link";
import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { config } from "@/lib/config";

async function HeaderContent() {
  let displayName: string | null = null;

  if (config.clerkEnabled) {
    const user = await currentUser();
    displayName = user?.fullName ?? user?.username ?? null;
  }

  return (
    <header className="site-header" suppressHydrationWarning>
      <div className="container-qa site-header-inner" suppressHydrationWarning>
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">Q</span>
          <span className="brand-label">QuestArena</span>
        </Link>

        <nav className="site-nav" aria-label="Main">
          <Link href="/games">Games</Link>
          <Link href="/competitions">Competitions</Link>
          <Link href="/for-sponsors">Sponsors</Link>
        </nav>

        <div className="site-header-actions" suppressHydrationWarning>
          {displayName ? (
            <Link href="/user-profile" className="btn btn-ghost btn-sm">{displayName}</Link>
          ) : (
            <>
              <Link href="/sign-in" className="btn btn-ghost btn-sm">Sign in</Link>
              <Link href="/sign-up" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteHeader() {
  return (
    <Suspense fallback={<header className="site-header" />}>
      <HeaderContent />
    </Suspense>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container-qa site-footer-inner">
        <div className="site-footer-brand">
          <Link href="/" className="brand">
            <span className="brand-mark" aria-hidden="true">Q</span>
            <span className="brand-label">QuestArena</span>
          </Link>
          <p className="faint" style={{ fontSize: 12, marginTop: 4 }}>Play. Compete. Prove. Earn.</p>
        </div>
        <nav className="site-footer-links" aria-label="Footer">
          <Link href="/games">Games</Link>
          <Link href="/competitions">Competitions</Link>
          <Link href="/for-sponsors">Sponsors</Link>
          <Link href="/for-developers">Developers</Link>
        </nav>
        <p className="faint" style={{ fontSize: 11 }}>© 2026 QuestArena. Sponsor-funded rewards. Not gambling.</p>
      </div>
    </footer>
  );
}
