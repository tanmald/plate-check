# PlateCheck — Backlog

_Date: 2026-07-14 · Prioritized list of everything still open after PRs #8–#14 and #16._

This is the companion doc to [APP_REVIEW.md](./APP_REVIEW.md) (which documents what was found and fixed) and the roadmap docs ([ROADMAP_ADHERENCE.md](./ROADMAP_ADHERENCE.md), [FEATURE_CHALLENGES.md](./FEATURE_CHALLENGES.md), [IOS_WIDGET_FEASIBILITY.md](./IOS_WIDGET_FEASIBILITY.md)). Items are grouped by area and roughly ordered by priority within each group. Anything marked 🔺 needs an explicit decision from the user before code should be written — don't just pick an approach and go.

---

## 0. 🔺 Reconcile `main` ↔ `dev` (do this first)

The repository currently has two diverged branches carrying incompatible rewrites of the same UI surface:

- **`main`**: base + PR #8 (docs) + PR #10 (security) + **PR #7**, a full `react-i18next` system merged in a separate session (`src/i18n/`, `en.json`/`pt-PT.json`, `useTranslation()`/`t()` calls across most pages).
- **`dev`**: base + the fix chain from this review (PR #9 content, #11, #12, #13, #14), which standardized on **hardcoded English strings** (no i18n framework) per explicit instruction ("A língua principal da app é EN").

Both branches touch `Home.tsx`, `Progress.tsx`, `Plan.tsx`, `MealResult.tsx`, `Settings.tsx`, and more. A merge in either direction will produce heavy, semantically-tricky conflicts (e.g. `t("progress.title")` vs. a literal `"Progress"` string in the same JSX position) — this is not a mechanical merge.

**Also blocking:** PR #9 is still open against `main`, but its content already exists in `dev` — it should be retargeted to `dev` (where it'll likely be a no-op) or closed once the reconciliation strategy is decided.

**Decision needed:** which direction wins?
- (a) Adopt PR #7's `react-i18next` architecture as the standard, and port the `dev`-only fixes (#9/#11/#12/#13/#14/#16 content) on top of it — more future-proof if Portuguese support is ever wanted again, but means re-doing i18n-wiring work on every file the fix chain touched.
- (b) Keep the `dev` branch's hardcoded-English approach as the standard, and strip PR #7's i18n plumbing back out of `main` — less total work right now, but throws away real effort from PR #7 and forecloses easy multi-language support later.
- (c) Something in between (e.g. keep i18next but only populate the `en` bundle, remove `pt-PT`).

Until this is resolved, avoid opening further PRs that touch the same pages from both lineages — it compounds the eventual merge cost.

---

## 1. Security

| Item | Notes |
|---|---|
| Fake social login (`Auth.tsx:126-131`) | Apple/Google buttons fake a 1.5s delay then navigate to `/onboarding` without authenticating. Either wire up real Supabase OAuth or remove the buttons — leaving them is actively misleading. |
| `AuthCallback` can hang on success | Doesn't navigate after a successful code exchange, assuming a redirect that never happens on a public route. One-line fix: `navigate('/')` on success. |
| **Rotate the Supabase anon key + project ref** | PR #12 scrubbed the live values out of the docs' working-tree content, but they remain recoverable from git history. Anon keys are public-by-design, but pairing them with the project ref made targeting trivial; rotate as a precaution since the pairing was exposed for a period. This is an action in the Supabase dashboard, not a code change. |
| CORS `*` on all three edge functions | Restrict `Access-Control-Allow-Origin` to the production origin(s) in `analyze-meal`, `parse-nutrition-plan`, `extract-ingredients`. |
| No JSON-shape validation on `extract-ingredients` | `JSON.parse(content)` on the OpenAI response is trusted as-is (`supabase/functions/extract-ingredients/index.ts:89-94`) — a malformed or adversarial completion propagates straight into the shopping list. Validate the parsed shape before using it. |
| Auth material in `localStorage` | Supabase's default session storage (plus the hand-rolled `mock-session`) is exfiltratable by any XSS. Consider Supabase's cookie-based/SSR session strategies post-MVP; documented as a known tradeoff in `docs/DEVILS_ADVOCATE.md`. |
| Silent placeholder fallback in `supabase.ts` | Falls back to `https://placeholder.supabase.co` when env vars are missing instead of failing loudly; `isSupabaseConfigured` is exported but never enforced anywhere. |

## 2. Architecture

| Item | Notes |
|---|---|
| `useUserProfile` isn't a React Query hook | Hand-rolled `useState`/`useEffect` in `use-auth.ts`, no cache invalidation after `useUpdateProfile`, and no unmount guard (possible setState-after-unmount). Convert to `useQuery`/`useMutation` like every other data hook in the app. |
| `useCreateNutritionPlan` drops fields on manual plan creation | Omits `disallowed_foods`, `name`, `options`, `optional_addons` that the read path expects (`use-nutrition-plan.ts:180-194` vs. `:70-86`). Manually-created plans silently lose data the parsed-plan path populates. |
| No `ErrorBoundary`, and query error states are largely unused | Several `useQuery` call sites destructure `isError`/`error` but never render anything for it — a failed fetch just looks like an empty state. Add a top-level `ErrorBoundary` and audit query error handling. |
| `retryWithBackoff` (if present) is inert / unused | Verify whether any retry helper is actually wired into the Supabase/edge-function call sites, or if it's dead code providing false confidence. |
| Zero automated test coverage | No unit, integration, or E2E tests exist (confirmed via Playwright smoke-testing done manually in this review, not via a checked-in suite). At minimum: Vitest unit tests for `src/lib/scoring.ts` and the `use-nutrition-plan.ts` computation helpers (`computeDailyTargets`, `getLoggableMealCount`), since those have already had real parsing bugs. |
| Bundle size (~1MB) | No code-splitting; consider route-based `React.lazy()` for the heavier pages (Plan, Progress) once the i18n reconciliation (#0) settles the page boundaries. |
| `database.types.ts` not regenerated from the live schema | Manually patched for `meal_logs.plan_id` (PR #14) rather than regenerated. Run `supabase gen types typescript` against the actual schema and reconcile any drift, particularly around the weekly-meal-plan/shopping-list tables. |
| Dead DB tables — decision pending | `meal_slots`/`meal_options`/`meal_constraints`/`meal_references`/`weekly_progress` confirmed unused by any code path. User has explicitly declined to drop them for now ("Só o FK, sem dropar nada" — PR #14 added only the `meal_logs.plan_id` FK). Revisit with specific per-table confirmation before any DROP migration is written. |

## 3. Features

| Item | Notes |
|---|---|
| Progress date navigation is dead | Prev/next buttons in `Progress.tsx` don't change the displayed date. Either implement real date navigation or remove the controls. |
| Settings has several no-op controls | Notifications toggle is pure local state (doesn't persist or actually gate notifications); Export/Privacy/Delete-account/Help all show "coming soon" toasts. A **non-functional "Delete account" control is a GDPR-adjacent liability** if the app has any EU users — implement it or remove it, don't ship a fake one. |
| Roadmap phases 2–4 | See [ROADMAP_ADHERENCE.md](./ROADMAP_ADHERENCE.md) — Phase 0 (making the core loop trustworthy) is essentially done via PRs #9/#11/#16; Phases 1+ (richer adherence insights, plan-vs-actual comparisons, etc.) haven't been started. |
| Challenges / "75 Hard" | See [FEATURE_CHALLENGES.md](./FEATURE_CHALLENGES.md) for the detailed design — new "Challenges" nav entry, execution model, notifications. Not started; depends on the timezone/day-boundary convention (APP_REVIEW.md P0 #7) being settled, since challenge-day rollover inherits the same UTC-vs-local question. |
| iOS widget | See [IOS_WIDGET_FEASIBILITY.md](./IOS_WIDGET_FEASIBILITY.md) — requires wrapping the app in Capacitor (or a native shell) before a WidgetKit extension is possible; the current pure-web architecture can't host a widget directly. Not started. |

## 4. Usability

| Item | Notes |
|---|---|
| Silent failures | Several mutations (e.g. plan parsing, meal analysis) don't clearly surface failure states to the user beyond a generic toast, if that. Audit each `useMutation`'s `onError` for a clear, actionable message. |
| No offline handling | The app assumes a live network connection throughout; no offline banner, no queued-writes-on-reconnect behavior. Likely acceptable for MVP but worth flagging before wider release. |
| Icon-only buttons without `aria-label` | PR #12's accessibility pass covered Settings rows, the Log button's animation, and the native `confirm()` replacement, but didn't comprehensively audit every icon-only button (e.g. some in `Progress.tsx`, `Plan.tsx`). Spot-check before adding more icon-only controls. |

---

## How this list was produced

Round 1 (initial full-app review) produced `APP_REVIEW.md`'s P0/P1/Security/Architecture lists, most of which are now fixed (see status markers in that doc). Round 2 was a fresh code-review pass across PRs #8–#14 after they were merged, which found and fixed 7 additional bugs (documented in APP_REVIEW.md's "Review round 2" section, shipped in PR #16) and surfaced the items above that remain open. Nothing in this document has been fixed yet — it's the prioritized queue for what comes next, with item 0 (branch reconciliation) blocking further UI work on the affected pages.
