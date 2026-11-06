"use client";

import Link from "next/link";
import { CheckCircle2, Clock, RotateCcw, ShieldCheck, Trophy } from "lucide-react";
import type { SessionResult } from "@/components/games/use-game-session";

interface ResultScreenProps {
  result: SessionResult;
  campaignSlug: string;
  onReplay?: () => void;
  replayLabel?: string;
}

export function ResultScreen({ result, campaignSlug, onReplay, replayLabel = "Play again" }: ResultScreenProps) {
  const verified = result.verifiedCount >= result.requiredCount;

  return (
    <div className="arena-screen result-screen">
      {verified ? (
        <ShieldCheck size={28} color="#5fd8e0" aria-hidden="true" />
      ) : (
        <Clock size={28} color="#a3adbb" aria-hidden="true" />
      )}

      <h2 className="tabular">{result.score.toLocaleString()} points</h2>

      <div className="inline" style={{ gap: 8 }}>
        <span className={`status ${verified ? "status-live" : "status-upcoming"}`}>
          {verified ? "Verified" : result.status}
        </span>
        <span className="faint" style={{ fontSize: 12 }}>
          {result.verifiedCount}/{result.requiredCount} verifier signatures
        </span>
      </div>

      {result.accuracy !== undefined && (
        <p className="faint" style={{ fontSize: 13 }}>
          Accuracy: {(result.accuracy * 100).toFixed(0)}%
          {result.moves !== undefined && <> · {result.moves} moves</>}
        </p>
      )}

      <div className="inline" style={{ gap: 8, marginTop: 8 }}>
        {onReplay && (
          <button type="button" className="btn btn-primary" onClick={onReplay}>
            <RotateCcw size={14} aria-hidden="true" /> {replayLabel}
          </button>
        )}
        <Link href={`/competitions/${campaignSlug}`} className="btn btn-secondary">
          <Trophy size={14} aria-hidden="true" /> Leaderboard
        </Link>
      </div>
    </div>
  );
}

