

# Meal Corrections Feature Implementation Plan

## Overview
Add a "tap-to-fix" interface to the MealResult page that allows users to correct AI detection errors, add/remove foods, update portions, and see the adherence score recalculate in real-time.

---

## Current State Analysis

### Existing Data Flow
1. User captures photo → `useCreateMealLog` mutation
2. Photo uploaded → `analyze-meal` Edge Function called
3. Analysis result passed to `MealResult` via `location.state`
4. Meal data already saved to `meal_logs` table (with `user_corrections` JSONB field available but unused)

### Key Data Structures
- `DetectedFood`: `{ name, matched, confidence, category }`
- `AnalyzeMealResponse`: `{ score, detectedFoods, feedback, confidence, suggestedSwaps }`
- Database supports `user_corrections` JSONB field for storing edits

---

## Feature Design

### User Experience Flow
1. **View detected foods** - Current behavior (unchanged)
2. **Tap a food** → Opens edit modal with options:
   - Edit food name (text input)
   - Toggle matched/unmatched status
   - Delete the food item
3. **Add new food** - "Add food" button at bottom of list
4. **Real-time score update** - Score recalculates as changes are made
5. **Save changes** - Updates `meal_logs.user_corrections` in database

### Score Recalculation Logic
Since the Edge Function scoring isn't available client-side, implement a simplified local scoring algorithm:
- Each matched food contributes positively
- Each unmatched food detracts from score
- Formula: `score = (matchedCount / totalCount) * 100`, with adjustments for category weights

---

## Technical Implementation

### Part 1: State Management in MealResult

Convert the page from read-only to editable state:

```typescript
// New state for editable foods
const [editableFoods, setEditableFoods] = useState<EditableFood[]>([]);
const [hasChanges, setHasChanges] = useState(false);
const [currentScore, setCurrentScore] = useState(result.score);
```

**EditableFood interface:**
```typescript
interface EditableFood {
  id: string;           // UUID for tracking
  name: string;
  matched: boolean;
  category: string;
  isNew?: boolean;      // For foods added by user
  isDeleted?: boolean;  // Soft delete for UI
  originalName?: string; // Track if edited
}
```

### Part 2: New Components

#### 2.1 FoodItemEditor Component
**File:** `src/components/FoodItemEditor.tsx`

A tappable food row that transforms into an inline editor:
- Tap to expand edit controls
- Inline text input for name
- Toggle switch for matched/unmatched
- Category selector (dropdown with common categories)
- Delete button with confirmation

Visual states:
- Default: Current food pill appearance
- Editing: Expanded with input field and action buttons
- Deleted: Strikethrough with "Undo" option

#### 2.2 AddFoodSheet Component
**File:** `src/components/AddFoodSheet.tsx`

Bottom sheet (using existing Drawer/Sheet component) for adding new foods:
- Food name input (required)
- Category selector
- Matched toggle (default: true if category matches plan)
- "Add" button

#### 2.3 ScoreRecalculator Utility
**File:** `src/lib/scoring.ts`

Client-side scoring function for real-time updates:
```typescript
export function calculateAdherenceScore(
  foods: EditableFood[],
  planAllowedFoods?: string[]
): number {
  const activeFoods = foods.filter(f => !f.isDeleted);
  if (activeFoods.length === 0) return 0;
  
  const matchedCount = activeFoods.filter(f => f.matched).length;
  const baseScore = (matchedCount / activeFoods.length) * 100;
  
  return Math.round(Math.min(100, Math.max(0, baseScore)));
}
```

### Part 3: MealResult Page Updates

**File modifications:** `src/pages/MealResult.tsx`

#### 3.1 Add Edit Mode
- Initialize `editableFoods` from `detectedFoods` on mount
- Track changes with `hasChanges` state
- Show/hide "Unsaved changes" indicator

#### 3.2 Replace Static Foods List
Replace the static food display with interactive `FoodItemEditor` components:
```tsx
{editableFoods.map((food) => (
  <FoodItemEditor
    key={food.id}
    food={food}
    onUpdate={(updated) => handleFoodUpdate(food.id, updated)}
    onDelete={() => handleFoodDelete(food.id)}
  />
))}
```

#### 3.3 Add "Add Food" Button
At the bottom of the detected foods card:
```tsx
<Button variant="outline" onClick={() => setShowAddSheet(true)}>
  <Plus className="w-4 h-4 mr-2" />
  Add Food
</Button>
```

#### 3.4 Real-Time Score Update
Use `useEffect` to recalculate score when foods change:
```tsx
useEffect(() => {
  const newScore = calculateAdherenceScore(editableFoods);
  setCurrentScore(newScore);
}, [editableFoods]);
```

#### 3.5 Save Handler Update
Modify `handleSave` to update database with corrections:
```typescript
const handleSave = async () => {
  if (hasChanges && mealLogId) {
    await updateMealLog({
      id: mealLogId,
      userCorrections: editableFoods,
      correctedScore: currentScore,
    });
  }
  navigate("/");
};
```

### Part 4: New Hook for Updating Meal Logs

**File:** `src/hooks/use-update-meal-log.ts`

```typescript
export function useUpdateMealLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userCorrections, correctedScore }) => {
      const { error } = await supabase
        .from("meal_logs")
        .update({
          user_corrections: userCorrections,
          adherence_score: correctedScore,
          detected_foods: userCorrections
            .filter(f => !f.isDeleted)
            .map(f => f.name),
        })
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
    },
  });
}
```

### Part 5: Visual Feedback & Animations

#### Score Animation
When score changes, animate the transition:
- Add CSS transition to AdherenceScore component
- Show score change indicator (+5, -10, etc.) briefly

#### Food Edit Animations
- Slide-in animation for newly added foods
- Fade-out animation for deleted foods
- Subtle highlight when food is modified

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/FoodItemEditor.tsx` | Tappable/editable food row component |
| `src/components/AddFoodSheet.tsx` | Bottom sheet for adding new foods |
| `src/lib/scoring.ts` | Client-side score calculation utility |
| `src/hooks/use-update-meal-log.ts` | Mutation hook for saving corrections |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/MealResult.tsx` | Add edit mode, state management, new components |
| `src/hooks/use-meals.ts` | Pass meal log ID to result page for updates |
| `src/pages/Log.tsx` | Pass meal log ID in navigation state |
| `src/components/AdherenceScore.tsx` | Add transition animation for score changes |
| `src/index.css` | Add animations for food edits |

---

## Technical Considerations

### Meal Log ID Flow
Currently, the meal is saved before navigating to MealResult, but the ID isn't passed. Update flow:
1. `useCreateMealLog` returns the saved meal ID
2. Pass ID via `location.state` to MealResult
3. MealResult uses ID for update operations

### Test User Handling
For test users (mock data), skip database updates but still allow UI interactions for demo purposes.

### Database Schema
The existing `user_corrections` JSONB field is perfect for storing edit history. Structure:
```json
{
  "corrections": [
    { "id": "...", "name": "Grilled Chicken", "matched": true, "category": "Protein", "isNew": false }
  ],
  "correctedAt": "2026-01-27T..."
}
```

---

## Alignment with PRD

| PRD Requirement | Implementation |
|-----------------|----------------|
| "K2: Tap-to-fix misidentified items" | FoodItemEditor with inline editing |
| "K2: Add/remove detected foods" | AddFoodSheet + delete functionality |
| "K2: Real-time score recalculation" | calculateAdherenceScore utility with useEffect |
| "K2: Update portions" | Future enhancement (portion field in editor) |
| "Non-judgmental language" | No negative language in UI feedback |
| "Large tap targets" | Minimum 44px touch targets on all interactive elements |

---

## Implementation Order

1. Create `src/lib/scoring.ts` (scoring utility)
2. Create `src/hooks/use-update-meal-log.ts` (database mutation)
3. Create `src/components/FoodItemEditor.tsx` (editable food row)
4. Create `src/components/AddFoodSheet.tsx` (add food sheet)
5. Update `src/hooks/use-meals.ts` to return meal log ID
6. Update `src/pages/Log.tsx` to pass meal log ID
7. Update `src/pages/MealResult.tsx` with full edit mode
8. Update `src/components/AdherenceScore.tsx` for animations
9. Add CSS animations to `src/index.css`

