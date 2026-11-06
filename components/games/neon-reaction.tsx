"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Timer } from "lucide-react";
import { useGameSession, type SessionResult } from "@/components/games/use-game-session";
import { ResultScreen } from "@/components/games/result-screen";

type Phase = "idle" | "countdown" | "playing" | "finished";
type GameEvent = { type: "hit" | "miss"; reactionMs?: number };

export function NeonReaction({ campaignSlug, gameName }: { campaignSlug: string; gameName: string }) {
  const { start, submit, error, busy, setError } = useGameSession(campaignSlug);
  const [phase, setPhase] = useState<Phase>("idle");
  const [rounds, setRounds] = useState(10);
  const [lifetime, setLifetime] = useState(1400);
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const shownAt = useRef(0);
  const events = useRef<GameEvent[]>([]);
  const roundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locking = useRef(false);

  const placeTarget = (lifetimeMs: number) => {
    const padding = 15;
    setTarget({ x: padding + Math.random() * (100 - padding * 2), y: padding + Math.random() * (100 - padding * 2) });
    shownAt.current = performance.now();
    locking.current = false;
    if (roundTimer.current) clearTimeout(roundTimer.current);
    roundTimer.current = setTimeout(() => {
      if (!locking.current) miss();
    }, lifetimeMs);
  };

  async function begin() {
    setError(null);
    setResult(null);
    setPhase("idle");
    setScore(0);
    setMisses(0);
    setRound(1);
    events.current = [];
    const session = await start();
    if (!session) return;
    const config = session.configuration as { rounds?: number; targetLifetimeMs?: number };
    const totalRounds = config.rounds ?? 10;
    const lifetimeMs = config.targetLifetimeMs ?? 1400;
    setRounds(totalRounds);
    setLifetime(lifetimeMs);
    setAttemptsLeft(session.attemptsLeft);
    setCountdown(3);
    setPhase("countdown");
  }

  async function finish(finalEvents: GameEvent[]) {
    setPhase("finished");
    const submitted = await submit({ events: finalEvents });
    if (submitted) {
      setResult(submitted);
      setScore(submitted.score);
    }
  }

  function endEarly() {
    const remaining = rounds - events.current.length;
    const padded = [...events.current, ...Array.from({ length: remaining }, () => ({ type: "miss" as const }))];
    setMisses((value) => value + remaining);
    finish(padded);
  }

  function advance(nextEvents: GameEvent[]) {
    if (round >= rounds) return finish(nextEvents);
    setRound((value) => value + 1);
    placeTarget(lifetime);
  }

  function hit() {
    if (phase !== "playing" || locking.current) return;
    locking.current = true;
    if (roundTimer.current) clearTimeout(roundTimer.current);
    const reaction = Math.max(1, Math.round(performance.now() - shownAt.current));
    const next = [...events.current, { type: "hit" as const, reactionMs: reaction }];
    events.current = next;
    setScore((value) => value + Math.max(100, 1100 - reaction));
    advance(next);
  }

  function miss() {
    if (phase !== "playing" || locking.current) return;
    locking.current = true;
    if (roundTimer.current) clearTimeout(roundTimer.current);
    const next = [...events.current, { type: "miss" as const }];
    events.current = next;
    setMisses((value) => value + 1);
    setScore((value) => Math.max(0, value - 150));
    advance(next);
  }

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      const timer = setTimeout(() => {
        setPhase("playing");
        placeTarget(lifetime);
      }, 120);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 620);
    return () => clearTimeout(timer);
  }, [phase, countdown, lifetime]);

  useEffect(() => () => { if (roundTimer.current) clearTimeout(roundTimer.current); }, []);

  return (
    <>
      <div className="game-hud" role="status" aria-label="Run status">
        <div className="hud-cell"><span>Round</span><strong>{Math.min(round, rounds)}<span className="hud-sub"> / {rounds}</span></strong></div>
        <div className="hud-cell"><span>Score</span><strong>{score.toLocaleString()}</strong></div>
        <div className="hud-cell"><span>Misses</span><strong>{misses}</strong></div>
        <div className="hud-cell"><span>Target window</span><strong>{(lifetime / 1000).toFixed(1)}<span className="hud-sub"> s</span></strong></div>
      </div>

      <section className="arena" aria-label={`${gameName} arena`}>
        <div className="arena-backdrop" aria-hidden="true"><img src="/games/neon-reaction-cover.jpg" alt="" /></div>

        {phase === "idle" && (
          <div className="arena-screen">
            <Timer size={26} aria-hidden="true" color="#5fd8e0" />
            <h2>Ready when you are</h2>
            <p>{rounds} targets. Hit each one before the window closes. Misses cost 150 points. Faster hits score more.</p>
            <div className="inline">
              <button type="button" className="btn btn-primary btn-lg" onClick={begin} disabled={busy}>
                <Play size={17} aria-hidden="true" /> Start run
              </button>
            </div>
            {attemptsLeft !== null && <p className="faint" style={{ fontSize: 12 }}>{attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} left after this run</p>}
          </div>
        )}

        {phase === "countdown" && (
          <div className="arena-screen" aria-live="assertive">
            <div className="countdown" key={countdown}>{countdown || "GO"}</div>
          </div>
        )}

        {phase === "playing" && (
          <>
            <button type="button" className="miss-zone" onClick={miss} aria-label="Click outside the target to record a miss" />
            <button
              type="button"
              className="reaction-target"
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
              onClick={hit}
              aria-label={`Hit target ${round} of ${rounds}`}
            />
          </>
        )}

        {phase === "finished" && (
          result ? (
            <ResultScreen result={result} campaignSlug={campaignSlug} onReplay={begin} replayLabel="New attempt" />
          ) : (
            <div className="arena-screen">
              <span className="status status-live">Submitting run</span>
              <h2 className="tabular">{score.toLocaleString()} points</h2>
              <p>Scoring on the server and collecting verifier signatures…</p>
            </div>
          )
        )}

        {error && <p className="arena-error" role="alert">{error}</p>}
      </section>

      <div className="inline" style={{ justifyContent: "space-between", marginTop: 10, fontSize: 13 }}>
        <span className="faint">
          {phase === "playing" ? "Click the ring. Clicking anywhere else counts as a miss." : "Scores are recomputed server-side from the submitted event list."}
        </span>
        {phase === "playing" && <button type="button" className="btn btn-secondary btn-sm" onClick={endEarly}>End run</button>}
      </div>
    </>
  );
}
