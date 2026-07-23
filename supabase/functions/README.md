# PlateCheck Edge Functions

This directory contains Supabase Edge Functions for the PlateCheck app. All three are **live, real implementations backed by GPT-4o** — not mocks (see `docs/APP_REVIEW.md` for the full app review, which flags several older docs that still claimed otherwise).

The base URL and keys are project-specific — read them from your own `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) rather than hardcoding them in docs or committing them here.

## Functions Overview

### 1. `analyze-meal`

Analyzes a meal photo against the user's active nutrition plan (real-time GPT-4o Vision call) and returns a deterministic 0-100 adherence score plus feedback. Uses a service-role Supabase client to fetch the relevant `meal_templates` for the given meal type.

**Request Body:**
```json
{
  "imageUrl": "string (must be a signed URL — the meal-photos bucket is private)",
  "mealType": "breakfast" | "lunch" | "dinner" | "snack",
  "userId": "string",
  "planId": "string (optional)"
}
```

**Response:**
```json
{
  "score": 75,
  "detectedFoods": [
    { "name": "Eggs", "matched": true, "confidence": 0.95, "category": "Protein", "matchType": "required" }
  ],
  "missingRequired": ["Vegetables"],
  "feedback": "Good protein and whole grain choices...",
  "confidence": "high",
  "suggestedSwaps": [
    { "original": "Butter", "suggested": ["Avocado", "Olive oil"], "reason": "Lower saturated fat" }
  ]
}
```

Score formula (deterministic given the LLM's food classification):
`score = 100 − min(60, missingRequired.length × 20) − min(40, offPlanCount × 10)`

### 2. `parse-nutrition-plan`

Parses an uploaded nutrition plan document into meal templates. PDF text is extracted locally (via `unpdf`), DOCX via `docxml`, and images via GPT-4o Vision; extracted/translated text is then structured by a GPT-4o text call. Writes `plan_uploads`, `nutrition_plans` (inactive until confirmed), and `meal_templates` directly using a service-role client.

**Request Body:**
```json
{
  "fileUrl": "string (signed URL)",
  "userId": "string",
  "fileType": "pdf" | "image" | "text"
}
```

**Response:**
```json
{
  "planId": "uuid",
  "planName": "Balanced Nutrition Plan",
  "mealTemplates": [...],
  "confidence": "high",
  "warnings": []
}
```

### 3. `extract-ingredients`

Categorizes a list of meal descriptions into a shopping list (used by the "Esta Semana" → "Compras" flow). `gpt-4o-mini`, no DB writes.

### 4. ingest-health

Webhook receiver for the [Health Auto Export](https://github.com/Lybron/health-auto-export) iOS app. Unlike the other functions, this one does **not** use Supabase JWT auth (`verify_jwt = false` in `config.toml`) — Health Auto Export can't attach a JWT, so it authenticates via a per-user API key sent in the `x-api-key` header instead (generated in Settings → Health Sync, stored hashed in `health_ingest_tokens`).

Parses the metrics/workouts payload, upserts raw samples into `health_samples` (idempotent — safe to resend overlapping windows), and recomputes `health_daily` (aggregates plus recovery/sleep/strain scores) for every affected day using `supabase/functions/_shared/health-scoring.ts`.

**Endpoint:** `POST https://<your-project-ref>.supabase.co/functions/v1/ingest-health`

**Headers:** `x-api-key: <token from Settings>`

**Request Body:** the Health Auto Export "API Export" payload, e.g.:
```json
{
  "data": {
    "metrics": [
      { "name": "heart_rate_variability", "units": "ms", "data": [{ "date": "2026-07-11 05:47:00 +0100", "qty": 64.1 }] }
    ],
    "workouts": [
      { "name": "Outdoor Run", "start": "2026-07-11 18:10:00 +0100", "end": "2026-07-11 18:52:00 +0100" }
    ]
  }
}
```

**Response:**
```json
{ "samplesUpserted": 16, "daysRecomputed": 1, "dates": ["2026-07-11"] }
```

A checked-in fixture at `ingest-health/fixture.json` covers a duplicate point (overlapping resend) and a sleep session crossing midnight — useful for a local curl test:
```bash
curl -X POST http://localhost:54321/functions/v1/ingest-health \
  -H "x-api-key: YOUR_TOKEN" \
  -d @supabase/functions/ingest-health/fixture.json
```

## Development

### Local Testing

```bash
supabase functions serve analyze-meal
supabase functions serve parse-nutrition-plan
supabase functions serve extract-ingredients
supabase functions serve ingest-health
```

```bash
curl -X POST http://localhost:54321/functions/v1/analyze-meal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{
    "imageUrl": "https://example.com/meal.jpg",
    "mealType": "breakfast",
    "userId": "user-123"
  }'
```

### Deployment

```bash
supabase functions deploy                    # all functions
supabase functions deploy analyze-meal       # one function
```

### Environment Variables

1. Copy `.env.example` to `.env` for local reference.
2. Set the real secret in Supabase (not in a committed file):

```bash
supabase secrets set OPENAI_API_KEY=your_key_here
supabase secrets list
```

## Known gaps (see `docs/APP_REVIEW.md` for details and file:line references)

- CORS is `*` on all three functions — tighten to the production origin(s) before launch.
- `extract-ingredients` doesn't validate the shape of the LLM's JSON response (the other two use `response_format: json_object` + basic validation).
- No rate limiting, caching, or monitoring yet.

## Directory Structure

```
supabase/functions/
├── .env.example
├── README.md                    # This file
├── _shared/
│   ├── health-scoring.ts       # Pure scoring module shared with the frontend
│   └── health-scoring.test.ts
├── analyze-meal/
│   └── index.ts                # Meal analysis function
├── parse-nutrition-plan/
│   └── index.ts                # Plan parsing function
├── extract-ingredients/
│   └── index.ts                # Weekly meal plan → shopping list ingredients
└── ingest-health/
    ├── index.ts                 # Health Auto Export webhook receiver
    └── fixture.json             # Sample payload for local curl testing
```

## Notes

- All functions use the Deno runtime (not Node.js).
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by Supabase — don't set them yourself.
- CORS is configured for all origins (tighten for production).
- JWT authentication is enabled by default on all functions, except `ingest-health` (see above).
