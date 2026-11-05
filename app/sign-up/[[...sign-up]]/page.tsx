import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export default function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="auth-brand">QUESTARENA</span>
        <h1>Create your account</h1>
        <p>Play competitions, build your rank, and claim verified rewards.</p>
        <Suspense fallback={<p>Loading sign up...</p>}>
          <SignUp routing="path" path="/sign-up" />
        </Suspense>
      </div>
    </main>
  );
}
