"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Development-mode sign-in component shown when Clerk keys are not configured.
 * Redirects to the target page immediately — there is no real authentication
 * happening; the server session helper returns the first seeded user instead.
 */
export function DevSignIn({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  function handleClick() {
    setBusy(true);
    router.push(redirectTo);
  }

  return (
    <div className="dev-sign-in" style={{ display: "grid", gap: 12 }}>
      <p className="faint" style={{ fontSize: 13 }}>
        <strong>Development mode</strong> — Clerk keys are not set. Clicking below
        will use the first seeded account from the database.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleClick}
        disabled={busy}
      >
        {busy ? "Redirecting…" : "Continue as dev user"}
      </button>
    </div>
  );
}

