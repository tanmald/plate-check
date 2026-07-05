# PlateCheck — Adherence Roadmap

_The core product question: **given a prescribed nutrition plan, how does the user know — and prove — they are complying?**_

## Positioning (what we learned from Bevel)

Bevel's nutrition module works like this:

- **Multi-modal logging:** photo (AI decomposes the meal into *editable components*), barcode scan, free-text "describe meal", recipes, and a 6M+ food database.
- **Nutrition Score** per meal and per day, computed against user-set calorie/macro/nutrient targets; CGM integration (Dexcom/Libre) personalizes it further.
- **The trust loop:** the AI estimate is always shown to the user for verification/edit *before* it's committed. This single pattern is why users trust the numbers.
- **AI coach:** each domain has an AI summary with follow-up Q&A; plan-vs-actual discrepancies feed future recommendations.
- **Reviewed weakness:** "sufficient for broad trends, lacks the granularity of dedicated nutrition tools."

**PlateCheck's differentiation:** Bevel (and MyFitnessPal, etc.) answer *"how am I eating in general?"* against self-set macro targets. PlateCheck answers *"am I following the specific plan my nutritionist gave me?"* — a prescribed plan with required foods, allowed swaps, and meal slots. That's a different job: **adherence, not tracking**. Everything below optimizes for that job.

The adherence loop we're building:

```
Plan (prescribed) → Expectation (what/when should I eat next?)
      ↓                                   ↓
   Log (photo)  →  Verify (edit AI output) →  Score (explainable)
      ↓                                   ↓
   Day summary  →  Trends/streaks  →  Coach feedback → back to Expectation
```

---

## Phase 0 — Make the loop actually work (prerequisite)

The pipeline is currently broken for real users — see [APP_REVIEW.md](./APP_REVIEW.md) P0 bugs. Nothing below matters until:

1. Progress reads `average_score` (not the nonexistent `daily_adherence_score`).
2. Meal logs insert with `status:'scored'` + `scored_at` so the `daily_progress` trigger fires.
3. `detection_confidence` inserts a number, not a string.
4. Meal photos are sent to OpenAI as **signed URLs**.
5. `useMeals(date)` actually filters by date; meal detail loads the real stored result via `mealLogId`.
6. One timezone convention for "a day".
7. **New:** add `plan_id` and `meal_template_id` FKs to `meal_logs` so every score is auditable against the plan version it was scored on.

_Effort: days, not weeks. This is the highest-ROI work in the entire roadmap._

---

## Phase 1 — Trust the score

If users don't believe the score, they won't act on it. Bevel's verify-before-commit is the model.

### 1.1 Verify & correct before saving (the Bevel trust loop)
- **What:** after AI analysis, show detected foods as editable chips (add/remove/rename) and recompute the score locally before the user confirms. The UI mostly exists in `MealResult.tsx` and the deterministic re-scorer exists in `src/lib/scoring.ts` (`getScoreBreakdown` mirrors the edge-function formula) — it needs to be wired to real data and persisted.
- **Data:** write user edits to `meal_logs.user_corrections` (column exists, unused); store the final score + breakdown in `scoring_result`.
- **Why:** corrections are also training signal — they tell you where GPT-4o misdetects, and they let you show "score after your corrections" honestly.

### 1.2 Explainable score breakdown
- **What:** under every score, show the arithmetic: which required foods were missing (−20 each, capped −60), which foods were off-plan (−10 each, capped −40). Per-food chips: ✅ required-hit / 🟢 allowed / 🟠 off-plan / ⚪ missing-required.
- **Data:** already returned by `analyze-meal` (`detectedFoods[].matchType`, `missingRequired`) and stored in `scoring_result` — this is pure UI surfacing.
- **Why:** "78" means nothing; "you missed the salad and added fries" changes the next meal.

### 1.3 Confidence surfacing
- **What:** when AI confidence is `low`, say so and push the user into the verify flow ("We're not sure — check the detected foods"). Never present a low-confidence score with the same visual authority as a high-confidence one.
- **Data:** `detection_confidence` (after the type fix).

### 1.4 One tier system
- **What:** a single `getScoreStatus/Label/Color` in `scoring.ts` (fixes the five divergent threshold copies). Decide the canonical thresholds once (current de-facto: ≥70 on-track / 40–69 attention / <40 off-plan).

_Effort: ~1–2 weeks. No schema changes beyond Phase 0._

---

## Phase 2 — Close the day loop (expectation vs reality)

Adherence is a property of a **day**, not of a photo. Today the app only reacts to what was logged; it must also represent what *should have been* logged.

### 2.1 Day timeline: plan slots filled by logs
- **What:** Home becomes a timeline of the plan's meal templates (breakfast, mid-morning snack, lunch…) each in one of four states: *upcoming / logged (score) / skipped / missed*. `meal_templates.scheduled_time` and `snack_time_category` already exist in the schema to drive ordering and cutoffs.
- **Data:** derive slot state = template × (matching `meal_log` for that local date) × current time. `totalMeals` finally comes from the plan (fixes the hardcoded 4).
- **Why:** this reframes the product from "photo grader" to "am I on plan *right now*" — the core question.

### 2.2 Missed-meal detection
- **What:** a slot with no log past its cutoff (e.g. `scheduled_time` + 2h) is marked **missed** and drags the daily score down (a missed meal is worse for adherence than a mediocre one, and currently invisible). Allow "I skipped it" and "I ate it but didn't photograph it — quick log" (text-only entry, scored with low confidence).
- **Data:** either compute at read time (v1, no schema change) or materialize a `meal_slot_status` per day (v2, enables notifications).

### 2.3 Daily summary
- **What:** end-of-day recap card: day score, slots hit/missed, the single biggest deviation, one suggestion for tomorrow. This is the natural push-notification payload later (Phase 3).
- **Data:** `daily_progress` (already aggregated by trigger once Phase 0 lands) + the day's `scoring_result`s.

### 2.4 Weekly view honesty
- **What:** replace the hardcoded insights/adherence-by-meal in `Progress.tsx` with real aggregates: adherence by meal type (which slot fails most), weekday vs weekend delta, real "vs last week". Either write the dead `weekly_progress` table via a trigger or drop it and keep the client-side computation — one source of truth.

_Effort: ~2–3 weeks. Small migrations (optional slot-status), mostly product logic._

---

## Phase 3 — Proactive adherence (from mirror to coach)

Everything so far is reactive. Compliance is won *before* the meal.

### 3.1 "What should I eat now?"
- **What:** a pre-meal view (from the timeline, or a Home CTA near meal time): the upcoming template's required foods, allowed options (`options` JSONB), portions, and calorie band. One tap from "it's 12:40" to "here's lunch per plan".
- **Data:** all present in `meal_templates`. Pure UI.

### 3.2 Meal-time reminders
- **What:** notifications at each slot's `scheduled_time`: "Lunch per your plan: grilled chicken + rice + salad 🍗". After the cutoff with no log: "Log your lunch — 30s".
- **Infra:** requires push. In-app banners work today; web push is unreliable on iOS unless the PWA is installed; **native push via Capacitor is the robust path** — see [IOS_WIDGET_FEASIBILITY.md](./IOS_WIDGET_FEASIBILITY.md), which makes Capacitor a shared dependency of this phase, Challenges notifications, and the widget.

### 3.3 Surfaced swaps
- **What:** `analyze-meal` already returns `suggestedSwaps` — it's currently discarded by the UI. Show it on off-plan results ("next time: swap fries → sweet potato, +18 pts"), and in the pre-meal view ("no salmon? your plan allows: …").

### 3.4 Weekly AI coach summary
- **What:** a new edge function that feeds the week's `daily_progress` + `scoring_result`s to GPT-4o and returns 3 insights + 1 focus for next week, in the user's language. This is Bevel's per-domain AI summary, specialized for plan adherence. Optionally allow one follow-up question (chat-lite, cost-capped).
- **Cost note:** one call/user/week, text-only — negligible vs the per-meal Vision calls.

_Effort: 3.1 + 3.3 ≈ 1 week (UI only). 3.2 depends on the Capacitor decision. 3.4 ≈ 1 week._

---

## Phase 4 — Accountability & depth

### 4.1 Streaks + adherence calendar
- Month grid colored by day tier (the streak logic exists in `use-progress.ts`, broken by P0 #1; fix, then surface). Streak = consecutive days ≥ threshold with all slots resolved. Feeds Challenges and the iOS widget.

### 4.2 Macro & calorie tracking (opt-in depth)
- The schema already carries `calories_min/max` and `macros` JSONB on templates; `analyze-meal` can be extended to estimate per-meal calories/protein. Show plan-band vs estimate per meal and per day. This answers Bevel's "lacks granularity" criticism *within* the adherence frame — bands from the prescribed plan, not free-floating macro goals.

### 4.3 Nutritionist report (the "prove it" feature)
- Export/share a weekly or monthly adherence report: calendar, per-slot adherence, top deviations, photos optional. PDF download + share link (RLS-scoped, expiring). **This is the differentiator no generic tracker has** — the plan came from a professional; close the loop back to them. Later: a nutritionist-facing view (multi-client) is a plausible B2B revenue line.

### 4.4 Plan versioning
- Plans change every consult. Keep `nutrition_plans` immutable per version (deactivate + insert new), and, with the Phase 0 FK, historical scores stay attached to the plan they were scored against.

### 4.5 Multi-modal logging (Bevel parity, last on purpose)
- Text "describe meal" (cheap: send the description to `analyze-meal` instead of an image — same scoring path) → barcode (needs a food DB — licensing cost, defer) → voice. Photo-first remains the identity; text is the fallback that rescues missed logs.

---

## Explicit non-goals (for now)

- **CGM / wearable integration** — Bevel's moat, not our job. Adherence-to-plan doesn't need glucose data.
- **Licensed food database** (barcode search) — high cost, low adherence value; revisit at Phase 4.5.
- **Generic macro-goal tracking without a plan** — that's MyFitnessPal's crowded market; the prescribed plan is the moat.
- **Social feeds** — Challenges (see [FEATURE_CHALLENGES.md](./FEATURE_CHALLENGES.md)) covers motivation without a feed.

## Sequencing at a glance

| Phase | Theme | Depends on | Rough effort |
|-------|-------|-----------|--------------|
| 0 | Pipeline works | — | days |
| 1 | Trust the score | 0 | 1–2 wks |
| 2 | Day loop (slots, missed meals, summaries) | 0–1 | 2–3 wks |
| 3 | Proactive (pre-meal, reminders, swaps, coach) | 2; push→Capacitor | 2–3 wks |
| 4 | Accountability (calendar, macros, report, versioning) | 2 | incremental |
