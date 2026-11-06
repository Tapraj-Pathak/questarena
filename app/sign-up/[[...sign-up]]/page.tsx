import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";
import { AuthAside } from "@/components/auth-aside";
import { DevSignIn } from "@/components/dev-sign-in";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <div className="auth-shell">
      <AuthAside title="Compete, prove it, get paid." body="One account covers playing, developing and sponsoring. Add capabilities after sign-up." />
      <main className="auth-main">
        <div className="auth-panel">
          <div>
            <Link href="/" className="brand" style={{ marginBottom: 16 }}>
              <span className="brand-mark" aria-hidden="true">Q</span>
            </Link>
            <h1 style={{ fontSize: 34 }}>Create account</h1>
            <p style={{ marginTop: 8 }}>Use Google or a phone number. You choose your activities in the next step.</p>
          </div>
          {config.clerkEnabled ? (
            <Suspense fallback={<p className="muted">Loading sign-up…</p>}>
              <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />
            </Suspense>
          ) : (
            <>
              <DevSignIn redirectTo="/dashboard" />
              <p className="faint" style={{ fontSize: 13 }}>
                Development mode reuses seeded accounts. Once Clerk keys are added, Google and SMS OTP run through Clerk here.
              </p>
            </>
          )}
          <p className="faint" style={{ fontSize: 13 }}>Already registered? <Link href="/sign-in" className="text-link">Sign in</Link></p>
        </div>
      </main>
    </div>
  );
}
