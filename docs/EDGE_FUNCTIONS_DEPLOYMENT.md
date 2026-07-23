# Edge Functions Deployment Status

**This file is a historical note, kept short on purpose.** For current endpoint contracts, request/response shapes, local testing, and deployment commands, see `supabase/functions/README.md` — that's the doc that gets updated when the functions change.

## History

The three edge functions (`analyze-meal`, `parse-nutrition-plan`, `extract-ingredients`) were first deployed on 2026-01-19 as **mock-data placeholders** to unblock frontend development. All three have since been replaced with real implementations backed by GPT-4o (see `docs/APP_REVIEW.md` for the full review, including the fact that some older docs/comments in this repo still incorrectly describe them as mocks).

## Security notes

- Never commit Supabase anon/publishable keys or the project ref alongside each other in docs — read them from your own `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) instead. An earlier version of this file did exactly that; if you're rotating keys as a result, do it via the Supabase dashboard.
- CORS is currently `*` on all three functions — restrict to production origin(s) before launch.
- All three functions run with `OPENAI_API_KEY` set via `supabase secrets set` (see `supabase/functions/README.md`), never committed.

## Production hardening still open

- Rate limiting
- Response caching
- Monitoring/logging
- Tightened CORS
