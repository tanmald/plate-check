# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

PlateCheck is a mobile wellness app (MVP) that helps users understand whether their daily meals align with a prescribed nutrition plan. It analyzes meal photos against parsed nutrition plans and returns adherence scores with explainable feedback.

**Key Features:**
- Upload and parse nutrition plans (PDF, Word, image) using OCR + NLP
- Photo-based meal logging with vision model detection
- Food matching and adherence scoring (0-100)
- Explainable feedback with confidence indicators
- Daily and weekly adherence tracking

**Important Context:**
- This is a wellness support tool, NOT a medical device
- Uses neutral language (on-plan/off-plan, matched/not matched)
- Emphasizes confidence-aware results and explicit uncertainty
- Currently MVP stage with mock data throughout

## Tech Stack

- **Framework:** Vite + React + TypeScript
- **UI Library:** shadcn-ui (Radix UI components)
- **Styling:** Tailwind CSS
- **Routing:** react-router-dom
- **State Management:** @tanstack/react-query
- **Forms:** react-hook-form + zod
- **Build Tool:** Vite with SWC

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

## Dependencies

- **@vercel/speed-insights** - Performance monitoring integrated in production builds

## Project Architecture

### Directory Structure

```
src/
├── components/         # Reusable components
│   ├── ui/            # shadcn-ui components (auto-generated)
│   ├── AdherenceScore.tsx
│   ├── BottomNav.tsx
│   ├── MealCard.tsx
│   ├── NavLink.tsx
│   └── WeeklyChart.tsx
├── pages/             # Top-level route components
│   ├── Home.tsx       # Daily dashboard
│   ├── Log.tsx        # Meal logging flow
│   ├── MealResult.tsx # Meal analysis results
│   ├── Plan.tsx       # Nutrition plan management
│   ├── Progress.tsx   # Daily/weekly tracking
│   ├── Settings.tsx   # User settings
│   ├── Onboarding.tsx
│   └── NotFound.tsx
├── hooks/             # Custom React hooks
├── lib/               # Utilities
│   └── utils.ts       # cn() helper for className merging
├── App.tsx            # Root component with routing
└── main.tsx           # Entry point
```

### Path Aliases

The project uses TypeScript path aliases configured in `tsconfig.json`:
- `@/*` maps to `./src/*`
- Example: `import { Button } from "@/components/ui/button"`

### Routes

- `/` - Home page (daily dashboard with overview)
- `/log` - Meal logging flow (3 steps: select type → capture → analyzing)
- `/meal-result` - Meal analysis results page
- `/plan` - Nutrition plan management and templates
- `/progress` - Progress tracking (daily/weekly views with tabs)
- `/settings` - User settings and preferences
- `/onboarding` - Multi-step onboarding flow
- `*` - 404 Not Found page

### Key Components

**AdherenceScore.tsx**
- Circular progress indicator for meal adherence scores
- Three score tiers: high (≥70), medium (40-69), low (<40)
- Maps to colors: success (green), warning (yellow), destructive (red)
- Exports helper functions: `getScoreStatus()`, `getScoreColor()`, `getScoreLabel()`

**MealCard.tsx**
- Displays individual meal with score, time, foods, and feedback
- Uses meal type icons: 🌅 breakfast, ☀️ lunch, 🌙 dinner, 🍎 snack
- Accepts `meal` prop with interface defining meal structure

**BottomNav.tsx**
- Fixed mobile bottom navigation with 5 tabs
- Navigation items: Home, Plan, Log (center/camera), Progress, Settings
- Center "Log" button is elevated and animated for emphasis
- Uses react-router-dom NavLink for active state management

### Data Models

**Meal Interface** (from `MealCard.tsx`):
```typescript
{
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  time: string;
  score: number;
  imageUrl?: string;
  foods: string[];
  feedback?: string;
}
```

**Meal Template** (from `Plan.tsx`):
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

## shadcn-ui Integration

This project uses shadcn-ui components. Configuration in `components.json`:
- Style: default
- Base color: slate
- CSS variables enabled
- No prefix
- Components are in `src/components/ui/`

**Adding new shadcn components:**
```bash
npx shadcn-ui@latest add [component-name]
```

Components are copied into the codebase (not installed as dependencies) and can be customized directly.

## Styling Conventions

- Uses Tailwind CSS utility classes
- Custom CSS variables defined in `src/index.css` for theming
- `cn()` utility from `lib/utils.ts` for conditional className merging
- Mobile-first responsive design
- Custom classes used in components:
  - `card-shadow` - consistent card elevation
  - `safe-top` - safe area insets for mobile
  - Status-based styling: `text-success`, `text-warning`, `text-destructive`

## TypeScript Configuration

- Uses project references (`tsconfig.app.json`, `tsconfig.node.json`)
- Strict mode partially disabled:
  - `noImplicitAny: false`
  - `strictNullChecks: false`
  - `noUnusedLocals: false`
  - `noUnusedParameters: false`
- This is intentional for MVP rapid development

### Key Pages

**Log.tsx** (Meal Logging Flow)
- Three-step process:
  1. `select` - Choose meal type (breakfast/lunch/dinner/snack)
  2. `capture` - Camera preview with photo tips
  3. `analyzing` - Loading state with animation
- Navigates to `/meal-result` when analysis completes
- Passes `mealType` via router state

**MealResult.tsx** (Analysis Results)
- Displays adherence score with status (on plan/needs attention/off plan)
- Shows detected foods with match indicators (✓ matched, ⚠ not matched)
- AI feedback section with explainable suggestions
- "Suggested Swaps" for non-matching foods
- Confidence indicator (high/medium/low)
- Actions: Save Meal, Retake Photo

**Progress.tsx** (Tracking)
- Tab toggle: Daily Summary / Weekly View
- Daily view: date navigator, day score, meals list, insights
- Weekly view: week navigator, chart, stats grid, meal breakdown
- Shows pending/unlogged meals with dashed borders

**Plan.tsx** (Plan Management)
- Four view states: `empty`, `importing`, `review`, `active`
- Empty state: upload button with file type indicators
- Importing: loading animation
- Review: confirm parsed templates before activation
- Active: collapsible meal templates with required/allowed foods

**Settings.tsx**
- User profile card
- Grouped settings: Account, Plan Management, Privacy & Data
- Toggle switches for notifications and dark mode
- Danger actions (delete data, replace plan) styled in red
- App version and wellness disclaimer

## Current State & Limitations

**Mock Data:**
- All meal data, user profiles, and nutrition plans are currently mocked
- No backend API integration yet
- No actual OCR/NLP or vision model integration
- Meal logging flow simulates AI analysis with setTimeout

**Missing Features:**
- Actual file upload functionality
- Real authentication/authorization
- Database persistence
- API endpoints for plan parsing and meal analysis
- Camera integration for photo capture
- Real-time notifications
- Date navigation (prev/next day/week buttons are non-functional)

## Development Guidelines

**When adding new features:**
1. Place route-level components in `src/pages/`
2. Place reusable components in `src/components/`
3. Follow existing patterns for meal types and scoring
4. Use the `cn()` utility for dynamic className composition
5. Maintain the three-tier scoring system (high/medium/low)
6. Keep the neutral, non-medical language
7. New routes must be added to both `App.tsx` and `BottomNav.tsx` (if navigation item)

**When working with UI components:**
- Check `src/components/ui/` before adding new shadcn components
- Customize existing components directly in the ui folder
- Use Tailwind's color tokens (`primary`, `secondary`, `success`, etc.)

**When modifying scoring logic:**
- Update `AdherenceScore.tsx` helper functions
- Maintain consistency across all score displays
- Remember: ≥70 = high, 40-69 = medium, <40 = low

**Navigation Flow:**
- Use `useNavigate()` from react-router-dom for programmatic navigation
- Pass state between pages using `navigate(path, { state: {...} })`
- Access passed state with `useLocation()` and `location.state`
- Example: Log page → MealResult page passes `mealType`

**Multi-step Flows:**
- Use local state with string literal union types (e.g., `"step1" | "step2"`)
- Log flow: `select` → `capture` → `analyzing`
- Plan import flow: `empty` → `importing` → `review` → `active`
- Onboarding flow: `welcome` → `signup` → `upload` → `parsing` → `review` → `complete`

**Page State Management:**
- Progress page uses tabs: `"daily" | "weekly"`
- Plan page uses view states for import flow
- Settings page uses local state for toggles
- Use `hasPlan` flag to conditionally show empty states
