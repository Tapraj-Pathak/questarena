"use client";

import { useCallback, useRef, useState } from "react";

export interface SessionResult {
  id: string;
  score: number;
  accuracy?: number;
  completionMs?: number;
  moves?: number;
  status: string;
  verifiedCount: number;
  requiredCount: number;
  detail?: Record<string, unknown>;
}

interface SessionStart {
  sessionId: string;
  configuration: Record<string, unknown>;
  attempt: number;
  attemptsLeft: number;
  resumed?: boolean;
}

/**
 * Client-side hook for managing game session lifecycle:
 * start a session, submit a result.
 */
export function useGameSession(campaignSlug: string) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef<string | null>(null);

  const start = useCallback(async (difficulty?: string): Promise<SessionStart | null> => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/game-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignSlug, difficulty }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server returned ${res.status}`);
      }
      const data: SessionStart = await res.json();
      sessionId.current = data.sessionId;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start session.");
      return null;
    } finally {
      setBusy(false);
    }
  }, [campaignSlug]);

  const submit = useCallback(async (payload: unknown): Promise<SessionResult | null> => {
    if (!sessionId.current) {
      setError("No active session.");
      return null;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/game-sessions/${sessionId.current}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Server returned ${res.status}`);
      }
      const data = await res.json();
      return data.result as SessionResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit result.");
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  return { start, submit, busy, error, setError };
}

