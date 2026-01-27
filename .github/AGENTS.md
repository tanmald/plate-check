# AGENTS.md

This document provides guidelines and commands for agentic coding agents working on the PlateCheck codebase.

## Development Commands

### Essential Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint codebase
npm run lint

# Preview production build
npm run preview
```

### Testing (Coming Soon)
```bash
# Run all tests (will be added)
npm test

# Run single test file (will be added)
npm test -- MealCard.test.tsx

# Watch mode (will be added)
npm test -- --watch

# Coverage report (will be added)
npm test -- --coverage
```

## Code Style Guidelines

### Import Organization
```typescript
// 1. External libraries (React, third-party)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

// 2. Internal imports (components, hooks, lib)
import { AdherenceScore } from '@/components/AdherenceScore';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// 3. Type imports (use 'type' keyword for type-only imports)
import type { Meal } from '@/types/meal';
```

### Path Aliases
- `@/*` maps to `./src/*`
- `@/components/*` for UI components
- `@/hooks/*` for custom hooks
- `@/lib/*` for utilities and configurations
- `@/types/*` for TypeScript types

### Component Patterns

#### Functional Component Structure
```typescript
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComponentProps {
  // Define props with proper TypeScript
  title: string;
  subtitle?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Component({ 
  title, 
  subtitle, 
  className,
  children 
}: ComponentProps) {
  // Hooks first
  const [state, setState] = useState();
  
  // Computed values
  const computedValue = useMemo(() => {
    return calculateValue(state);
  }, [state]);
  
  // Event handlers
  const handleClick = useCallback(() => {
    // Handle click
  }, []);
  
  // Return JSX
  return (
    <div className={cn('default-styles', className)}>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  );
}
```

### Naming Conventions

#### Files and Directories
- Components: PascalCase (`MealCard.tsx`, `AdherenceScore.tsx`)
- Hooks: camelCase with `use-` prefix (`use-auth.ts`, `use-meals.ts`)
- Utilities: camelCase (`utils.ts`, `constants.ts`)
- Pages: PascalCase (`Home.tsx`, `Settings.tsx`)

#### Variables and Functions
- Variables: camelCase (`userProfile`, `dailyScore`)
- Functions: camelCase (`fetchUserData`, `calculateScore`)
- Constants: UPPER_SNAKE_CASE (`SCORE_THRESHOLDS`, `API_ENDPOINTS`)
- Interfaces/Types: PascalCase (`MealCardProps`, `User`)

#### Enum Patterns
```typescript
// Use string literal unions for simple enums
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

// Use const assertions for complex enums
export const MEAL_TYPES = {
  breakfast: { id: "breakfast", label: "Breakfast", icon: "🌅" },
  lunch: { id: "lunch", label: "Lunch", icon: "☀️" },
  dinner: { id: "dinner", label: "Dinner", icon: "🌙" },
  snack: { id: "snack", label: "Snack", icon: "🍎" },
} as const;
```

### TypeScript Guidelines

#### Type Definitions
```typescript
// Prefer interface for objects with public API
interface UserProfile {
  id: string;
  fullName: string;
  email: string;
}

// Use type for unions, primitives, or computed types
type ScoreStatus = "high" | "medium" | "low";
type MealWithScore = Meal & { score: number };

// Use generics for reusable components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}
```

#### Avoid 'any' Type
```typescript
// Bad
const [profile, setProfile] = useState<any>(null);

// Good
const [profile, setProfile] = useState<UserProfile | null>(null);

// If unknown structure, use unknown with type guards
function processApiResponse(data: unknown) {
  if (isValidUser(data)) {
    // TypeScript knows data is User here
  }
}
```

### Error Handling Patterns

#### Async Operations
```typescript
// In hooks and components, use consistent error handling
export function useUserData() {
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await fetchUserData();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
```

#### Error Boundaries
```typescript
// Wrap components with error boundaries for graceful failures
<ErrorBoundary fallback={<ErrorMessage />}>
  <ComplexComponent />
</ErrorBoundary>
```

### Styling Guidelines

#### Tailwind CSS Patterns
```typescript
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

const button = cn(
  'base-classes px-4 py-2 rounded',
  isActive && 'bg-primary text-primary-foreground',
  isDisabled && 'opacity-50 cursor-not-allowed',
  className
);

// Use design tokens for consistency
className="text-primary bg-card border-border"
```

#### Custom Classes
- `card-shadow` - consistent card elevation
- `safe-top` - safe area insets for mobile devices
- Status colors: `text-success`, `text-warning`, `text-destructive`

### Component Size Guidelines
- Aim for components under 200 lines
- Split large components into smaller, focused sub-components
- Extract complex logic into custom hooks
- Use composition over inheritance

### React Query Patterns
```typescript
// Consistent query key patterns
const { data, isLoading, error } = useQuery({
  queryKey: ['meals', userId, date],
  queryFn: () => fetchMeals(userId, date),
  staleTime: 5 * 60 * 1000, // 5 minutes
  enabled: !!userId,
});

// Consistent mutation patterns
const mutation = useMutation({
  mutationFn: createMeal,
  onSuccess: () => {
    toast.success('Meal logged successfully');
    queryClient.invalidateQueries({ queryKey: ['meals'] });
  },
  onError: (error) => {
    toast.error(`Failed to log meal: ${error.message}`);
  },
});
```

### Mobile-First Development
- Use mobile-first responsive design patterns
- Include `safe-top` and `safe-bottom` classes for mobile devices
- Test on mobile viewports during development
- Use `use-mobile.tsx` hook for responsive behavior

### Authentication Patterns
- Use the `ProtectedRoute` component for authenticated routes
- Access auth state via `useAuth()` hook from `@/hooks/use-auth`
- User profiles via `useUserProfile()` hook
- Handle test user conditions appropriately in development

### Data Flow Patterns
- Server state: React Query (`@tanstack/react-query`)
- Form state: React Hook Form with Zod validation
- Local UI state: useState + useCallback patterns
- Global state: Context API for auth, React Query for server state

### File Organization
```
src/
├── components/         # Reusable components
│   ├── ui/            # shadcn-ui components (auto-generated)
│   └── [Component].tsx # Custom components
├── pages/             # Route-level components
├── hooks/             # Custom React hooks
├── lib/               # Utilities, configurations
├── types/             # TypeScript type definitions
├── contexts/          # React contexts
└── App.tsx            # Root component with routing
```

## Project-Specific Guidelines

### Meal Type Handling
Always use the shared meal type constants instead of hardcoding:
```typescript
import { MEAL_TYPES } from '@/lib/constants';

// Use MEAL_TYPES.breakfast.id instead of "breakfast"
// Use MEAL_TYPES.breakfast.icon instead of "🌅"
```

### Scoring System
Adherence scoring thresholds:
- High: ≥70 (success/green)
- Medium: 40-69 (warning/yellow)  
- Low: <40 (destructive/red)

Use helper functions from `AdherenceScore.tsx`:
- `getScoreStatus(score)`
- `getScoreColor(score)`
- `getScoreLabel(score)`

### Navigation Patterns
- Use `useNavigate()` from react-router-dom for programmatic navigation
- Pass state between pages using `navigate(path, { state: {...} })`
- Access passed state with `useLocation()` and `location.state`

### Important Notes
- This is a wellness support tool, NOT a medical device
- Use neutral language (on-plan/off-plan, matched/not matched)
- Include confidence indicators and uncertainty cues
- Mock data is currently used throughout (no real backend integration yet)

## Testing Guidelines (When Implemented)
- Write tests for components, hooks, and utilities
- Use React Testing Library for component testing
- Mock external dependencies (Supabase, API calls)
- Aim for >80% test coverage
- Test user interactions and error states

## Security Considerations
- Never commit sensitive data or API keys
- Validate all user inputs
- Use environment variables for configuration
- Follow OAuth best practices for authentication
- Implement proper error handling without information disclosure