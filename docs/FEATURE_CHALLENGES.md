# PlateCheck — Challenges & "75 Hard" Feature Spec

_A new "Challenges" area with 75 Hard as the launch challenge. Designed to reuse PlateCheck's existing meal-adherence engine — that integration is the differentiator no standalone 75 Hard tracker has._

## Why challenges fit PlateCheck

75 Hard's rule #1 is *"follow a diet with zero deviations"* — which is *exactly* what PlateCheck already measures. Every other 75 Hard app makes the user self-report "I followed my diet ✓" on the honor system. PlateCheck can **verify it from photos**: if all of today's logged meals score on-plan, the diet task auto-completes. That's the headline.

---

## 1. Navigation & entry point

### BottomNav changes
`src/components/BottomNav.tsx` currently renders a static `NAV_ITEMS` array (lines 13–19) with a hardcoded `centerIndex = 2` and a 2 + center + 2 layout.

**Recommendation:** generalize the layout, then add Challenges as a 6th item:

- Compute `centerIndex = NAV_ITEMS.findIndex(i => i.isCenter)` and split `leftItems`/`rightItems` around it instead of hardcoding `slice(0,2)` / `slice(3)`.
- New order: **Home, Plan, Log (center), Progress, Challenges (`Trophy` icon), Settings** → 2 left / 3 right. At 375 px, five non-center items at ~64 px each fit, tight but viable; shorten labels (`Desafios`→icon-only if needed).
- **Fallback** if 6 feels cramped after a device pass: keep 5 tabs and surface Challenges as (a) a persistent card on Home when a challenge is active + (b) an entry in Settings when not. Ship the tab; downgrade only if real-device testing says so.

### Routes
```
/challenges                → hub (catalog + active challenge card)
/challenges/:enrollmentId  → active challenge dashboard (75 Hard day view)
/challenges/:enrollmentId/history → day grid / restarts
```
All wrapped in `<ProtectedRoute>` in `App.tsx`. Challenges must NOT be available in test mode with mocks only — add fixtures to `test-data.ts` like every other feature (`isTestUser` branch in hooks).

---

## 2. Data model

Three new tables + one storage bucket (new migration; per-user RLS `auth.uid() = user_id` like existing tables — include UPDATE/DELETE policies, unlike the meal_slots mistake):

```sql
challenges (            -- catalog, seeded; user-created challenges later
  id uuid PK,
  slug text UNIQUE,             -- '75-hard', '75-soft'
  name text, description text,
  duration_days int,            -- 75
  rules jsonb                   -- task definitions, see below
)

challenge_enrollments (
  id uuid PK,
  user_id uuid FK,
  challenge_id uuid FK,
  status text CHECK (status IN ('active','failed','completed','abandoned')),
  started_at date,              -- local date of day 1
  timezone text,                -- IANA tz captured at enrollment (see §4)
  current_day int DEFAULT 1,
  restart_count int DEFAULT 0,
  failed_on_day int, failed_reason text,
  completed_at timestamptz,
  UNIQUE (user_id, challenge_id, status) WHERE status = 'active'  -- one active run per challenge
)

challenge_daily_logs (
  id uuid PK,
  enrollment_id uuid FK,
  user_id uuid FK,              -- denormalized for RLS
  day_number int,               -- 1..75
  date date,                    -- local date
  tasks jsonb,                  -- per-task state, see below
  all_complete boolean GENERATED/maintained,
  completed_at timestamptz,
  photo_path text,              -- progress photo
  UNIQUE (enrollment_id, day_number)
)
```

Storage: bucket `challenge-photos` (private, 5 MB, jpeg/png), per-user folder RLS — copy the `meal-photos` policy pattern from `20260116234626_storage_policies.sql`.

### `rules` JSONB — task definitions (75 Hard seed)

```jsonc
{
  "fail_policy": "restart",          // miss anything → day 1
  "tasks": [
    { "key": "diet",     "type": "meal_adherence", "label": "Follow your plan, no alcohol, no cheat meals",
      "config": { "min_meal_score": 70, "all_planned_meals_logged": true } },
    { "key": "water",    "type": "counter", "label": "Drink 3.8 L of water",
      "config": { "goal": 3800, "unit": "ml", "quick_add": [250, 500, 750] } },
    { "key": "workout1", "type": "activity", "label": "45-min workout",
      "config": { "min_minutes": 45 } },
    { "key": "workout2", "type": "activity", "label": "45-min workout — outdoors",
      "config": { "min_minutes": 45, "outdoor_required": true } },
    { "key": "reading",  "type": "counter", "label": "Read 10 pages of non-fiction",
      "config": { "goal": 10, "unit": "pages" } },
    { "key": "photo",    "type": "photo", "label": "Progress photo" }
  ]
}
```

Task *types* are generic (`meal_adherence`, `counter`, `activity`, `photo`, later `checkbox`) so a "75 Soft" variant or custom challenges are just different `rules` rows — no code change.

### `tasks` JSONB — daily state

```jsonc
{
  "diet":     { "done": true,  "auto": true, "meals_scored": 4, "min_score": 82 },
  "water":    { "done": false, "value": 2750 },
  "workout1": { "done": true,  "minutes": 50, "outdoor": false, "note": "gym push day" },
  "workout2": { "done": false },
  "reading":  { "done": true,  "value": 10, "book": "Atomic Habits" },
  "photo":    { "done": true }
}
```

---

## 3. The 75 Hard experience

### Official rules implemented (Andy Frisella)
1. Follow a diet, zero alcohol, zero cheat meals — **auto-verified** (below)
2. 3.8 L (1 gallon) water daily — counter with quick-add buttons
3. Two 45-min workouts, one outdoors — two entries, duration + indoor/outdoor toggle
4. 10 pages of non-fiction — pages counter (+ optional book title)
5. Daily progress photo — camera capture
Miss any task → restart at day 1. No pausing, no tweaking (per the official program).

### The killer integration: auto-verified diet task
- The `meal_adherence` task evaluates from real `meal_logs`: **all of the day's planned meal slots logged AND every logged meal scores ≥ 70** → task auto-completes with an "auto-verified from your photos ✓" badge.
- A meal below 70 doesn't instantly fail the day — it flags the diet task with "1 meal off-plan — day at risk", and the user can review/correct the analysis (the Phase 1 verify loop in [ROADMAP_ADHERENCE.md](./ROADMAP_ADHERENCE.md)). The task finalizes at day end.
- Alcohol: add an explicit "no alcohol today" confirmation folded into the diet task (AI can't reliably see it); a detected `off_plan` alcoholic item fails the task outright.
- **Dependency:** this requires Phase 0 fixes (real logging pipeline) and benefits from Phase 2 (slot/missed-meal detection). Ship Challenges after Phase 0 at minimum; degrade gracefully before Phase 2 by requiring "N meals logged, all ≥70" without slot awareness.

### Progress photo
Reuse `CameraView` (already used in `/log`) → upload to `challenge-photos` using the existing storage helper pattern (signed URLs — do not repeat the public-URL bug, see APP_REVIEW P0 #4). Day-grid gallery on the history screen; after day 75, an optional side-by-side day 1 vs day 75.

### Screens
1. **Challenges hub** (`/challenges`): active challenge card (ring "Day 23/75", tasks done today "4/6", tap → dashboard) + catalog cards (75 Hard, 75 Soft later) with rules + "Start" CTA and a candid warning about the restart rule.
2. **Daily dashboard** (`/challenges/:id`): big day ring; the 6 task rows, each interactive inline (water +250/+500 buttons, workout entry sheet, pages stepper, photo capture, diet task read-only with "view meals" link); footer streak strip of the last 7 days (✓/✗/today).
3. **History**: 75-cell grid colored complete/failed/pending; restart markers; photo gallery.
4. **Failure flow**: full-screen, honest but kind — "Day 41: water incomplete. 75 Hard rules: back to Day 1." Buttons: *Restart tomorrow* (creates next run, increments `restart_count`), *Not now* (enrollment → `abandoned`, data retained). Show what you keep: photos and history survive restarts.
5. **Completion (day 75)**: celebration screen, badge on profile, summary stats (restarts, avg meal score across the run, total water/pages), share image.

### Day evaluation mechanics
- **When is a day judged?** At local midnight (of `enrollment.timezone`). Tasks are editable until then; a day with any incomplete task at rollover → run fails (`status='failed'`, `failed_on_day`, `failed_reason`).
- **Who judges?** v1: client-side on app open — on load, compare `last evaluated day` vs today, evaluate any elapsed days, update enrollment. Deterministic and offline-tolerant, but a user who never reopens the app is never failed (acceptable: they see it on return). v2: a scheduled edge function (Supabase cron) evaluates all active enrollments hourly at each timezone's midnight — enables the "you failed / don't lose today" push.
- **Retroactive edits:** allowed only for *today*. Yesterday is sealed at rollover (matches the program's spirit; avoids gaming).
- **Multi-device:** state lives in Supabase; TanStack Query with `enrollmentId` keys; last-write-wins on the `tasks` JSONB is acceptable v1 (single-user data).

### Strict vs "75 Soft"
Default and launch = **strict** (that *is* 75 Hard; the restart threat is the product). But the same engine gets a `75-soft` catalog row later (1 workout, wine allowed on social occasions, miss a day → lose a day not the run: `fail_policy: "lose_day"`). Spec'd now so `fail_policy` is in the schema from day one; build later.

---

## 4. Day rollover & timezones

Learn from the existing timezone bug (APP_REVIEW P0 #7): challenge days are **local calendar days**.

- Capture IANA timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) at enrollment → `enrollments.timezone`.
- `challenge_daily_logs.date` is the local date; `day_number = (local_date − started_at) + 1`.
- Travel: the enrollment timezone stays fixed for the whole run (simple, consistent, no double-midnight exploits). Changing home timezone = settings option that only affects *future* days.
- The diet auto-verification must bucket `meal_logs` by the same local date — one more reason to fix the global day-boundary convention in Phase 0 before shipping this.

---

## 5. Notifications

The restart rule makes notifications existential for this feature — a forgotten glass of water at 23:50 kills 40 days of work. Tiered by infrastructure available:

### v1 — In-app only (ships with the feature, zero new infra)
- Badge/dot on the Challenges tab while tasks are pending today.
- Home banner when a challenge is active: "Day 23 — 2 tasks left" (this pairs with the Home timeline of roadmap Phase 2).
- "Day at risk" state (red) on the dashboard after 20:00 local with incomplete tasks.

### v2 — Web push (PWA)
- Add manifest + service worker + `vite-plugin-pwa` (none exist today), Web Push via a Supabase edge function + `pwa` subscriptions table.
- **iOS caveat:** web push only works if the user installs the PWA to the home screen (iOS 16.4+), and delivery is second-class. Fine for Android/desktop; not reliable enough to be the answer for the iOS audience.

### v3 — Native push via Capacitor (the real answer)
- Same wrapper needed for the iOS widget ([IOS_WIDGET_FEASIBILITY.md](./IOS_WIDGET_FEASIBILITY.md)) provides APNs/FCM push + **local scheduled notifications** (which need no server at all — ideal here since all triggers are local-time-based).

### Notification schedule (v2/v3)
| Time (local) | Condition | Message |
|---|---|---|
| 07:30 | day starts | "Day 23 of 75 💪 — here's today's checklist" |
| 12:30 | diet task pending & lunch slot passed | "Log your lunch — your diet task auto-completes from your photos" |
| 17:00 | < 60% water | "2.1 L to go — you're behind on water" |
| 20:00 | any task incomplete | "⚠️ Day at risk: outdoor workout + photo left. Don't restart at day 41." |
| 22:00 | any task incomplete | "Last call — 2h to midnight." |
| 00:05 | day failed (v3/server eval) | honest failure message + restart CTA |
| 00:05 | day completed | "Day 23 ✓ — 52 to go." |
All user-configurable (master toggle + quiet hours); the current Settings notifications toggle (dead UI) becomes real here.

---

## 6. Edge cases

- **Enrollment day:** starting mid-day is fine (day 1 = today) but warn after 18:00: "Starting now means completing everything before midnight — start tomorrow?"
- **Restart:** new run in the same enrollment (reset `current_day`, increment `restart_count`) keeping history readable; failed days stay queryable for the history grid.
- **Abandon vs fail:** distinct statuses; abandoning keeps data, allows re-enrollment later (new run, `restart_count` continues or resets — product call: continues, honesty over vanity).
- **No nutrition plan yet:** the diet task can't auto-verify without an active plan → enrollment gate: "75 Hard on PlateCheck needs your nutrition plan imported first" (drives the core feature, deliberate).
- **Day 75 completes at rollover**, not at last checkmark — the completion push at 00:05 of day 76 is the payoff moment.
- **Photos on restart:** kept across runs (the transformation record is the emotional core).
- **Offline day:** tasks logged locally via TanStack Query mutations queue? v1: require connectivity (consistent with the rest of the app); note as a future improvement.

## 7. Build order

1. Migration (3 tables + bucket + RLS) and seed the `75-hard` catalog row.
2. Hooks: `use-challenges.ts` (catalog, enrollment, daily log CRUD, day evaluation) + test-mode fixtures.
3. Screens: hub → dashboard (tasks inline) → history → failure/completion flows.
4. BottomNav generalization + `Trophy` tab + routes.
5. Diet auto-verification wired to `meal_logs` (after Phase 0 fixes land).
6. In-app notification states (v1).
7. Later, with Capacitor: local scheduled notifications (v3) + widget surface (challenge ring).
