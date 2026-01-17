# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PlateCheck is a mobile wellness app (MVP) that helps users understand whether their daily meals align with a prescribed nutrition plan. It analyzes meal photos against parsed nutrition plans and returns adherence scores with explainable feedback.

**Important Context:**
- This is a wellness support tool, NOT a medical device
- Uses neutral language (on-plan/off-plan, matched/not matched)
- Emphasizes confidence-aware results and explicit uncertainty
- Currently MVP stage with mock data throughout (no backend API, OCR/NLP, or vision model integration)

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint the codebase
npm run lint

# Preview production build
npm run preview
```

**Note:** No testing framework is currently configured (no Jest, Vitest, or similar).

## Tech Stack

- **Framework:** Vite + React 18.3.1 + TypeScript 5.8.3
- **UI Library:** shadcn-ui (Radix UI components + Tailwind CSS)
- **Routing:** react-router-dom 6.30.1
- **State Management:** @tanstack/react-query 5.83.0
- **Forms:** react-hook-form 7.61.1 + zod 3.25.76
- **Build Tool:** Vite with SWC transpiler
- **Charts:** recharts 2.15.4
- **Icons:** lucide-react 0.462.0
- **Notifications:** sonner 1.7.4

## Project Architecture

### Directory Structure

```
src/
├── pages/              # Route-level components (8 routes)
│   ├── Home.tsx        # Daily dashboard
│   ├── Log.tsx         # Meal logging flow (3-step)
│   ├── MealResult.tsx  # Meal analysis results
│   ├── Plan.tsx        # Nutrition plan management
│   ├── Progress.tsx    # Daily/weekly tracking
│   ├── Settings.tsx    # User settings
│   ├── Onboarding.tsx  # Multi-step onboarding
│   └── NotFound.tsx    # 404 page
├── components/         # Reusable components
│   ├── ui/            # shadcn-ui components (51 components, auto-generated, customizable)
│   ├── AdherenceScore.tsx  # Circular progress indicator with score tiers
│   ├── BottomNav.tsx       # Fixed bottom navigation (5 tabs)
│   ├── MealCard.tsx        # Individual meal display
│   ├── NavLink.tsx         # Navigation helper
│   ├── LogoutDialog.tsx    # Logout confirmation
│   └── WeeklyChart.tsx     # Weekly tracking visualization
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx  # Mobile viewport detection
│   └── use-toast.ts    # Toast notification hook
├── lib/                # Utilities
│   └── utils.ts        # cn() helper for className merging
├── App.tsx             # Root component with routing
└── main.tsx            # Entry point
```

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:
- `@/*` maps to `./src/*`
- Example: `import { Button } from "@/components/ui/button"`

### Routes

- `/` - Home page (daily dashboard)
- `/log` - Meal logging flow (3 steps: select → capture → analyzing)
- `/meal-result` - Meal analysis results
- `/plan` - Nutrition plan management
- `/progress` - Progress tracking (daily/weekly tabs)
- `/settings` - User settings
- `/onboarding` - Multi-step onboarding
- `*` - 404 Not Found

### Data Models

**Meal Interface:**
```typescript
{
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
{
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

### Scoring System

Three-tier adherence scoring:
- **High (≥70):** "On track" - success/green
- **Medium (40-69):** "Needs attention" - warning/yellow
- **Low (<40):** "Off plan" - destructive/red

Helper functions in `AdherenceScore.tsx`: `getScoreStatus()`, `getScoreColor()`, `getScoreLabel()`

Breakpoint messages:
- ≥80 = "Great match!"
- ≥70 = "On track"
- ≥50 = "Needs attention"
- <50 = "Off plan"

## shadcn-ui Integration

Configuration in `components.json`:
- Style: default
- Base color: slate
- CSS variables enabled
- Components in `src/components/ui/`

**Adding new shadcn components:**
```bash
npx shadcn-ui@latest add [component-name]
```

Components are copied into the codebase (not installed as dependencies) and can be customized directly in `src/components/ui/`.

## Styling Conventions

- Uses Tailwind CSS utility classes
- Custom CSS variables defined in `src/index.css` for theming
- `cn()` utility from `lib/utils.ts` for conditional className merging
- Mobile-first responsive design
- Custom classes:
  - `card-shadow` - consistent card elevation
  - `safe-top` - safe area insets for mobile
  - Status-based styling: `text-success`, `text-warning`, `text-destructive`

## TypeScript Configuration

- Uses project references (`tsconfig.app.json`, `tsconfig.node.json`)
- Strict mode partially disabled for MVP rapid development:
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedLocals: false`
  - `noUnusedParameters: false`

## Multi-Step Flows

Several pages implement multi-step flows using local state with string literal union types:

**Log Flow:** `select` → `capture` → `analyzing` → navigates to `/meal-result`
- Passes `mealType` via router state

**Plan Import Flow:** `empty` → `importing` → `review` → `active`
- Uses `hasPlan` flag to conditionally show states

**Onboarding Flow:** `welcome` → `signup` → `upload` → `parsing` → `review` → `complete`

## Navigation Patterns

- Use `useNavigate()` from react-router-dom for programmatic navigation
- Pass state between pages using `navigate(path, { state: {...} })`
- Access passed state with `useLocation()` and `location.state`
- Example: Log page → MealResult page passes `mealType`

**BottomNav.tsx:**
- Fixed mobile bottom navigation with 5 tabs
- Navigation items: Home, Plan, Log (center/camera), Progress, Settings
- Center "Log" button is elevated and animated for emphasis

## Key Page Components

**Log.tsx** - Three-step meal logging:
1. `select` - Choose meal type
2. `capture` - Camera preview with tips
3. `analyzing` - Loading animation

**MealResult.tsx** - Analysis results:
- Adherence score with status
- Detected foods with match indicators (✓ matched, ⚠ not matched)
- AI feedback with explainable suggestions
- Suggested swaps for non-matching foods
- Confidence indicator (high/medium/low)

**Progress.tsx** - Tracking with tabs:
- Daily view: date navigator, day score, meals list, insights
- Weekly view: week navigator, chart, stats grid, meal breakdown
- Pending/unlogged meals shown with dashed borders

**Plan.tsx** - Plan management states:
- Empty: upload button with file type indicators
- Importing: loading animation
- Review: confirm parsed templates
- Active: collapsible meal templates with required/allowed foods

**Settings.tsx** - User preferences:
- User profile card
- Grouped settings: Account, Plan Management, Privacy & Data
- Toggle switches for notifications and dark mode
- Danger actions (delete data, replace plan) in red

## Current Limitations

**Mock Data:**
- All meal data, user profiles, and nutrition plans are mocked
- No backend API integration
- No actual OCR/NLP or vision model integration
- Meal logging simulates AI analysis with setTimeout

**Missing Features:**
- Actual file upload functionality
- Real authentication/authorization
- Database persistence
- API endpoints for plan parsing and meal analysis
- Camera integration for photo capture
- Date navigation (prev/next day/week buttons are non-functional)

## Development Guidelines

**When adding new features:**
1. Place route-level components in `src/pages/`
2. Place reusable components in `src/components/`
3. Use the `cn()` utility for dynamic className composition
4. Maintain the three-tier scoring system (≥70 high, 40-69 medium, <40 low)
5. Keep neutral, non-medical language
6. New routes must be added to both `App.tsx` and `BottomNav.tsx` (if navigation item)

**When working with UI components:**
- Check `src/components/ui/` before adding new shadcn components
- Customize existing components directly in the ui folder
- Use Tailwind's color tokens (`primary`, `secondary`, `success`, etc.)

**When modifying scoring logic:**
- Update `AdherenceScore.tsx` helper functions
- Maintain consistency across all score displays

**Page State Management:**
- Progress page uses tabs: `"daily" | "weekly"`
- Plan page uses view states for import flow
- Settings page uses local state for toggles
- Use `hasPlan` flag to conditionally show empty states
