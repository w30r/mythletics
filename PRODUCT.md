# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui components, MongoDB via Mongoose 9, DeepSeek API (`deepseek-chat`) for the AI coach, session auth (JWT via `jose`, `bcryptjs` passwords, `AUTH_SECRET`), `recharts` for charts, `lucide-react` for icons, `next-themes` installed but unused. `src/proxy.ts` exists; dev origin allowlist includes `*.ngrok-free.app`. Next 16 has breaking changes vs. training-data conventions — consult `node_modules/next/dist/docs/` before writing framework code.

## Users

Primary user is the creator themself — a single self-tracking athlete (the seeded admin account). Situation: training bodyweight / minimal-equipment in a home or gym setting, often with phone or laptop in hand during the session (on-screen timer, guided pacing, rest tracking). Intent is for the app to be usable by other athletes later ("personal now, public later"), but no secondary audience is confirmed yet.

## Product Purpose

Mythletics is a personal bodyweight training companion: pick or build a workout, run it as a guided timed session, and watch the training log grow into streaks, PRs, and volume analytics — with an AI coach that knows your real history. Success means consistent training and measurable progress against your own records.

## Positioning

Undecided — open question to resolve in future work. The record below captures current facts, not a chosen claim: the DeepSeek-powered coach reads the athlete's actual recent session log and builds advice and whole programs from it (closed loop: structured plan → guided session → analytics). Seed content borrows Freeletics benchmark workouts (Aphrodite, Athena, Artemis, etc.), which anchors the current exercise culture in Greek-mythology-named, no-equipment-or-minimal-gear challenges.

## Operating Context

- Trains with bodyweight and minimal equipment; the only gear referenced by exercises is `bar`, `bench`, and `wall`.
- Guided sessions are driven by a step-by-step timer with rest-after-exercise, round structure, and per-exercise split timing; sessions end with an optional 0–10 rating.
- Training is organized in weekly programs (numbered weeks and days with rest days) or standalone workouts with blocks of type `circuit`, `interval`, or `rest`.
- The AI coach summarizes the last ~12 completed sessions into context for every reply and for program generation.
- All surfaces are responsive (sidebar on desktop, sheet drawer + top bar on mobile) and currently render dark-only.

## Capabilities and Constraints

Capabilities:
- Dashboard: streak, total training time, sessions completed, total reps logged; today's workout from the active program; recent sessions.
- Workout library + visual builder: exercises, blocks, rounds, reps/duration, rest timings, tags.
- Programs: seeded 4-week foundation plan; AI-generated multi-week programs from a goal and duration.
- Guided session runner: per-step timer, rest/round pacing, split tracking, completion rating.
- Progress: 14-day training-volume chart, per-exercise PRs (reps / weight / hold), fastest-completion workout PBs, split history.
- AI coach chat (streaming) and "Generate a plan" flow.

Constraints and recorded facts:
- Single MongoDB database; Mongoose models for User, Exercise, Workout, Program, ProgramProgress, WorkoutSession, CoachThread, SeedDone.
- Auth is single-admin email/password for now: first login auto-creates the account from `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`; sessions are JWT cookies signed with `AUTH_SECRET`.
- `DEEPSEEK_API_KEY` is optional — the app degrades gracefully when unset (`isAiConfigured()`).
- Dark-only theme is the **current implementation**, not a durable commitment (a light mode may come later; `next-themes` is already installed).
- Exercises default to bodyweight; the seed demo videos are empty (`demoUrl: ""`).
- Next.js dev server must run for any live use; data is not a static artifact.

## Brand Commitments

- Name: **Mythletics** (shown in metadata, login card, and sidebar).
- Tagline in metadata: "Your personal bodyweight training companion".
- Greek-mythology workout/benchmark naming (Zeus, Athena, Aphrodite, etc.) — inherited from Freeletics classics and currently central to the exercise culture.
- AI coach voice ("Mythletics Coach"): direct, motivating, practical; short paragraphs; never invents user data; accurate training science (progressive overload, rest, RPE, deloads).
- No committed color, typography, or visual identity has been declared beyond the current dark implementation.

## Evidence on Hand

- Seed content in `src/lib/seed.ts`: 37 exercises, 18 workouts (6 "Mythletics"-branded + Freeletics classics), and the "4-Week Foundation" program.
- Real usage data may exist in the local MongoDB (`MONGODB_URI`) but is not asserted here.
- No testimonials, case studies, press, or real athletes exist yet; future design work must not fabricate them.
- No demo/form videos or imagery are present.

## Product Principles

1. **Coach from the real log.** Advice and generated plans must be grounded in the athlete's actual session history; never invent or fabricate user data.
2. **Bodyweight-first, minimal gear.** The default is no equipment; a bar, bench, or wall is the ceiling, and workouts should state their gear clearly.
3. **Close the loop.** A plan is only as good as the guided session that executes it and the analytics that prove it worked — plan → train → analyze.
4. **Consistency beats intensity.** Rest days, recovery, streaks, and repeatable scheduling are treated as part of progress, not gaps.
5. **Usable mid-sweat.** Every surface must stay scannable and reliable on a phone in the gym with a live timer running; no fluff, no dead weight.

## Accessibility & Inclusion

No explicit standard is committed yet. Current implementation hardcodes `userScalable: false` and `maximumScale: 1` in the viewport, disabling pinch-zoom — an open a11y concern to revisit. Color contrast relies on the current dark palette only.
