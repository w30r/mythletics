---
target: Dashboard (root page)
total_score: 24
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-08-07T16-59-37Z
slug: src-app-main-page-tsx
---
# Dashboard Critique — Mythletics

**Design Health Score: 24/40 (Acceptable)**

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | force-dynamic + 3 awaited DB reads with no loading.tsx/skeletons = silent blank wait |
| 2 | Match System / Real World | 2 | "blocks" jargon unglossed; "0 days" streak meaningless; no myth vocabulary on brand surface |
| 3 | User Control and Freedom | 3 | no undo after session delete; no back from mis-started session |
| 4 | Consistency and Standards | 3 | Flame = streak AND rest day; stat icon colors semantically arbitrary |
| 5 | Error Prevention | 3 | delete confirm + toasts solid; nothing else risky |
| 6 | Recognition Rather Than Recall | 2 | recent sessions anonymous ("Workout session" + date), no workout name, not links |
| 7 | Flexibility and Efficiency | 2 | zero accelerators: no resume, no repeat, no keyboard path |
| 8 | Aesthetic and Minimalist Design | 3 | clean and restrained; unlabeled bottom action row edges toward sterile |
| 9 | Error Recovery | 3 | toasts + friendly empty states; no error boundary |
| 10 | Help and Documentation | 1 | nothing; AI Coach (the help mechanism) is least discoverable |
| **Total** | | **24/40** | **Acceptable** |

## Design Specificity Verdict

Generic — a white-label fitness product could ship it unchanged. Greek-mythology identity lives in the data layer (god-named workouts), not the surface. `sidebar-primary` token (indigo) defined but unused.

## Overall Impression

Competent generic dashboard wearing a toga. Today card states + empty-state copy + session-delete micro-craft are genuinely good; identity, recognition, and speed-of-use are weak. Biggest opportunity: make the dashboard sound like Mythletics.

## Priority Issues

- **[P0] Pinch-zoom disabled** — `viewport` sets `maximumScale:1, userScalable:false` (WCAG 1.4.4/2.1.4 failure). Fix: delete both props. Command: /impeccable adapt.
- **[P1] Recent sessions anonymous & inert** — rows show "Workout session" + date·duration; `workoutId` selected but workout name never fetched/shown; not links. Fix: render workoutName, make rows link, add ghost repeat. Command: /impeccable polish.
- **[P1] No resume/in-progress state** — abandoned session invisible; "Start session" always fresh. Fix: resume banner when `completed:false` session exists. Command: /impeccable polish.
- **[P1] First-timer sees a wall of zeroes** — 4 stat cards render "0 days / 0m / 0 completed / 0 all-time" on first login. Fix: zero-state transform / "Your quest begins today". Command: /impeccable onboard.
- **[P2] Dashboard doesn't know it's Mythletics** — no greeting, no myth framing, coach CTA buried below fold. Command: /impeccable bolder.
- **[P2] No loading feedback on server-bound page** — no loading.tsx/skeletons. Command: /impeccable polish.

## Persona Red Flags

- **Alex**: recent sessions = dead end (no name/links/repeat); computeStats computes prs/workoutPbs/week deltas that dashboard throws away; no PR alert.
- **Jordan**: zero-wall stat strip on day one; no name/welcome; "2 blocks · 14 exercises" jargon; two equal-weight CTAs with no recommendation.
- **Sam**: pinch-zoom disabled (P0); text-xs sub-labels at muted-foreground; window.confirm delete dialog.
- **Casey**: no resume affordance; mobile top bar hamburger-only (no brand mark); delete buttons always visible on rows (thumb-slip risk).

## Minor Observations

- Card `ring-foreground/10` on near-black bg = ~1% lightness apart, reads as one slab.
- Buttons shrink on desktop (`sm:h-8` vs `h-11` mobile) — CTA physically smaller where users have room.
- Logo block copy-pasted twice (sidebar + mobile sheet).
- "Reps logged" card sub "all-time" does weird unit work.

## Questions to Consider

- Why is the brand's signature visible in data but absent from the surface?
- Would "~28 min · 3 rounds" above Start session change the click rate?
- When streak=1 and today is a rest day, whose responsibility is that loss?
- What would the page look like if it showed the data computeStats already paid for?
