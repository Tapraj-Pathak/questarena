import { createHash } from "node:crypto";

/* -------------------------------------------------------------------------- */
/*  Adapter interface                                                         */
/* -------------------------------------------------------------------------- */

export interface AdapterOutcome {
  ok: true;
  score: number;
  accuracy?: number;
  completionMs?: number;
  moves?: number;
  detail?: Record<string, unknown>;
  reason?: undefined;
}

export interface AdapterReject {
  ok: false;
  reason: string;
}

export interface GameAdapter {
  /** Build the configuration object sent to the client at session start. */
  createConfig(opts: { difficulty: string; seed: string; rules: Record<string, unknown> }): Record<string, unknown>;
  /** Validate the client payload and compute the authoritative score. */
  validate(config: Record<string, unknown>, payload: unknown): AdapterOutcome | AdapterReject;
  /** Deterministic hash for evidence verification. */
  resultHash(input: { seed: string; payload: unknown; score: number }): string;
}

/* -------------------------------------------------------------------------- */
/*  Neon Reaction adapter                                                     */
/* -------------------------------------------------------------------------- */

type NeonEvent = { type: "hit" | "miss"; reactionMs?: number };

const neonReactionAdapter: GameAdapter = {
  createConfig({ seed, rules }) {
    const rounds = typeof rules.rounds === "number" ? rules.rounds : 10;
    const targetLifetimeMs = typeof rules.targetLifetimeMs === "number" ? rules.targetLifetimeMs : 1400;
    return { rounds, targetLifetimeMs, seed };
  },

  validate(config, payload) {
    const events = (payload as { events?: NeonEvent[] })?.events;
    if (!Array.isArray(events)) return { ok: false, reason: "Missing events array." };

    const rounds = (config.rounds as number) ?? 10;
    if (events.length > rounds + 2) return { ok: false, reason: "Too many events." };

    let score = 0;
    let hits = 0;

    for (const event of events) {
      if (event.type === "hit") {
        const reaction = event.reactionMs ?? 9999;
        if (reaction < 1) return { ok: false, reason: "Suspiciously fast reaction." };
        score += Math.max(100, 1100 - reaction);
        hits++;
      } else {
        score = Math.max(0, score - 150);
      }
    }

    const accuracy = events.length > 0 ? hits / events.length : 0;
    return { ok: true, score, accuracy, moves: events.length };
  },

  resultHash({ seed, payload, score }) {
    return createHash("sha256")
      .update(JSON.stringify({ seed, payload, score }))
      .digest("hex");
  },
};

/* -------------------------------------------------------------------------- */
/*  Memory Match adapter (placeholder)                                        */
/* -------------------------------------------------------------------------- */

const MEMORY_DIFFICULTIES = ["easy", "medium", "hard"] as const;

const memoryMatchAdapter: GameAdapter = {
  createConfig({ difficulty, seed }) {
    const pairs = difficulty === "hard" ? 12 : difficulty === "medium" ? 8 : 6;
    return { pairs, difficulty, seed };
  },

  validate(config, payload) {
    const moves = (payload as { moves?: number })?.moves;
    const pairs = (config.pairs as number) ?? 8;
    if (typeof moves !== "number" || moves < pairs) {
      return { ok: false, reason: "Invalid move count." };
    }
    const score = Math.max(100, pairs * 500 - (moves - pairs) * 50);
    return { ok: true, score, moves };
  },

  resultHash({ seed, payload, score }) {
    return createHash("sha256")
      .update(JSON.stringify({ seed, payload, score }))
      .digest("hex");
  },
};

/* -------------------------------------------------------------------------- */
/*  Registry                                                                  */
/* -------------------------------------------------------------------------- */

const adapters: Record<string, GameAdapter> = {
  "neon-reaction": neonReactionAdapter,
  "memory-match": memoryMatchAdapter,
};

export function getAdapter(gameSlug: string): GameAdapter | undefined {
  return adapters[gameSlug];
}

export function memoryDifficulties(): string[] {
  return [...MEMORY_DIFFICULTIES];
}

