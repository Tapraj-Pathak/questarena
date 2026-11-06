import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { AuthAside } from "@/components/auth-aside";
import { DevSignIn } from "@/components/dev-sign-in";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <div className="auth-shell">
      <AuthAside title="Pick up where you left off." body="Sign in to join competitions, track your ranking and claim verified rewards." />
      <main className="auth-main">
        <div className="auth-panel">
          <div>
            <Link href="/" className="brand" style={{ marginBottom: 16 }}>
              <span className="brand-mark" aria-hidden="true">Q</span>
            </Link>
            <h1 style={{ fontSize: 34 }}>Sign in</h1>
            <p style={{ marginTop: 8 }}>Continue with Google or a phone number. QuestArena does not store passwords.</p>
          </div>
          {config.clerkEnabled ? (
            <Suspense fallback={<p className="muted">Loading sign-in…</p>}>
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
            </Suspense>
          ) : (
            <DevSignIn redirectTo="/dashboard" />
          )}
          <div className="inline" style={{ justifyContent: "space-between", fontSize: 13 }}>
            <Link href="/forgot-password" className="text-link">Trouble signing in?</Link>
            <span className="faint">New here? <Link href="/sign-up" className="text-link">Create an account</Link></span>
          </div>
        </div>
      </main>
    </div>
  );
}
