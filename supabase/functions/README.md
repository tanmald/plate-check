# PlateCheck Edge Functions

This directory contains Supabase Edge Functions for the PlateCheck app.

## Deployed Functions

**Base URL:** `https://phnygsbbvcixnxwrbdhx.supabase.co/functions/v1`

Both functions are deployed and active with JWT authentication enabled.

## Functions Overview

### 1. analyze-meal

Analyzes meal photos against user nutrition plans and returns adherence scores with feedback.

**Endpoint:** `POST https://phnygsbbvcixnxwrbdhx.supabase.co/functions/v1/analyze-meal`

**Request Body:**
```json
{
  "imageUrl": "string",
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
    {
      "name": "Eggs",
      "matched": true,
      "confidence": 0.95
    }
  ],
  "feedback": "Good protein and whole grain choices...",
  "confidence": "high",
  "suggestedSwaps": [
    {
      "original": "Butter",
      "suggested": ["Avocado", "Olive oil"]
    }
  ]
}
```

### 2. parse-nutrition-plan

Parses uploaded nutrition plan documents (PDF, images, text) using OCR/NLP.

**Endpoint:** `POST https://phnygsbbvcixnxwrbdhx.supabase.co/functions/v1/parse-nutrition-plan`

**Request Body:**
```json
{
  "fileUrl": "string",
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

## Development

### Local Testing

Run a function locally:
```bash
supabase functions serve analyze-meal
supabase functions serve parse-nutrition-plan
```

Test with curl (local):
```bash
curl -X POST http://localhost:54321/functions/v1/analyze-meal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "imageUrl": "https://example.com/meal.jpg",
    "mealType": "breakfast",
    "userId": "user-123"
  }'
```

Test with curl (production):
```bash
curl -X POST https://phnygsbbvcixnxwrbdhx.supabase.co/functions/v1/analyze-meal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "imageUrl": "https://example.com/meal.jpg",
    "mealType": "breakfast",
    "userId": "user-123"
  }'
```

### Deployment

Deploy all functions:
```bash
supabase functions deploy
```

Deploy a specific function:
```bash
supabase functions deploy analyze-meal
supabase functions deploy parse-nutrition-plan
```

### Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your API keys
3. Set secrets in Supabase:

```bash
supabase secrets set VISION_API_KEY=your_key_here
supabase secrets set OCR_API_KEY=your_key_here
supabase secrets set OPENAI_API_KEY=your_key_here
```

List all secrets:
```bash
supabase secrets list
```

## Deployment Status

**Both functions are deployed and active:**
- ✅ `analyze-meal` - Version 1 (ACTIVE)
- ✅ `parse-nutrition-plan` - Version 1 (ACTIVE)
- ✅ JWT authentication enabled
- ✅ CORS configured

## Integration Status

### Current: Mock Data Phase (Deployed)
- ✅ Basic function structure created
- ✅ TypeScript interfaces defined
- ✅ CORS handling implemented
- ✅ Error handling implemented
- ✅ Deployed to production
- ⏳ Returns mock responses (ready for API integration)

### Next: API Integration Phase
- ⏳ Integrate vision model API (analyze-meal)
- ⏳ Integrate OCR/NLP API (parse-nutrition-plan)
- ⏳ Add database queries for user plans
- ⏳ Implement scoring algorithm
- ⏳ Add comprehensive error handling
- ⏳ Add request validation

### Future: Production Phase
- ⏳ Add rate limiting
- ⏳ Add monitoring/logging
- ⏳ Add caching layer
- ⏳ Performance optimization
- ⏳ Add comprehensive tests

## Directory Structure

```
supabase/functions/
├── .env.example                 # Environment variables template
├── README.md                    # This file
├── analyze-meal/
│   └── index.ts                # Meal analysis function
└── parse-nutrition-plan/
    └── index.ts                # Plan parsing function
```

## Notes

- All functions use Deno runtime (not Node.js)
- Environment variables are auto-injected by Supabase
- CORS is configured for all origins (tighten for production)
- JWT authentication is enabled by default
