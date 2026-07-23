# PlateCheck — Wellness Platform Evolution Roadmap

**Inspiration:** [athletedata.health](https://www.athletedata.health/) — an AI coach for endurance athletes that connects to the user's training/recovery platforms, analyzes the data daily, and proactively messages the user via Telegram/WhatsApp with plan adjustments.

**Goal:** evolve PlateCheck from a meal-photo adherence app into a proactive wellness coach that combines nutrition adherence (our existing moat) with recovery/sleep/training context from Apple Health.

**Relationship to existing docs:** this roadmap *extends* [ROADMAP_ADHERENCE.md](./ROADMAP_ADHERENCE.md) rather than replacing it. It revises one of its explicit non-goals ("CGM / wearable integration — Bevel's moat, not our job"): we still don't compete with Bevel on recovery analytics, but we *consume* basic wellness signals to make nutrition coaching context-aware. Phase 0 below is the same Phase 0 as in ROADMAP_ADHERENCE.md.

---

## How athletedata.health works (analysis)

The product inverts the usual flow: instead of the user opening an app and reading dashboards, the coach already has the data and reaches out first.

1. **Data aggregation layer** — OAuth connections to 22+ platforms (Garmin, Strava, WHOOP, Oura, TrainingPeaks, Apple Health, Withings, Hevy, Cronometer, MyFitnessPal, Clue/Flo…). Pulls training, recovery, sleep, HRV, nutrition, cycle data daily.
2. **Daily analysis engine** — a scheduled job crosses the data and detects signals: HRV drops, volume spikes, fatigue, missed sessions. Detection is almost certainly deterministic rules; the LLM is used for communication and planning, not for deciding *when* to act.
3. **Proactive messaging coach** — messages arrive via a **Telegram/WhatsApp bot** when the data warrants it. No native app, no push infrastructure, no app-store friction. The bot is also conversational ("Am I recovering enough?").
4. **Adaptive plan** — a rolling 14-day training plan that re-extends every Sunday, rebalances when a session is missed or recovery drops, and pushes structured workouts to Garmin/Apple Watch/COROS.
5. **MCP tier** — exposes the user's own data as an MCP server usable from ChatGPT/Claude ($9/mo); the full proactive coach is $39/mo ($299/yr).

**Transferable lessons:**

- The moat is not the LLM. It is (a) the data aggregation, (b) cheap proactivity via messaging, and (c) deterministic rules deciding *when* to speak + an LLM deciding *what* to say.
- PlateCheck already owns the piece athletedata doesn't have: **photo-based nutrition adherence against a prescribed plan**. The wellness evolution is additive, not a pivot.

---

## Phase 0 — Fix the foundation (prerequisite)

The real-user logging → scoring → progress pipeline is broken end-to-end; test mode masks it. See [APP_REVIEW.md](./APP_REVIEW.md) P0 bugs 1–7 (nonexistent `daily_adherence_score` column read by `use-progress.ts`, `status:"completed"` inserts that never fire the `daily_progress` trigger, public URLs of a private bucket sent to OpenAI Vision, unfiltered "today's meals", fabricated saved-meal results, inconsistent day boundaries).

Nothing below is worth building on top of a pipeline that doesn't record real scores. These are small, targeted fixes — do them first.

## Phase 1 — Proactive coach via Telegram

The cheapest, highest-leverage athletedata-style bet. Uses **only data PlateCheck already produces** — no native app, no push, no external integrations.

- **Bot linking:** a Telegram bot (free) linked to the user via deep-link (`t.me/<bot>?start=<one-time-code>`). New table `messaging_links` (`user_id`, `telegram_chat_id`, `linked_at`).
- **Daily job:** `pg_cron` (included in Supabase) invokes a new edge function (e.g. `daily-coach`) that reads the day's/week's `meal_logs` + `daily_progress` and applies deterministic trigger rules — e.g. "pre-workout snack missed 3 days in a row", "daily score dropped below 40", "no meals logged by 15:00".
- **Message generation:** when a rule fires, the LLM writes the message in the user's language (the i18n groundwork exists), with the plan + recent logs as context. Rules decide *when*; the model decides *what*.
- **Two-way chat:** the bot's webhook (another edge function) answers free-form questions ("what should I have for dinner?") with `meal_templates` + today's logs as context. This subsumes ROADMAP_ADHERENCE Phase 3.1/3.4 and gives them a delivery channel.

## Phase 2 — Wellness data ingestion (Apple Health–first)

Primary user context: Apple Health + Bevel, no WHOOP/Oura. So: no multi-wearable aggregator for now.

- **Schema:** `wellness_metrics` (`user_id`, `date`, `source`, `metric_type`, `value`, `raw` JSONB) as a generic time-series table, plus `ingest_tokens` (per-user token to authenticate the ingestion webhook).
- **Recommended path (zero native code):** the iOS app [Health Auto Export](https://help.healthyapps.dev/en/health-auto-export/automations/rest-api/) (~€5) POSTs Apple Health JSON (HRV, sleep, resting HR, workouts, steps — 150+ metrics) on a schedule to a new `ingest-health` edge function, authenticated by token header. This is a well-trodden self-hosted pattern. Known limitation: exports only run while the iPhone is unlocked — fine for a morning daily summary.
- **Bevel:** no public API (it's an active feature request on their board). Bevel's computed recovery scores are not accessible, but its *source* metrics (HRV, RHR, sleep from Apple Watch) all live in Apple Health, so Phase 3 computes its own readiness proxy. Watch their feedback board; if they ship an API/MCP, integrate there.
- **Native HealthKit via Capacitor** (direct read + background delivery) is the Phase 4 upgrade path, not a prerequisite — see [IOS_WIDGET_FEASIBILITY.md](./IOS_WIDGET_FEASIBILITY.md). Paid aggregators (Terra/Spike/Rook, ~$0.5–1/user/mo) only become relevant if users with Garmin/WHOOP/Oura show up.

## Phase 3 — Adaptive coaching (the differentiation)

Cross nutrition adherence with recovery context — the combination neither athletedata (training-only) nor Bevel (no prescribed-plan adherence) offers:

- **Readiness proxy:** a simple score from a rolling 14-day HRV/RHR/sleep baseline (the same class of computation Bevel does internally). Deterministic, explainable, stored in `wellness_metrics`.
- **Context-aware nudges:** "poor sleep + hard workout today → consider the higher-carb lunch option from your plan." Triggers extend the Phase 1 rules engine with wellness signals.
- **Plan adjustments:** LLM-suggested meal swaps validated against `meal_templates` (never free-form inventions), and a weekly plan that rebalances like athletedata's — if adherence slipped midweek, the coach adjusts emphasis for the remaining days.

## Phase 4 — Expansion options

- **Capacitor native app** — direct HealthKit read with background delivery, native push, iOS widget (per IOS_WIDGET_FEASIBILITY.md). Replaces Health Auto Export when scaling beyond personal/beta use.
- **MCP server** — expose the user's own nutrition + wellness data as an MCP server (athletedata's $9/mo tier is validation that people pay for this alone).
- **WhatsApp Business API** — paid, unlike Telegram; add only if the audience demands it.

---

## Cost notes

| Item | Cost |
|---|---|
| Telegram bot | Free |
| `pg_cron` | Included in Supabase |
| Health Auto Export | ~€5 one-time per user (fine for personal/beta; doesn't scale to consumers — that's what Phase 4 Capacitor is for) |
| WhatsApp Business API | Paid per conversation |
| Aggregators (Terra/Spike/Rook) | ~$0.5–1/user/mo — deferred until non-Apple wearable users exist |
| LLM calls | One daily-coach call/user/day + chat replies; cap chat turns per day to control cost |

## Sequencing at a glance

1. **Phase 0** — pipeline fixes (days). Prerequisite for everything.
2. **Phase 1** — Telegram coach on existing data. First visible "wellness platform" step, no new data sources.
3. **Phase 2** — Apple Health ingestion via Health Auto Export.
4. **Phase 3** — readiness proxy + context-aware nutrition coaching.
5. **Phase 4** — native app / MCP / WhatsApp, as demand justifies.
