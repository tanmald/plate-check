# PlateCheck — End-to-End Application Review

_Date: 2026-07-05 · Scope: full frontend, hooks, contexts, Supabase schema, edge functions, docs_
_Updated: 2026-07-14 — fix status annotated per item; see [Review round 2](#review-round-2-2026-07-14) for a second code-review pass and [BACKLOG.md](./BACKLOG.md) for the prioritized list of what's still open._

> **Status legend:** ✅ Fixed · ⏳ Open (tracked in [BACKLOG.md](./BACKLOG.md)) · 🔺 Escalated to the user (needs a decision, not just a diff)

## Executive summary

The app is further along than its own documentation claims: the three edge functions (`analyze-meal`, `parse-nutrition-plan`, `extract-ingredients`) are **real GPT-4o implementations**, not mocks. However, the **real-user pipeline is broken end-to-end**: a real (non-test) user who logs a meal today will most likely hit a failed database insert, the AI will not be able to read the photo, and even if both succeeded, daily progress, weekly averages, and streaks would still display zero forever. The app currently *appears* to work because test mode and hardcoded mock content mask these failures.

The good news: every P0 issue below is a small, targeted fix. The core loop (photo → AI analysis → score → progress) is architecturally sound.

**Related docs:** [ROADMAP_ADHERENCE.md](./ROADMAP_ADHERENCE.md) (Phase 0 = fixing the P0s below) · [FEATURE_CHALLENGES.md](./FEATURE_CHALLENGES.md) · [IOS_WIDGET_FEASIBILITY.md](./IOS_WIDGET_FEASIBILITY.md)

---

## P0 — Critical bugs (real-user flow is broken)

### 1. Progress reads a column that doesn't exist ✅ Fixed (PR #9)
`src/hooks/use-progress.ts` queries `daily_adherence_score` in six places (lines 57, 113, 128, 130, 164, 171), but the `daily_progress` column is `average_score` (see `supabase/migrations/20260116234210_initial_schema.sql` and `src/types/database.types.ts:44`).

- **Symptom:** daily score, weekly average, and streak are always 0 for real users. The `.select("date, daily_adherence_score")` / `.gte("daily_adherence_score", 70)` calls (lines 128–130) reference a nonexistent column, which PostgREST rejects outright.
- **Fix:** rename all six references to `average_score`.

### 2. The daily-progress trigger never fires ✅ Fixed (PR #9)
The DB trigger `update_daily_progress()` only aggregates when a meal log reaches `status = 'scored'` (initial migration, line ~362). But `src/hooks/use-meals.ts:136` inserts `status: "completed"` and never sets `scored_at`.

- **Symptom:** `daily_progress` is never populated for real users — progress stays empty even after fixing bug #1.
- **Fix:** insert with `status: "scored"` and `scored_at: new Date().toISOString()`, or update the trigger to accept the client's status vocabulary. Align on one status enum (`uploaded / foods_detected / scored` per the schema comment).

### 3. Meal-log insert has a type mismatch ✅ Fixed (PR #9)
`src/hooks/use-meals.ts:130` writes `detection_confidence: analysisResult.confidence`, which is the string `"high" | "medium" | "low"`, into a `NUMERIC` column (`database.types.ts:133`).

- **Symptom:** the insert errors — real-user meal logging aborts at the DB write.
- **Fix:** map the label to a number (e.g. high→0.9, medium→0.6, low→0.3) or change the column type.

### 4. OpenAI Vision receives an unreadable photo URL ✅ Fixed (PR #9)
`src/lib/storage.ts:25-27` (`uploadMealPhoto`) returns `getPublicUrl()` for the **private** `meal-photos` bucket, and that URL is passed through `use-meals.ts` into `analyze-meal`, which hands it to OpenAI as `image_url`. OpenAI cannot authenticate against the bucket.

- **Symptom:** Vision analysis fails for real users.
- **Fix:** create a short-lived **signed URL** — exactly what `use-nutrition-plan.ts:236-239` already does for plan uploads. Reuse that pattern.
- **Follow-up (review round 2, PR #16):** the upload path was fixed, but *reading back* a saved meal's photo was still broken — `useMeals`/`useMealLogDetail` displayed the raw private `photo_path` as an `<img src>`. Fixed by batch-signing via `createSignedUrls` and exposing `photoUrl`.

### 5. "Today's Meals" shows the entire history ✅ Fixed (PR #9)
`useMeals(date)` (`src/hooks/use-meals.ts:24-52`) puts `date` in the query key but never filters the query by it — it selects all of the user's `meal_logs`.

- **Symptom:** Home and Progress render every meal ever logged as "today".
- **Fix:** add `.gte("logged_at", startOfDay).lt("logged_at", endOfDay)` derived from the `date` param (mind timezone — see #7).

### 6. Tapping a saved meal shows a fabricated analysis ✅ Fixed (PR #9)
Home (`Home.tsx:137-143`) and Progress (`Progress.tsx:120-124`) navigate to `/meal-result` passing only `{ mealType }`. `MealResult.tsx:58` falls back to a hardcoded `mockResult` (78-score chicken/rice/Caesar) whenever `analysisResult` is missing, and Save is a no-op without a `mealLogId`.

- **Symptom:** real users tap their real meal and see someone else's fake meal.
- **Fix:** pass `mealLogId` in router state and load the stored `scoring_result` / `detected_foods` from `meal_logs`; remove the mock fallback for authenticated non-test users.

### 7. Day boundaries disagree across the stack ✅ Fixed (PR #9, UTC convention)
- DB trigger buckets by `DATE(logged_at)` → **UTC**.
- Client inserts `logged_at` as UTC and derives "today" via `toISOString().split("T")[0]` → **UTC** (`use-progress.ts:24, 91`).
- Streak math uses **local** midnight (`use-progress.ts:137-146`); labels use `toLocaleDateString`.

- **Symptom:** for any user not on UTC, meals logged in the evening land on the "wrong" day; streaks and daily averages disagree with what the user sees.
- **Fix:** pick one convention. Recommended: store UTC timestamps but aggregate by the **user's local date** (store `local_date` on the log at insert time, computed client-side). This matters even more for Challenges (see [FEATURE_CHALLENGES.md](./FEATURE_CHALLENGES.md#day-rollover--timezones)).
- **What actually shipped:** PR #9 standardized the client on **UTC** everywhere (trigger, query boundaries, streak comparison) rather than the local-date recommendation above — internally consistent and correct for the fix's scope, but non-UTC users still see meals roll over at the wrong local hour. The local-date approach remains open; tracked in [BACKLOG.md](./BACKLOG.md).

---

## P1 — High-priority bugs and broken UX

| # | Issue | Location | Status | Notes |
|---|-------|----------|--------|-------|
| 8 | "Replace Plan" button is a no-op | `Plan.tsx:495-503` | ✅ Fixed (PR #12) | Sets `viewState="empty"` but the empty branch requires `!hasPlan`, which stays true → falls through to the active view. Fixed via a dedicated `isReplacingPlan` state during the `Plan.tsx` split. |
| 9 | Social auth is fake | `Auth.tsx:126-131` | ⏳ Open | Apple/Google buttons `setTimeout(1500)` then navigate to `/onboarding`; the user is never authenticated, so the next protected action bounces them to `/landing`. Remove the buttons or implement Supabase OAuth. |
| 10 | AuthCallback can hang on success | `AuthCallback.tsx:11-35` | ⏳ Open | On successful code exchange it deliberately doesn't navigate, assuming a redirect that never happens on a public route. Navigate to `/` on success. |
| 11 | Hardcoded dates | `Home.tsx:89`, `Progress.tsx:88,180` | ✅ Fixed (PR #11) | Literal "Sunday, Jan 5" / "Dec 30 - Jan 5" shown to everyone. Now computed from the current date. |
| 12 | Mock content leaks into real-user UI | `Progress.tsx:235-239` (Adherence by Meal 92/78/71/85), `Progress.tsx:154-167,273-287` (insights), `Progress.tsx:132-144` (fake "Dinner — not logged" card), `Progress.tsx:27` (`lastWeekAverage=78`), `Home.tsx:152-164` (dinner suggestion), `Plan.tsx:488-489` (`calories={1800} protein={120}`) | ✅ Fixed (PR #11, hardened in #16) | Now derived from real data (`useAdherenceByMealType`, `usePreviousWeekAverage`, `computeDailyTargets`) or hidden when absent. PR #16 additionally fixed `usePreviousWeekAverage`/`computeDailyTargets` returning misleading `0`/`null`-as-zero instead of "no data" — see [Review round 2](#review-round-2-2026-07-14) items 5–6. |
| 13 | `totalMeals` hardcoded to 4 | `use-progress.ts:52,62`, `Home.tsx:35` | ✅ Fixed (PR #11) | Plans can have 7 templates; derived from the active plan's template count via `getLoggableMealCount`. |
| 14 | Score-tier thresholds exist in 5+ variants | `AdherenceScore.tsx:10-14` (70/40) vs `:28-33` (80/70/50), `Progress.tsx:25` (≥60), `Progress.tsx:253,260` (70/50), `MealResult.tsx:174-178`, `WeeklyChart.tsx:15-20` | ✅ Fixed (PR #11) | Centralized in `AdherenceScore.tsx` (`getScoreStatus/Label/Color`); all callers now import instead of re-deriving. |
| 15 | Profile edits don't propagate | `use-auth.ts:14-56` | ⏳ Open | `useUserProfile` is hand-rolled `useState`/`useEffect` (not TanStack Query), no cache invalidation after `useUpdateProfile`, and no unmount guard (setState-after-unmount race). Convert to `useQuery`/`useMutation`. |
| 16 | Manual plan creation drops fields | `use-nutrition-plan.ts:180-194` | ⏳ Open | Omits `disallowed_foods`, `name`, `options`, `optional_addons` that the read path (lines 70-86) expects. |
| 17 | Dead controls | `Progress.tsx:30-36,90,182` (date nav), `Settings.tsx:31,76` (notifications toggle — pure local state), `Settings.tsx:54-72` (Export/Privacy/Delete/Help → "coming soon" toasts) | ⏳ Open | Either implement or remove; a Settings "Delete account" that does nothing is a GDPR-adjacent liability. |
| 18 | Dead page | `src/pages/OAuthConsent.tsx` | ✅ Fixed (PR #12) | Not referenced by any route. Deleted. |

---

## Security

1. **Test-user auth bypass ships to production.** ✅ Fixed (PR #10) — `AuthContext.tsx` now gates `signUp`, `signIn`, and the mock-session pickup behind `TEST_USER_BYPASS_ENABLED = import.meta.env.DEV`.
2. **Auth material in localStorage** (Supabase default + the hand-rolled `mock-session`) — exfiltratable by any XSS. ⏳ Open. Documented in `docs/DEVILS_ADVOCATE.md`; consider Supabase SSR/cookie strategies post-MVP.
3. **Live project ref and keys committed** in `docs/EDGE_FUNCTIONS_DEPLOYMENT.md:50,55` and `supabase/functions/README.md:7`. 🔺 Partially fixed (PR #12 scrubbed the docs) — **the keys still need to be rotated**, since they remain in git history regardless of the working-tree scrub. This is a user action, not a code diff; see [BACKLOG.md](./BACKLOG.md).
4. **CORS `*`** on all three edge functions. ⏳ Open. Restrict to the production origin(s).
5. **Silent placeholder fallback:** `supabase.ts:8-11` falls back to `https://placeholder.supabase.co` when env vars are missing; `isSupabaseConfigured` is exported but never enforced. ⏳ Open. Fail fast with a visible error instead.
6. **RLS gaps (currently moot):** `meal_slots`/`meal_options`/`meal_constraints`/`meal_references` have no UPDATE/DELETE policies. 🔺 Escalated — these tables were confirmed dead but the user declined to drop them for now ("Só o FK, sem dropar nada"); PR #14 added `meal_logs.plan_id` without touching the dead tables. Revisit once the user explicitly confirms dropping them table-by-table.

---

## Architecture improvements

1. **Delete or adopt the dead schema.** `meal_slots` → `meal_options` → `meal_constraints` → `meal_references` (the PRD's advanced model) is never written by anything; the live model is `meal_templates`. Similarly `weekly_progress` has no writer — weekly stats are computed client-side in `use-progress.ts`. 🔺 Escalated — user explicitly declined dropping these for now ("Só o FK, sem dropar nada"); still open, needs per-table confirmation.
2. **Regenerate `src/types/database.types.ts`.** ⏳ Partially open — PR #14 manually added the `meal_logs.plan_id` column's type and restored 5 previously-mis-removed dead-table blocks, but the types file has not been regenerated from the CLI against the live schema; still missing the 4 weekly-meal-plan/shopping-list tables' full shape in places. Run `supabase gen types typescript` and add it to the release checklist.
3. **Centralize scoring/tier logic.** ✅ Fixed (PR #11) — `getScoreStatus/Label/Color` now live only in `AdherenceScore.tsx`; the five divergent copies (`Progress.tsx`, `MealResult.tsx`, `WeeklyChart.tsx`) were deleted and now import the shared helpers.
4. **Persist the meal→plan link.** ✅ Fixed (PR #14, scoped) — `meal_logs.plan_id` FK added (`ON DELETE SET NULL`) and wired through `useCreateMealLog`/`Log.tsx`. Scope was deliberately narrowed to the FK only, per user instruction, with no drops of the dead tables in item 1.
5. **Split `Plan.tsx`** ✅ Fixed (PR #12) — extracted into `PlanEmptyState`, `PlanImportingState`, `PlanReviewState`, `PlanActiveState`; the duplicated review-card block now reuses `MealTemplateCard`.
6. **Pick an i18n strategy.** ✅ Resolved — `main`'s `react-i18next` system (PR #7) was kept as the standard; `dev`'s fix-chain logic was re-wired with `t()` calls and the locale bundles were extended to cover the Health Tracking feature (PR #15) and the `Plan.tsx` split (PR #12), which never had translations before. See item #0 in [BACKLOG.md](./BACKLOG.md).
7. **Update stale docs.** ✅ Fixed (PR #12, extended in #16) — `CLAUDE.md`, `EDGE_FUNCTIONS_DEPLOYMENT.md`, `supabase/functions/README.md`, `DEVELOPMENT.md` corrected; PR #16 additionally removed the stale "Camera capture - Simulated" claim (capture uses the real `getUserMedia` API).
8. **Accessibility pass:** ✅ Fixed (PR #12) — Settings rows are now `<button>`s, the Log button's pulse animation respects `motion-safe:`, and `EditMealTemplate.tsx` uses `AlertDialog` instead of a blocking `confirm()`. `aria-label`s on the remaining icon-only buttons were not comprehensively audited; spot-check before shipping new icon-only controls.

---

## Suggested fix order

1. **P0 #1–#4** (progress column, trigger status, confidence type, signed URL) — four small diffs that make the real pipeline work at all. ✅ Done, PR #9.
2. **P0 #5–#6** (date filter, meal detail via `mealLogId`) — makes what users see truthful. ✅ Done, PR #9.
3. **P0 #7** (timezone convention) — decide before Challenges ships, since Challenges inherits the same day-boundary problem. ✅ Done (UTC-only convention), PR #9 — the local-date refinement remains open in BACKLOG.md.
4. **Security #1** (gate test bypass) — one-line risk removal. ✅ Done, PR #10.
5. **P1 #11–#14** (hardcoded dates/mock content/tier logic) — trust and polish. ✅ Done, PR #11.
6. Architecture items opportunistically alongside feature work (roadmap Phase 1+). ✅ Partially done — `Plan.tsx` split, a11y, doc fixes shipped in PR #12; i18n in PR #13 (English) then complicated by the independently-merged PR #7 (react-i18next); `meal_logs.plan_id` FK in PR #14. Remaining architecture items now live in [BACKLOG.md](./BACKLOG.md).

---

## Review round 2 (2026-07-14)

A second full-codebase pass (after PRs #9–#14 were merged) found 7 additional bugs, all in the parts of the pipeline the P0/P1 fixes had just touched — corrections, invalidation, and display, rather than new surface area. All 7 were fixed in **PR #16** (`claude/review-fixes` → `dev`).

| # | Issue | Fix |
|---|-------|-----|
| 1 | Correcting a meal's foods left the daily score stale | The `update_daily_progress()` DB trigger only fired on the transition *into* `status = 'scored'`; a correction changes `adherence_score` while `status` is already `'scored'`, so the trigger never re-ran. New migration widens the fire condition to also trigger `OR NEW.adherence_score IS DISTINCT FROM OLD.adherence_score`. |
| 2 | `useUpdateMealLog` only invalidated the `["meals"]` query | Now also invalidates `meal-log-detail`, `daily-progress`, `weekly-progress`, `adherence-by-meal-type`, `previous-week-average` — everything a correction can change. |
| 3 | Reopening a corrected meal showed the original (pre-correction) foods | `useMealLogDetail` read `scoring_result.detectedFoods` unconditionally; it now prefers `user_corrections.corrections` (filtered for `!isDeleted`) when present, keeping the AI result as an audit trail rather than the display source. |
| 4 | Real users' meal photos were broken images | `useMeals`/`useMealLogDetail` displayed the raw private-bucket `photo_path` as an `<img src>`. Now batch-signs via `createSignedUrls` and exposes `photoUrl`. |
| 5 | "+X% vs last week" trend chip was shown even with no prior-week data | `usePreviousWeekAverage`/`calculatePreviousWeekAverage` now return `number \| null` (was defaulting to `0`, which read as a real average); `Progress.tsx` hides the trend chip when `trend == null`. |
| 6 | Missing macro target displayed as "0g" instead of "no data" | `computeDailyTargets` now returns `{ calories?: number; protein?: number } \| null` instead of coercing an absent value to `0`; `DailyTargetsCard` shows "–" for `null`/`undefined`. |
| 7 | Minor: stale `hasChanges` state after reopening a meal; stale "Camera capture - Simulated" doc claim | `MealResult.tsx` resets `hasChanges` when `result` changes; `CLAUDE.md`/`DEVELOPMENT.md` corrected (capture is real `getUserMedia`, not simulated). |

**Suspicions investigated and refuted** (no action taken): edits wiped on window refocus (React Query structural sharing handles this correctly), PostHog double-firing analytics events, stale Portuguese category names in `ingredient-categories.ts` (they degrade gracefully to "Other", not a crash), `plan_id` appearing as a mock value in the database for test users (the test-mode code path returns before any DB call), and an assumed conflict between PR #10's auth gating and the later fix chain (no actual conflict — different files, disjoint changes).

See [BACKLOG.md](./BACKLOG.md) for the prioritized list of everything still open, including the `main`↔`dev` branch divergence, which is the most consequential unresolved item.
