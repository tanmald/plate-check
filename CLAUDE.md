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

Adherence scores (0-100) are classified into three tiers used consistently throughout the app:
- **High (≥70):** "On track" → success/green theme
- **Medium (40-69):** "Needs attention" → warning/yellow theme
- **Low (<40):** "Off plan" → destructive/red theme

Helper functions in `src/components/AdherenceScore.tsx`:
- `getScoreStatus(score)` - Returns tier classification
- `getScoreColor(score)` - Returns Tailwind color class
- `getScoreLabel(score)` - Returns user-friendly label

### Multi-Step Flows with State Management

Several routes implement complex multi-step flows:

**Log Flow** (`/log`):
1. Select meal type (breakfast/lunch/dinner/snack)
2. Capture/upload photo
3. Show loading state
4. Navigate to `/meal-result` with `mealType` in router state

**Plan Import Flow** (`/plan`):
1. Empty state → upload form
2. Importing state → OCR processing
3. Review state → confirm parsed meals
4. Active state → view current plan

**Onboarding Flow** (`/onboarding`):
1. Welcome → signup → photo upload → parsing → review → complete

Patterns: Use `useNavigate()` with state object: `navigate('/page', { state: { key: value } })` and `useLocation().state` to access.

### Routing Architecture

Router setup in `App.tsx` uses React Router v6 with protected routes:
- Unauthenticated: `/onboarding` only
- Authenticated: All other routes wrapped with `<ProtectedRoute>`
- `<ProtectedRoute>` checks `AuthContext` and redirects to onboarding if not authenticated

**Route List:**
- `/` - Home (daily dashboard with meal cards)
- `/log` - Meal logging flow
- `/meal-result` - AI analysis results
- `/plan` - Plan management
- `/progress` - Progress tracking (tabs: daily/weekly)
- `/settings` - User settings
- `/settings/profile` - Profile editing
- `/onboarding` - Multi-step onboarding
- `*` - 404 Not Found

## Project Structure

```
src/
├── pages/               # Route-level components (8 pages + NotFound)
│   ├── Home.tsx        # Daily dashboard
│   ├── Log.tsx         # 3-step meal logging flow
│   ├── MealResult.tsx  # AI analysis display
│   ├── Plan.tsx        # Plan management
│   ├── Progress.tsx    # Progress tracking with tabs
│   ├── Settings.tsx    # User settings
│   ├── EditProfile.tsx # Profile editing
│   ├── Onboarding.tsx  # Multi-step onboarding
│   └── NotFound.tsx    # 404 page
│
├── components/
│   ├── ui/             # 51 shadcn-ui components (auto-generated)
│   ├── AdherenceScore.tsx    # Score display + tier helpers
│   ├── BottomNav.tsx         # Fixed bottom navigation
│   ├── MealCard.tsx          # Meal display component
│   ├── WeeklyChart.tsx       # Recharts visualization
│   ├── ProtectedRoute.tsx    # Route guard wrapper
│   └── LogoutDialog.tsx      # Logout confirmation
│
├── hooks/
│   ├── use-mobile.tsx        # Viewport detection (375px breakpoint)
│   ├── use-meals.ts          # Fetch meal data
│   ├── use-nutrition-plan.ts # Fetch plan data
│   └── use-progress.ts       # Fetch progress/stats
│
├── contexts/
│   └── AuthContext.tsx       # Global auth state + test user logic
│
├── lib/
│   ├── utils.ts        # cn() utility for classname merging
│   ├── supabase.ts     # Supabase client singleton
│   └── test-data.ts    # Mock data (mockMeals, mockPlan, mockWeeklyData)
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

Supabase PostgreSQL tables:
- `user_profiles` - User information
- `nutrition_plans` - Uploaded plans
- `meal_templates` - Parsed meal templates
- `meal_logs` - Logged meals with AI analysis
- `daily_progress` - Daily adherence scores
- `weekly_progress` - Weekly aggregations

Migrations in `supabase/migrations/`

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

These are documented in `docs/DEVELOPMENT.md`:

- **Camera capture** - Simulated (not integrated with device camera API)
- **OCR plan parsing** - Mock implementation only
- **No automated tests** - Manual testing only
- **Test user auth bypass** - Disabled in production needed
- **localStorage sessions** - XSS vulnerability (should use httpOnly cookies)
- **Date navigation** - prev/next buttons not functional
- **No macro tracking** - Only adherence scores

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
