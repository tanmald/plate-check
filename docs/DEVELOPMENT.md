# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Add your Supabase credentials

# Start development server
npm run dev  # Runs on http://localhost:8080

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── pages/              # Route-level components (10 pages)
│   ├── Home.tsx        # Daily dashboard
│   ├── Log.tsx         # Meal logging (3-step flow)
│   ├── MealResult.tsx  # Meal analysis results
│   ├── Plan.tsx        # Nutrition plan management
│   ├── Progress.tsx    # Daily/weekly tracking
│   ├── Settings.tsx    # User settings
│   ├── Onboarding.tsx  # Multi-step onboarding
│   ├── EditProfile.tsx # Profile editing
│   └── NotFound.tsx    # 404 page
├── components/         # Reusable components
│   ├── ui/            # shadcn-ui components (51 auto-generated)
│   ├── AdherenceScore.tsx  # Score display with tiers
│   ├── BottomNav.tsx       # Fixed bottom navigation
│   ├── MealCard.tsx        # Meal display component
│   ├── WeeklyChart.tsx     # Progress visualization
│   └── LogoutDialog.tsx    # Logout confirmation
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx      # Mobile viewport detection
│   ├── use-toast.ts        # Toast notifications
│   ├── use-meals.ts        # Meal data fetching
│   ├── use-nutrition-plan.ts  # Plan data fetching
│   └── use-progress.ts     # Progress/stats fetching
├── contexts/           # React contexts
│   └── AuthContext.tsx     # Authentication state
├── lib/                # Utilities
│   ├── utils.ts        # cn() helper for className merging
│   ├── supabase.ts     # Supabase client
│   └── test-data.ts    # Mock data for test users
├── types/              # TypeScript type definitions
├── App.tsx             # Root component with routing
└── main.tsx            # Entry point
```

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:
- `@/*` maps to `./src/*`
- Example: `import { Button } from "@/components/ui/button"`

## Architecture Overview

### Dual-Mode Data System

PlateCheck supports two modes:

**Test User Mode** (`test@platecheck.app` or `*@test.platecheck.app`):
- Bypasses authentication
- Uses mock data from `src/lib/test-data.ts`
- No database calls
- Perfect for demos and development

**Real User Mode** (any other email):
- Full Supabase authentication
- Database-backed data storage
- Real meal logs, plans, and progress

### Three-Tier Scoring System

Adherence scores (0-100) are classified into three tiers:

- **High (≥70):** "On track" - success/green theme
- **Medium (40-69):** "Needs attention" - warning/yellow theme
- **Low (<40):** "Off plan" - destructive/red theme

Helper functions in `AdherenceScore.tsx`:
- `getScoreStatus()` - Returns tier classification
- `getScoreColor()` - Returns color theme
- `getScoreLabel()` - Returns user-friendly label

### Multi-Step Flows

Several pages implement multi-step flows with state management:

**Log Flow** (`Log.tsx`): `select` → `capture` → `analyzing` → navigate to `/meal-result`
- Passes `mealType` via router state

**Plan Import Flow** (`Plan.tsx`): `empty` → `importing` → `review` → `active`
- Uses `hasPlan` flag for conditional rendering

**Onboarding Flow** (`Onboarding.tsx`): `welcome` → `signup` → `upload` → `parsing` → `review` → `complete`

## Key Concepts

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
}
```

**Meal Template (from Plan):**
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

### Navigation Patterns

Use `useNavigate()` and `useLocation()` from react-router-dom:

```typescript
import { useNavigate, useLocation } from 'react-router-dom';

// Pass state between pages
const navigate = useNavigate();
navigate('/meal-result', { state: { mealType: 'breakfast' } });

// Access passed state
const location = useLocation();
const { mealType } = location.state;
```

### Routes

- `/` - Home (daily dashboard)
- `/log` - Meal logging flow
- `/meal-result` - Analysis results
- `/plan` - Plan management
- `/progress` - Progress tracking (tabs: daily/weekly)
- `/settings` - User settings
- `/edit-profile` - Profile editing
- `/onboarding` - Multi-step onboarding
- `*` - 404 Not Found

## Development Workflow

### Adding New Features

1. **Route-level components** → `src/pages/`
2. **Reusable components** → `src/components/`
3. **Custom hooks** → `src/hooks/`
4. **Update routing** in `App.tsx`
5. **Update navigation** in `BottomNav.tsx` (if needed)

### Styling Conventions

- Uses **Tailwind CSS** utility classes
- Custom CSS variables in `src/index.css` for theming
- `cn()` utility from `lib/utils.ts` for conditional className merging
- Mobile-first responsive design
- Custom classes:
  - `card-shadow` - Consistent card elevation
  - `safe-top` - Safe area insets for mobile
  - Status-based: `text-success`, `text-warning`, `text-destructive`

### shadcn-ui Integration

Configuration in `components.json`:
- Style: default
- Base color: slate
- CSS variables enabled
- Components in `src/components/ui/`

**Adding new components:**
```bash
npx shadcn-ui@latest add [component-name]
```

Components are copied into the codebase (not npm dependencies) and can be customized directly.

### TypeScript Configuration

Uses project references (`tsconfig.app.json`, `tsconfig.node.json`):
- Strict mode **partially disabled** for MVP rapid development
- `noImplicitAny: false`
- `strictNullChecks: false`
- Path aliases enabled (`@/*`)

## Data Fetching

### Using TanStack Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { isTestUser } from '@/lib/test-data';

const { data: meals, isLoading } = useQuery({
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
```

### Mock Data for Test Users

Located in `src/lib/test-data.ts`:
- `mockMeals` - 3 pre-logged meals
- `mockPlan` - Sample nutrition plan with 4 templates
- `mockWeeklyData` - 7 days of progress data
- `mockDailyStats` - Sample adherence scores

## Testing

**Current Status:** No automated testing framework configured

**Planned:** Vitest + Testing Library integration

**Manual Testing:**
1. Use test user (`test@platecheck.app`) for quick iteration
2. Test real user flow with personal email
3. Check mobile viewport responsiveness (375px, 428px)
4. Verify multi-step flows complete successfully

## Debugging

### Common Issues

**Blank page:**
- Check browser console for errors
- Verify environment variables are set
- Check Supabase URL and key are correct

**Authentication not working:**
- Verify Supabase dashboard configuration
- Check redirect URLs match localhost:8080
- Ensure email provider is enabled

**Data not loading:**
- Check network tab for failed requests
- Verify user is authenticated
- Check TanStack Query DevTools (if installed)

### Development Tools

- **React DevTools** - Component inspection
- **TanStack Query DevTools** - Cache inspection
- **Supabase Studio** - Database inspection
- **Vite DevTools** - Build analysis

## Code Conventions

### General Principles

- **Mobile-first** responsive design
- **Three-tier scoring** consistency across all displays
- **Neutral language** (on-plan/off-plan, matched/not matched)
- **Confidence-aware** results (high/medium/low confidence indicators)
- **No emojis** unless user explicitly requests

### Component Patterns

- Prefer functional components with hooks
- Use TypeScript for type safety
- Extract reusable logic into custom hooks
- Keep components focused and single-purpose

### Naming Conventions

- Components: PascalCase (`MealCard.tsx`)
- Hooks: camelCase with `use` prefix (`use-meals.ts`)
- Utilities: camelCase (`utils.ts`)
- Types: PascalCase (`Meal`, `MealTemplate`)

## Database Schema

PlateCheck uses Supabase PostgreSQL with these tables:

- `user_profiles` - User profile information
- `nutrition_plans` - Uploaded nutrition plans
- `meal_templates` - Meal templates from plans
- `meal_logs` - Logged meals with AI analysis
- `daily_progress` - Daily adherence scores
- `weekly_progress` - Weekly aggregations (computed)

See `/supabase/migrations/` for full schema.

## Known Limitations (MVP)

- **Camera capture** simulated (not integrated with device camera API)
- **OCR plan parsing** uses mock implementation
- **No automated tests** configured yet
- **Test user auth bypass** in production (should be disabled)
- **localStorage sessions** (XSS vulnerability - should use httpOnly cookies)
- **Date navigation** not functional (prev/next buttons)
- **No macro tracking** implemented yet

## Next Steps

- [ ] Add Vitest + Testing Library
- [ ] Implement real camera integration
- [ ] Production OCR plan parsing
- [ ] Remove test user bypass in production
- [ ] Migrate to httpOnly cookies
- [ ] Add macro nutrient tracking
- [ ] Implement date navigation

---

**Questions?** Check the main [README](../README.md) or [CLAUDE.md](../.github/CLAUDE.md) for AI-specific guidance.
