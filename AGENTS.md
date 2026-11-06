# QuestArena — Project Context for Codex

> Purpose: Give Codex the project context previously discussed with ChatGPT so implementation can continue without repeatedly re-explaining the product.
> Status: This file captures the decisions currently available from prior discussions. Treat the repository's actual code and newer explicit user instructions as the source of truth where they differ. Do not assume an item is implemented merely because it appears here.

## 1. Product identity

**Name:** QuestArena  
**Tagline:** “Play. Compete. Prove. Earn.”

QuestArena is intended to be a genuinely playable web application, not a static landing page, mockup, or vibe-coded demo. Build the complete working product in sensible stages, with real game flows and functioning backend logic.

## 2. Core product idea

QuestArena hosts competitions around games and lets players participate, prove results, and earn sponsor-funded rewards.

There are two accepted sponsorship models:

1. **Developer-sponsored external games**
   - Game developers sponsor their existing games for promotion.
   - QuestArena hosts or promotes competitions connected to those external games.
   - The game itself may live outside QuestArena; the competition and participation experience should still be clear and usable.

2. **Brand-sponsored QuestArena games**
   - Brands sponsor games built or hosted by QuestArena.
   - Brand advertising can be integrated into the experience.
   - Brands can fund prizes/rewards for competitions.

Competition principles:
- Entry is free.
- Rewards are funded by sponsors.
- Advertising and prize funding must be configurable rather than hard-coded.
- Make the funding source and competition rules clear to players.

## 3. Authentication

- Use **Clerk** for proper user authentication.
- Do not replace this with a fake login screen or a locally simulated authentication flow.
- Protect authenticated routes and server-side actions appropriately.
- Use Clerk identity consistently when associating users with competition entries and results.

## 4. Discussed technology direction

The previously discussed architecture/stack is:

### Web frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

### API and realtime services
- Node.js
- Express
- Socket.IO

### Database
- PostgreSQL
- Prisma ORM

### Games
- Phaser for browser-based games.

### Blockchain / rewards
- Solidity
- Foundry
- OpenZeppelin
- Arc network
- USDC escrow for sponsor-funded rewards

### Web3 frontend integration
- wagmi
- viem

### Verification / identity / evidence
- Chainlink CRE for orchestration
- World ID / IDKit for identity or uniqueness verification where appropriate
- IPFS for evidence storage where appropriate

These are the previously discussed technology choices, not proof that every component is already configured. Inspect the existing repository before changing the stack or adding dependencies.

## 5. Previously discussed monorepo shape

The proposed repository layout was:

- `apps/web` — Next.js web application
- `apps/api` — Node/Express API and Socket.IO services
- `apps/game` — Phaser game application(s)
- `packages/database` — Prisma schema, migrations, and database utilities
- `packages/adapters` — integrations/adapters
- `packages/verifier` — result/evidence verification logic
- `packages/shared` — shared types, schemas, and utilities
- `contracts` — Solidity contracts, tests, and deployment scripts
- `cre` — Chainlink CRE workflows/configuration

This is a proposed architecture from earlier planning. First inspect the current repository. Preserve an existing working structure unless there is a concrete reason to migrate it.

## 6. Product requirements and design principles

- Deliver a playable product with working flows, not only a polished landing page.
- Support both sponsorship models described above.
- Keep competitions free to enter.
- Make sponsor-funded prizes and advertising configurable.
- Use real Clerk authentication.
- Build reliable game/competition/result flows and make their states understandable.
- Do not present simulated blockchain transactions, fake verification, or placeholder reward claims as real.
- If an integration is not configured, clearly label it as pending and keep the rest of the app usable.
- Prioritize a coherent end-to-end vertical slice over many unfinished screens.

## 7. Important implementation cautions

- Inspect the repository before editing. Identify what already exists, what runs, and what is incomplete.
- Do not overwrite working code or restructure the project just to match the proposed folder tree.
- Do not invent product decisions that have not been made. Ask a focused question when a decision blocks implementation; otherwise choose a simple, reversible default and document it.
- Keep secrets in environment variables. Never commit API keys, private keys, or production credentials.
- Add environment-variable examples with placeholders, not real secrets.
- Include database migrations and tests for important business logic.
- Validate all competition submissions and reward-related operations on the server; never trust client-provided scores or prize amounts.
- Treat blockchain, identity, and evidence integrations as security-sensitive. Do not claim trustless verification unless the implementation actually provides it.

## 8. Suggested build sequence

Use this as a suggested order, adapting it to the actual repository:

1. Audit the current codebase and report the existing apps, services, integrations, and gaps.
2. Establish the core data model: users, games, competitions, entries, submissions/results, sponsors, prize pools, and reward status.
3. Implement Clerk authentication and protected user flows.
4. Build the core competition discovery, detail, entry, and status flows.
5. Integrate at least one genuinely playable Phaser game or a clearly defined external-game competition flow.
6. Implement server-side result/submission handling and verification boundaries.
7. Add sponsor management, configurable advertising, and sponsor-funded prize configuration.
8. Integrate Arc/USDC escrow and smart contracts only after the off-chain competition and accounting flows are clear and tested.
9. Add Chainlink CRE, World ID/IDKit, and IPFS where the concrete product flow requires them.
10. Test the complete player and sponsor journeys end to end.

## 9. How Codex should work with this context

At the start of a task:
- Read this file and the repository README.
- Inspect the relevant code before proposing or making changes.
- Summarize the current implementation state briefly.
- State assumptions and identify any conflict between this document and the code.
- Make focused, incremental changes.
- Run relevant tests, type checks, and builds; report exactly what passed and failed.
- Update this file or the README when a durable product decision changes.

Do not claim that a feature is complete unless it is implemented and verified in the repository.

## 10. Items to confirm from the current repository / user

The previous discussions summarized here do not establish:
- The current repository URL, branch, and exact folder structure.
- Which parts of the frontend, API, games, contracts, and integrations are already implemented.
- The exact Arc network/environment and deployment configuration.
- The final competition scoring, anti-cheat, and dispute-resolution rules.
- The exact sponsor dashboard, ad formats, and prize-distribution policy.
- Whether every proposed integration remains in scope for the first release.

Verify these before making irreversible architectural decisions.
