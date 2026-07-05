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

## Development

### Local Testing

```bash
supabase functions serve analyze-meal
supabase functions serve parse-nutrition-plan
supabase functions serve extract-ingredients
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
├── analyze-meal/
│   └── index.ts
├── parse-nutrition-plan/
│   └── index.ts
└── extract-ingredients/
    └── index.ts
```

## Notes

- All functions use the Deno runtime (not Node.js).
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by Supabase — don't set them yourself.
- JWT authentication is enabled by default on all functions.
