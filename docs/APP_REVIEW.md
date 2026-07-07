# PlateCheck — End-to-End Application Review

_Date: 2026-07-05 · Scope: full frontend, hooks, contexts, Supabase schema, edge functions, docs_

## Executive summary

The app is further along than its own documentation claims: the three edge functions (`analyze-meal`, `parse-nutrition-plan`, `extract-ingredients`) are **real GPT-4o implementations**, not mocks. However, the **real-user pipeline is broken end-to-end**: a real (non-test) user who logs a meal today will most likely hit a failed database insert, the AI will not be able to read the photo, and even if both succeeded, daily progress, weekly averages, and streaks would still display zero forever. The app currently *appears* to work because test mode and hardcoded mock content mask these failures.

The good news: every P0 issue below is a small, targeted fix. The core loop (photo → AI analysis → score → progress) is architecturally sound.

**Related docs:** [ROADMAP_ADHERENCE.md](./ROADMAP_ADHERENCE.md) (Phase 0 = fixing the P0s below) · [FEATURE_CHALLENGES.md](./FEATURE_CHALLENGES.md) · [IOS_WIDGET_FEASIBILITY.md](./IOS_WIDGET_FEASIBILITY.md)

---

## P0 — Critical bugs (real-user flow is broken)

### 1. Progress reads a column that doesn't exist
`src/hooks/use-progress.ts` queries `daily_adherence_score` in six places (lines 57, 113, 128, 130, 164, 171), but the `daily_progress` column is `average_score` (see `supabase/migrations/20260116234210_initial_schema.sql` and `src/types/database.types.ts:44`).

- **Symptom:** daily score, weekly average, and streak are always 0 for real users. The `.select("date, daily_adherence_score")` / `.gte("daily_adherence_score", 70)` calls (lines 128–130) reference a nonexistent column, which PostgREST rejects outright.
- **Fix:** rename all six references to `average_score`.

### 2. The daily-progress trigger never fires
The DB trigger `update_daily_progress()` only aggregates when a meal log reaches `status = 'scored'` (initial migration, line ~362). But `src/hooks/use-meals.ts:136` inserts `status: "completed"` and never sets `scored_at`.

- **Symptom:** `daily_progress` is never populated for real users — progress stays empty even after fixing bug #1.
- **Fix:** insert with `status: "scored"` and `scored_at: new Date().toISOString()`, or update the trigger to accept the client's status vocabulary. Align on one status enum (`uploaded / foods_detected / scored` per the schema comment).

### 3. Meal-log insert has a type mismatch
`src/hooks/use-meals.ts:130` writes `detection_confidence: analysisResult.confidence`, which is the string `"high" | "medium" | "low"`, into a `NUMERIC` column (`database.types.ts:133`).

- **Symptom:** the insert errors — real-user meal logging aborts at the DB write.
- **Fix:** map the label to a number (e.g. high→0.9, medium→0.6, low→0.3) or change the column type.

### 4. OpenAI Vision receives an unreadable photo URL
`src/lib/storage.ts:25-27` (`uploadMealPhoto`) returns `getPublicUrl()` for the **private** `meal-photos` bucket, and that URL is passed through `use-meals.ts` into `analyze-meal`, which hands it to OpenAI as `image_url`. OpenAI cannot authenticate against the bucket.

- **Symptom:** Vision analysis fails for real users.
- **Fix:** create a short-lived **signed URL** — exactly what `use-nutrition-plan.ts:236-239` already does for plan uploads. Reuse that pattern.

### 5. "Today's Meals" shows the entire history
`useMeals(date)` (`src/hooks/use-meals.ts:24-52`) puts `date` in the query key but never filters the query by it — it selects all of the user's `meal_logs`.

- **Symptom:** Home and Progress render every meal ever logged as "today".
- **Fix:** add `.gte("logged_at", startOfDay).lt("logged_at", endOfDay)` derived from the `date` param (mind timezone — see #7).

### 6. Tapping a saved meal shows a fabricated analysis
Home (`Home.tsx:137-143`) and Progress (`Progress.tsx:120-124`) navigate to `/meal-result` passing only `{ mealType }`. `MealResult.tsx:58` falls back to a hardcoded `mockResult` (78-score chicken/rice/Caesar) whenever `analysisResult` is missing, and Save is a no-op without a `mealLogId`.

- **Symptom:** real users tap their real meal and see someone else's fake meal.
- **Fix:** pass `mealLogId` in router state and load the stored `scoring_result` / `detected_foods` from `meal_logs`; remove the mock fallback for authenticated non-test users.

### 7. Day boundaries disagree across the stack
- DB trigger buckets by `DATE(logged_at)` → **UTC**.
- Client inserts `logged_at` as UTC and derives "today" via `toISOString().split("T")[0]` → **UTC** (`use-progress.ts:24, 91`).
- Streak math uses **local** midnight (`use-progress.ts:137-146`); labels use `toLocaleDateString`.

- **Symptom:** for any user not on UTC, meals logged in the evening land on the "wrong" day; streaks and daily averages disagree with what the user sees.
- **Fix:** pick one convention. Recommended: store UTC timestamps but aggregate by the **user's local date** (store `local_date` on the log at insert time, computed client-side). This matters even more for Challenges (see [FEATURE_CHALLENGES.md](./FEATURE_CHALLENGES.md#day-rollover--timezones)).

---

## P1 — High-priority bugs and broken UX

| # | Issue | Location | Notes |
|---|-------|----------|-------|
| 8 | "Replace Plan" button is a no-op | `Plan.tsx:495-503` | Sets `viewState="empty"` but the empty branch requires `!hasPlan`, which stays true → falls through to the active view. Replacing a plan is only possible via edit → delete. |
| 9 | Social auth is fake | `Auth.tsx:126-131` | Apple/Google buttons `setTimeout(1500)` then navigate to `/onboarding`; the user is never authenticated, so the next protected action bounces them to `/landing`. Remove the buttons or implement Supabase OAuth. |
| 10 | AuthCallback can hang on success | `AuthCallback.tsx:11-35` | On successful code exchange it deliberately doesn't navigate, assuming a redirect that never happens on a public route. Navigate to `/` on success. |
| 11 | Hardcoded dates | `Home.tsx:89`, `Progress.tsx:88,180` | Literal "Sunday, Jan 5" / "Dec 30 - Jan 5" shown to everyone. Compute from the current date. |
| 12 | Mock content leaks into real-user UI | `Progress.tsx:235-239` (Adherence by Meal 92/78/71/85), `Progress.tsx:154-167,273-287` (insights), `Progress.tsx:132-144` (fake "Dinner — not logged" card), `Progress.tsx:27` (`lastWeekAverage=78`), `Home.tsx:152-164` (dinner suggestion), `Plan.tsx:488-489` (`calories={1800} protein={120}`) | Derive from real data or hide when data is absent. |
| 13 | `totalMeals` hardcoded to 4 | `use-progress.ts:52,62`, `Home.tsx:35` | Plans can have 7 templates; "X of 4 meals" is wrong. Derive from the active plan's template count. |
| 14 | Score-tier thresholds exist in 5+ variants | `AdherenceScore.tsx:10-14` (70/40) vs `:28-33` (80/70/50), `Progress.tsx:25` (≥60), `Progress.tsx:253,260` (70/50), `MealResult.tsx:174-178`, `WeeklyChart.tsx:15-20` | A 40–49 score gets the label "Off plan" with a warning-yellow color. Centralize in `src/lib/scoring.ts` and import everywhere. |
| 15 | Profile edits don't propagate | `use-auth.ts:14-56` | `useUserProfile` is hand-rolled `useState`/`useEffect` (not TanStack Query), no cache invalidation after `useUpdateProfile`, and no unmount guard (setState-after-unmount race). Convert to `useQuery`/`useMutation`. |
| 16 | Manual plan creation drops fields | `use-nutrition-plan.ts:180-194` | Omits `disallowed_foods`, `name`, `options`, `optional_addons` that the read path (lines 70-86) expects. |
| 17 | Dead controls | `Progress.tsx:30-36,90,182` (date nav), `Settings.tsx:31,76` (notifications toggle — pure local state), `Settings.tsx:54-72` (Export/Privacy/Delete/Help → "coming soon" toasts) | Either implement or remove; a Settings "Delete account" that does nothing is a GDPR-adjacent liability. |
| 18 | Dead page | `src/pages/OAuthConsent.tsx` | Not referenced by any route. Delete or wire up. |

---

## Security

1. **Test-user auth bypass ships to production.** Any visitor can sign in as `test@platecheck.app` (or `*@test.platecheck.app`) with **any password** — `AuthContext.tsx` fabricates a session with no credential check and no `import.meta.env.DEV` gating, and `ProtectedRoute` only checks user truthiness. Gate the entire test-mode branch behind `import.meta.env.DEV`.
2. **Auth material in localStorage** (Supabase default + the hand-rolled `mock-session`) — exfiltratable by any XSS. Documented in `docs/DEVILS_ADVOCATE.md`; consider Supabase SSR/cookie strategies post-MVP.
3. **Live project ref and keys committed** in `docs/EDGE_FUNCTIONS_DEPLOYMENT.md:50,55` and `supabase/functions/README.md:7`. Anon keys are public by design, but pairing them with the project ref in the repo makes targeting trivial. Scrub and rotate.
4. **CORS `*`** on all three edge functions. Restrict to the production origin(s).
5. **Silent placeholder fallback:** `supabase.ts:8-11` falls back to `https://placeholder.supabase.co` when env vars are missing; `isSupabaseConfigured` is exported but never enforced. Fail fast with a visible error instead.
6. **RLS gaps (currently moot):** `meal_slots`/`meal_options`/`meal_constraints`/`meal_references` have no UPDATE/DELETE policies. These tables are dead (see below) — either remove them or complete their policies.

---

## Architecture improvements

1. **Delete or adopt the dead schema.** `meal_slots` → `meal_options` → `meal_constraints` → `meal_references` (the PRD's advanced model) is never written by anything; the live model is `meal_templates`. Similarly `weekly_progress` has no writer — weekly stats are computed client-side in `use-progress.ts`. Keep one source of truth: drop the dead tables (a migration) or migrate the parser to populate them.
2. **Regenerate `src/types/database.types.ts`.** It's missing 8 `meal_templates` columns (migration `20260121220000`) and all 4 tables from migration `20260401000000` (weekly meal plans / shopping lists). Run `supabase gen types typescript` and add it to the release checklist.
3. **Centralize scoring/tier logic.** The 0–100 → tier mapping should live only in `src/lib/scoring.ts` (which already exists and already duplicates the edge function's formula: `100 − min(60, missing×20) − min(40, offPlan×10)`). Export `getScoreStatus/Label/Color` from there and delete the five divergent copies.
4. **Persist the meal→plan link.** `meal_logs` has no FK to the plan/template it was scored against; the association is transient inside the edge function. Add `plan_id` / `meal_template_id` columns — required for plan versioning and for auditing "what was I supposed to eat" (see roadmap Phase 0).
5. **Split `Plan.tsx`** (535 lines, 3 tabs × 4 view states in ternary chains) into `PlanEmpty`, `PlanImporting`, `PlanReview`, `PlanActive`; the review-card block (lines 292-417) duplicates `MealTemplateCard`.
6. **Pick an i18n strategy.** `Plan.tsx` is half Portuguese half English; WeeklyPlanner/ShoppingList are pt-PT, the rest is EN. Either standardize on one language now or introduce `i18next` with `pt`/`en` bundles before the surface grows.
7. **Update stale docs.** `CLAUDE.md` (claims 8 pages — there are 14 + NotFound; describes an onboarding flow that doesn't exist; says unauthenticated users redirect to `/onboarding` — it's `/landing`), `EDGE_FUNCTIONS_DEPLOYMENT.md` and `supabase/functions/README.md` (still call the functions "mock"), `DEVELOPMENT.md` known-limitations list.
8. **Accessibility pass:** Settings rows are clickable `<div>`s (not keyboard-focusable), icon-only buttons lack `aria-label` (`Progress.tsx:83,90,175,182`, `Plan.tsx:453`), the Log button has a permanent `animate-pulse` with no `prefers-reduced-motion` guard, and `EditMealTemplate.tsx:233` uses a blocking native `confirm()` while the rest of the app uses `AlertDialog`.

---

## Suggested fix order

1. **P0 #1–#4** (progress column, trigger status, confidence type, signed URL) — four small diffs that make the real pipeline work at all.
2. **P0 #5–#6** (date filter, meal detail via `mealLogId`) — makes what users see truthful.
3. **P0 #7** (timezone convention) — decide before Challenges ships, since Challenges inherits the same day-boundary problem.
4. **Security #1** (gate test bypass) — one-line risk removal.
5. **P1 #11–#14** (hardcoded dates/mock content/tier logic) — trust and polish.
6. Architecture items opportunistically alongside feature work (roadmap Phase 1+).
