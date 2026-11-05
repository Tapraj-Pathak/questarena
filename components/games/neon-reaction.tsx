"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";

type Phase = "idle" | "countdown" | "playing" | "finished";
type GameEvent = { type: "hit" | "miss"; reactionMs?: number };

export function NeonReaction() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState({ x: 50, y: 50 });
  const targetShownAt = useRef(0);
  const reactionTimes = useRef<number[]>([]);
  const gameEvents = useRef<GameEvent[]>([]);
  const sessionId = useRef<string | null>(null);
  const roundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [averageReaction, setAverageReaction] = useState(0);
  const [serverResult, setServerResult] = useState<{
    score: number;
    accuracy: number;
    averageReactionMs: number | null;
  } | null>(null);

  const placeTarget = () => {
    const padding = 14;
    setTarget({
      x: padding + Math.random() * (100 - padding * 2),
      y: padding + Math.random() * (100 - padding * 2),
    });
    targetShownAt.current = performance.now();
  };

  const finish = () => {
    if (roundTimer.current) clearTimeout(roundTimer.current);
    setPhase("finished");
  };

  const start = async () => {
    setError(null);
    setServerResult(null);
    setScore(0);
    setMisses(0);
    reactionTimes.current = [];
    gameEvents.current = [];
    setRound(1);
    setCountdown(3);
    setPhase("countdown");
    try {
      const response = await fetch("/api/game-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameSlug: "neon-reaction", rounds: 10 }),
      });
      if (!response.ok) throw new Error("Could not create a game session.");
      const data = await response.json();
      sessionId.current = data.sessionId;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not start the game.");
      setPhase("idle");
    }
  };

  const submit = async () => {
    if (!sessionId.current || gameEvents.current.length !== 10) return;
    try {
      const response = await fetch(`/api/game-sessions/${sessionId.current}/result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: gameEvents.current }),
      });
      if (!response.ok) throw new Error("Could not submit the result.");
      const data = await response.json();
      setServerResult(data.result);
      setScore(data.result.score);
      setPhase("finished");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not submit the result.");
      setPhase("finished");
    }
  };

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown === 0) {
      const timer = setTimeout(() => {
        setPhase("playing");
        placeTarget();
      }, 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 700);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== "playing") return;
    roundTimer.current = setTimeout(() => {
      gameEvents.current = [...gameEvents.current, { type: "miss" }];
      setMisses((value) => value + 1);
      if (round >= 10) submit();
      else {
        setRound((value) => value + 1);
        placeTarget();
      }
    }, 1400);
    return () => {
      if (roundTimer.current) clearTimeout(roundTimer.current);
    };
  }, [phase, round]);

  const hitTarget = async () => {
    const reaction = Math.max(1, Math.round(performance.now() - targetShownAt.current));
    reactionTimes.current = [...reactionTimes.current, reaction];
    setAverageReaction(reactionTimes.current.length ? Math.round(reactionTimes.current.reduce((total, value) => total + value, 0) / reactionTimes.current.length) : 0);
    gameEvents.current = [...gameEvents.current, { type: "hit", reactionMs: reaction }];
    const points = Math.max(100, 1100 - reaction);
    setScore((value) => value + points);

    if (round >= 10) {
      submit();
      return;
    }
    setRound((value) => value + 1);
    placeTarget();
  };

  const miss = () => {
    if (phase !== "playing") return;
    if (gameEvents.current.some((event, index) => index === round - 1 && event.type === "miss")) return;
    setMisses((value) => value + 1);
    gameEvents.current = [...gameEvents.current, { type: "miss" }];
    if (round >= 10) submit();
    else {
      setRound((value) => value + 1);
      placeTarget();
    }
    setScore((value) => Math.max(0, value - 150));
  };

  const resultAccuracy = round ? Math.round((Math.max(0, round - misses) / round) * 100) : 0;

  return (
    <div className="reaction-game">
      <aside className="game-sidebar">
        <span className="game-kicker">QUESTARENA ORIGINAL</span>
        <h1>Neon Reaction</h1>
        <p>Hit each target before it fades. Fast reactions earn more points.</p>
        <div className="game-progress">
          <div><span>Round</span><strong>{round} / 10</strong></div>
          <div><span>Score</span><strong>{score.toLocaleString()}</strong></div>
          <div><span>Misses</span><strong>{misses}</strong></div>
        </div>
        <button className="game-action" onClick={phase === "idle" || phase === "finished" ? start : finish}>
          {phase === "idle" || phase === "finished" ? <Play size={18} /> : <Pause size={18} />}
          {phase === "idle" ? "Start run" : phase === "finished" ? "Play again" : "Finish run"}
        </button>
      </aside>

      <section className="game-arena" aria-label="Neon Reaction game area">
        {phase === "idle" && (
          <div className="game-overlay">
            <div className="overlay-icon"><Timer size={28} /></div>
            <h2>Ready to test your reflexes?</h2>
            <p>10 targets. One run. No entry fee.</p>
            <button className="game-action" onClick={start}><Play size={18} /> Start game</button>
          </div>
        )}
        {phase === "countdown" && <div className="countdown">{countdown || "GO"}</div>}
        {phase === "playing" && (
          <button
            className="reaction-target"
            style={{ left: `${target.x}%`, top: `${target.y}%` }}
            onClick={hitTarget}
            aria-label="Reaction target"
          />
        )}
        {phase === "playing" && (
          <button className="game-miss-zone" onClick={miss} aria-label="Missed target area" />
        )}
        {phase === "finished" && (
          <div className="game-overlay">
            <span className="game-kicker">RUN COMPLETE</span>
            <h2>{score.toLocaleString()} points</h2>
            <p>{serverResult?.accuracy ?? resultAccuracy}% accuracy · Average reaction {serverResult?.averageReactionMs ?? averageReaction} ms</p>
            <button className="game-action" onClick={start}><RotateCcw size={18} /> Play again</button>
          </div>
        )}
        {error && <p className="game-error">{error}</p>}
      </section>
    </div>
  );
}
