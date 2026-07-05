# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:8080)
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint on all TypeScript files
npm run preview      # Preview production build locally
```

## Project Overview

**PlateCheck** is an AI-powered mobile wellness app that analyzes meal photos against personalized nutrition plans. It's a React 18 + TypeScript + Vite frontend with Supabase backend (PostgreSQL + Edge Functions).

Core features:
- Photo-based meal logging with AI analysis (GPT-4 Vision)
- Adherence scoring (0-100) with explainable feedback
- Nutrition plan import and tracking
- Daily/weekly progress visualization

## High-Level Architecture

### Dual-Mode Data System

The app operates in two distinct modes based on the authenticated email:

**Test Mode** (emails: `test@platecheck.app` or `*@test.platecheck.app`):
- Bypasses Supabase authentication
- Uses mock data from `src/lib/test-data.ts`
- No database calls
- Useful for development and demos

**Real User Mode** (any other email):
- Full Supabase authentication
- Database-backed data storage
- Real meal logs, plans, progress

See `src/contexts/AuthContext.tsx` for the authentication logic.

### Three-Tier Scoring System

Adherence scores (0-100) are classified into three tiers, with a single source of truth so labels and colors never disagree:
- **High (≥70):** success/green theme — labeled "On track", or "Great match!" at ≥90
- **Medium (40-69):** "Needs attention" → warning/yellow theme
- **Low (<40):** "Off plan" → destructive/red theme

Helper functions in `src/components/AdherenceScore.tsx` (import these rather than re-deriving thresholds locally):
- `getScoreStatus(score)` - Returns tier classification (`"high" | "medium" | "low"`)
- `getScoreColor(score)` - Returns Tailwind color class
- `getScoreLabel(score)` - Returns user-friendly label

### Multi-Step Flows with State Management

Several routes implement complex multi-step flows:

**Log Flow** (`/log`):
1. Select meal type (breakfast/lunch/dinner/snack)
2. Capture/upload photo
3. Show loading state
4. Navigate to `/meal-result` with `mealType` in router state

**Plan Import Flow** (`/plan`, "Meu Plano" tab), each state its own component (`src/components/Plan*State.tsx`):
1. `PlanEmptyState` → upload form
2. `PlanImportingState` → AI parsing in progress
3. `PlanReviewState` → confirm parsed meal templates
4. `PlanActiveState` → view/edit the current plan; "Replace Plan" re-enters the empty state without losing `hasPlan` elsewhere in the app

**Onboarding** (`/onboarding`, unauthenticated only): a single choice screen — Import a plan / Create one manually / Skip — not a multi-step signup flow. Actual signup/signin lives at `/auth`.

Patterns: Use `useNavigate()` with state object: `navigate('/page', { state: { key: value } })` and `useLocation().state` to access.

### Routing Architecture

Router setup in `App.tsx` uses React Router v6 with protected routes:
- Unauthenticated: `/landing`, `/auth`, `/auth/callback`, `/auth/reset-password`, `/onboarding`
- Authenticated: all other routes wrapped with `<ProtectedRoute>`
- `<ProtectedRoute>` checks `AuthContext` and redirects to **`/landing`** (not `/onboarding`) if not authenticated

**Route List:**
- `/landing` - Marketing page (redirects to `/` if already authed)
- `/auth` - Sign up / sign in / forgot password (`?mode=signin` jumps straight to sign-in)
- `/auth/callback` - Supabase email-confirmation callback
- `/auth/reset-password` - Password reset
- `/onboarding` - Import plan / create manually / skip (unauthenticated only)
- `/` - Home (daily dashboard with meal cards)
- `/log` - Meal logging flow
- `/meal-result` - AI analysis results
- `/plan` - Plan management (tabs: Meu Plano / Esta Semana / Compras)
- `/plan/template/:templateId` - Create (`new`) or edit a meal template
- `/progress` - Progress tracking (tabs: daily/weekly)
- `/settings` - User settings
- `/settings/profile` - Profile editing
- `*` - 404 Not Found

## Project Structure

```
src/
├── pages/               # Route-level components (13 pages + NotFound)
│   ├── Landing.tsx      # Marketing page
│   ├── Auth.tsx         # Sign up / sign in / forgot password
│   ├── AuthCallback.tsx # Supabase email-confirmation callback
│   ├── ResetPassword.tsx # Password reset
│   ├── Onboarding.tsx   # Import / create manually / skip (single screen)
│   ├── Home.tsx         # Daily dashboard
│   ├── Log.tsx          # 3-step meal logging flow
│   ├── MealResult.tsx   # AI analysis display (real data via mealLogId, or test-mode fixture)
│   ├── Plan.tsx         # Plan management shell (tabs + 4 view-states)
│   ├── EditMealTemplate.tsx # Create/edit a single meal template
│   ├── Progress.tsx     # Progress tracking with tabs
│   ├── Settings.tsx     # User settings
│   ├── EditProfile.tsx  # Profile editing
│   └── NotFound.tsx     # 404 page
│
├── components/
│   ├── ui/                   # shadcn-ui components (auto-generated)
│   ├── AdherenceScore.tsx    # Score display + canonical tier helpers (see Three-Tier Scoring System)
│   ├── BottomNav.tsx         # Fixed bottom navigation
│   ├── MealCard.tsx          # Meal display component
│   ├── WeeklyChart.tsx       # Weekly bar chart
│   ├── ProtectedRoute.tsx    # Route guard wrapper (redirects to /landing)
│   ├── LogoutDialog.tsx      # Logout confirmation
│   ├── PlanEmptyState.tsx    # Plan tab: no plan yet
│   ├── PlanImportingState.tsx # Plan tab: AI parsing in progress
│   ├── PlanReviewState.tsx   # Plan tab: confirm parsed templates
│   ├── PlanActiveState.tsx   # Plan tab: active plan view
│   ├── DailyTargetsCard.tsx  # Calories/protein/meals derived from the plan's templates
│   ├── MealTemplateCard.tsx  # Single template display (active plan)
│   ├── WeeklyPlanner.tsx     # "Esta Semana" tab
│   └── ShoppingListView.tsx  # "Compras" tab
│
├── hooks/
│   ├── use-mobile.tsx        # Viewport detection (375px breakpoint)
│   ├── use-meals.ts          # Fetch/create meal logs, per-meal detail
│   ├── use-nutrition-plan.ts # Fetch/create plans + template-derived helpers (getLoggableMealCount, getUnloggedTemplates, computeDailyTargets)
│   └── use-progress.ts       # Daily/weekly progress, per-meal-type adherence, previous-week average
│
├── contexts/
│   └── AuthContext.tsx       # Global auth state + test user logic
│
├── lib/
│   ├── utils.ts        # cn() utility for classname merging
│   ├── supabase.ts     # Supabase client singleton
│   ├── scoring.ts       # Deterministic food-breakdown scoring (client-side re-score after edits)
│   └── test-data.ts    # Mock data (mockMeals, mockPlan, mockWeeklyData, ...)
│
├── types/
│   ├── database.types.ts     # Supabase auto-generated types
│   └── (custom types)        # App-specific interfaces
│
├── App.tsx             # Root component with routing setup
└── main.tsx            # React 18 root mount point
```

## Key Development Concepts

### Data Models

**Meal Interface:**
```typescript
interface Meal {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  time: string;
  score: number;           // 0-100 adherence score
  imageUrl?: string;
  foods: string[];
  feedback?: string;
  confidence?: "high" | "medium" | "low";
}
```

**MealTemplate (from Nutrition Plan):**
```typescript
interface MealTemplate {
  id: string;
  type: string;
  icon: string;
  name: string;
  requiredFoods: string[];
  allowedFoods: string[];
  calories: string;
  protein: string;
}
```

### Data Fetching with TanStack Query

Standard pattern with test user detection:

```typescript
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { isTestUser } from '@/lib/test-data';

const MyComponent = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['meals', user?.id],
    queryFn: async () => {
      if (isTestUser(user?.email)) {
        return mockMeals;  // From test-data.ts
      }

      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
```

### Styling & Theme

- **Tailwind CSS** with CSS variables (configured in `components.json`)
- **shadcn-ui** components (51 total, copied into `src/components/ui/`)
- **Mobile-first** responsive design (375px minimum viewport)
- **Custom CSS classes:**
  - `card-shadow` - Consistent card elevation
  - `safe-top` - Safe area insets for mobile
  - `text-success`, `text-warning`, `text-destructive` - Status colors

Add new shadcn components: `npx shadcn-ui@latest add [component-name]`

### TypeScript Configuration

Configured in `tsconfig.json` with path aliases:
- `@/*` → `./src/*`
- Strict mode **partially disabled** for rapid MVP development:
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedLocals: false`
- Enable these in future refactoring phases

### ESLint Rules

Configuration in `eslint.config.js`:
- Extends TypeScript recommended rules
- Enforces React hooks rules
- Warns on unused exports (react-refresh)
- `@typescript-eslint/no-unused-vars` disabled (temporary for MVP)

## Database Schema

Supabase PostgreSQL tables actually in use:
- `user_profiles` - User information
- `nutrition_plans` - Uploaded plans (one `is_active` plan per user)
- `meal_templates` - Parsed meal templates (the live plan model — `meal_slots`/`meal_options`/`meal_constraints`/`meal_references` also exist in the schema but nothing reads or writes them; treat as dead)
- `meal_logs` - Logged meals with AI analysis (`status` must reach `'scored'` with `scored_at` set for the `update_daily_progress` trigger to fire)
- `daily_progress` - Daily adherence aggregates, written by the `update_daily_progress` DB trigger
- `weekly_progress` - Exists but has no writer; the weekly view is computed client-side in `use-progress.ts` from `daily_progress` instead
- `weekly_meal_plans` / `weekly_plan_entries` / `shopping_lists` / `shopping_list_items` - Back the "Esta Semana"/"Compras" tabs

Migrations in `supabase/migrations/`. `src/types/database.types.ts` is generated from these — regenerate it (`supabase gen types typescript`) whenever a migration changes a table this app reads from.

## Development Patterns

### Adding a New Page/Route

1. Create component in `src/pages/NewPage.tsx`
2. Add route to `App.tsx`:
   ```typescript
   <Route path="/new-page" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
   ```
3. If it's a primary nav item, update `src/components/BottomNav.tsx`
4. Use `useNavigate()` from react-router-dom for navigation

### Adding a New Component

1. Create in `src/components/MyComponent.tsx`
2. Import path alias: `import { Button } from "@/components/ui/button"`
3. Use `cn()` for conditional classes: `cn("base-class", isActive && "active-class")`

### Adding a Custom Hook

1. Create in `src/hooks/use-my-hook.ts` (kebab-case naming)
2. Export from hook file
3. Use in components: `import { useMyHook } from "@/hooks/use-my-hook"`

### Handling Test vs Real Data

Always check `isTestUser()` before database calls:

```typescript
import { isTestUser } from '@/lib/test-data';

if (isTestUser(user?.email)) {
  return mockData;  // Use mock
}

// Query real database
const { data } = await supabase.from('table').select('*');
```

## Known Limitations (MVP)

See `docs/APP_REVIEW.md` for the full list with file:line references. Highlights:

- **Camera capture** - Simulated (not integrated with device camera API)
- **Plan parsing** - Real GPT-4o (`parse-nutrition-plan` edge function), not a mock — despite what older docs say
- **No automated tests** - Manual testing only
- **Test user auth bypass** - Must be gated behind `import.meta.env.DEV`; verify this is in place before deploying
- **localStorage sessions** - XSS vulnerability (should use httpOnly cookies)
- **Date navigation** - prev/next buttons in Progress are still not functional
- **No macro tracking beyond daily targets** - `DailyTargetsCard` shows calories/protein derived from the plan's templates, but there's no per-meal macro logging

## Common Debugging

**Blank page on load:**
- Check browser console for errors
- Verify `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Check that Supabase project is accessible

**Authentication loops:**
- Verify Supabase email provider is enabled
- Check redirect URL matches `localhost:8080`
- Test with `test@platecheck.app` to bypass auth

**Data not loading:**
- Check Network tab for failed requests
- Verify user is authenticated in DevTools
- Check TanStack Query DevTools cache
- Verify database RLS policies allow user access

**Type errors:**
- Run `npm run lint` to catch ESLint issues
- Check `src/types/database.types.ts` for schema alignment
- TypeScript strict mode is partially disabled; enable gradually as codebase matures

## Useful Tools & Resources

- **Supabase Studio** - Database schema and data inspection
- **React DevTools** - Component tree inspection
- **Vite DevTools** - Build and module analysis
- **TanStack Query DevTools** - Cache inspection (if installed)
- **Vercel Analytics** - Performance monitoring (already integrated)
