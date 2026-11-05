import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="auth-brand">QUESTARENA</span>
        <h1>Welcome back</h1>
        <p>Sign in to join competitions and track your results.</p>
        <Suspense fallback={<p>Loading sign in...</p>}>
          <SignIn routing="path" path="/sign-in" />
        </Suspense>
      </div>
    </main>
  );
}
