import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClerkLoaded, UserProfile } from "@clerk/nextjs";
import { getSessionUser } from "@/lib/session";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Profile" };

async function DynamicUserProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/sign-in?redirect_url=/user-profile");

  if (config.clerkEnabled) {
    return (
      <main className="container-qa page-main">
        <div className="page-head"><h1>Your profile</h1><p>Identity, email and phone numbers are managed by Clerk.</p></div>
        <ClerkLoaded>
          <UserProfile routing="hash" />
        </ClerkLoaded>
      </main>
    );
  }

  return (
    <main className="container-qa page-main">
      <div className="page-head"><h1>Your profile</h1><p>Development mode: identity is mirrored from the seeded account.</p></div>
      <div className="panel panel-pad" style={{ display: "grid", gap: 16, maxWidth: 560 }}>
        <div className="profile-banner">
          <span className="avatar avatar-fallback" aria-hidden="true">{user.displayName.charAt(0)}</span>
          <div>
            <h2 style={{ fontSize: 26 }}>{user.displayName}</h2>
            <p className="faint">@{user.username ?? user.id.slice(-8)}</p>
          </div>
        </div>
        <dl className="kv">
          <dt>Email</dt><dd>{user.email ?? "not set"}</dd>
          <dt>Phone</dt><dd>{user.phoneNumber ?? "not set"}</dd>
          <dt>Capabilities</dt><dd>{user.capabilities.join(", ").toLowerCase() || "player"}</dd>
          <dt>Admin</dt><dd>{user.isAdmin ? "yes" : "no"}</dd>
          <dt>Joined</dt><dd>{user.createdAt.toLocaleDateString()}</dd>
        </dl>
        <div className="inline">
          <Link href="/onboarding" className="btn btn-secondary">Edit capabilities</Link>
          <Link href="/settings" className="btn btn-ghost">Settings</Link>
        </div>
      </div>
    </main>
  );
}

export default function UserProfilePage() {
  return (
    <Suspense fallback={<main className="container-qa page-main"><p className="muted">Loading profile...</p></main>}>
      <DynamicUserProfilePage />
    </Suspense>
  );
}
