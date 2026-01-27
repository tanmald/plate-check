

# Plan Editing Flow Implementation

## Overview
Wire up the "Plan Editing" capabilities on the /plan page to allow users to:
1. **Rename the plan** (edit plan name via a sheet/dialog)
2. **Delete the plan** (using the existing DeletePlanDialog)
3. **Add new meal templates** from scratch

Currently, the `handleEditPlan` and `handleAddTemplate` functions just show "coming soon" toasts. This plan will implement the full functionality.

---

## Current State

### What's Already Built
- **Edit individual template**: Works via `/plan/template/:templateId` route
- **Delete plan**: `DeletePlanDialog` component exists and is fully functional
- **Replace plan**: "Replace Plan" button works (returns to empty state for re-upload)
- **Import/confirm flow**: Complete for uploading new plans

### What's Missing
- **Plan name editing**: The edit button (pencil icon) on the plan info card just shows a toast
- **Add template**: The "Add" button in the templates header just shows a toast

---

## Feature Design

### 1. Edit Plan Sheet
When user taps the edit icon on the plan info card, open a bottom sheet with:
- **Plan Name** input field (editable)
- **Danger Zone** section with "Delete Plan" button
- **Save** button (only enabled if name changed)

### 2. Add Template Flow
When user taps "Add" button, navigate to a new template creation page:
- Pre-populated with sensible defaults (empty name, no foods)
- Same UI as EditMealTemplate but for creating new templates
- Save creates a new template linked to the active plan

---

## Technical Implementation

### Part 1: Edit Plan Sheet Component

**New file:** `src/components/EditPlanSheet.tsx`

A bottom sheet (using the existing Sheet component) that allows:
- Editing the plan name
- Quick access to delete the plan

```tsx
interface EditPlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  onDeleteClick: () => void;
}
```

Features:
- Text input for plan name
- Save button (calls mutation to update plan name)
- Delete button that opens the existing DeletePlanDialog
- Cancel/close functionality

### Part 2: Update Plan Name Hook

**New hook:** `useUpdateNutritionPlan` in `src/hooks/use-nutrition-plan.ts`

```typescript
export function useUpdateNutritionPlan() {
  return useMutation({
    mutationFn: async ({ planId, name }: { planId: string; name: string }) => {
      const { error } = await supabase
        .from("nutrition_plans")
        .update({ name })
        .eq("id", planId)
        .eq("user_id", user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}
```

Note: This requires the plan ID, which is not currently exposed. Will need to update `useNutritionPlan` to return the plan ID.

### Part 3: Add Template Page

**Modified approach:** Reuse the existing `EditMealTemplate` page with a "create mode"

Update `src/pages/EditMealTemplate.tsx` to handle both:
- **Edit mode**: When `templateId` param exists (current behavior)
- **Create mode**: When `templateId` is `new` or absent

Changes needed:
- Check for `templateId === "new"` or no template found
- Initialize with empty defaults in create mode
- Call `useCreateMealTemplate` instead of `useUpdateMealTemplate`
- Navigate back to /plan on success

### Part 4: Create Template Hook

**New hook:** `useCreateMealTemplate` in a new file or added to existing hooks

```typescript
export function useCreateMealTemplate() {
  return useMutation({
    mutationFn: async ({ planId, template }: CreateTemplateParams) => {
      const { data, error } = await supabase
        .from("meal_templates")
        .insert({
          user_id: user.id,
          plan_id: planId,
          type: template.type,
          name: template.name,
          required_foods: template.requiredFoods,
          allowed_foods: template.allowedFoods,
          optional_addons: template.optionalAddons,
          // ... other fields
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nutrition-plan"] });
    },
  });
}
```

### Part 5: Plan.tsx Updates

Update the Plan page to:

1. **Wire up `handleEditPlan`**:
   - Open the EditPlanSheet instead of showing toast
   
2. **Wire up `handleAddTemplate`**:
   - Navigate to `/plan/template/new`

3. **Add state for EditPlanSheet**:
   ```tsx
   const [editPlanOpen, setEditPlanOpen] = useState(false);
   ```

4. **Integrate DeletePlanDialog**:
   - Already exists in Settings, but add it to Plan page too
   - Triggered from EditPlanSheet's delete button

### Part 6: Data Flow Updates

**Update `useNutritionPlan` to return plan ID:**

```typescript
const plan: NutritionPlan = {
  id: planData.id,  // Add this
  name: planData.name,
  uploadedAt: ...,
  source: ...,
  templates,
};
```

This is needed for:
- Updating plan name (requires plan ID)
- Creating new templates (requires plan ID to link them)

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/EditPlanSheet.tsx` | Bottom sheet for editing plan name and accessing delete |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Plan.tsx` | Wire up handleEditPlan to open sheet, handleAddTemplate to navigate |
| `src/pages/EditMealTemplate.tsx` | Support "create mode" when templateId is "new" |
| `src/hooks/use-nutrition-plan.ts` | Add plan ID to return data, add useUpdateNutritionPlan hook |
| `src/hooks/use-update-meal-template.ts` | Add useCreateMealTemplate hook |
| `src/App.tsx` | Optionally add `/plan/template/new` route (or reuse existing) |

---

## User Experience Flow

### Edit Plan Flow
1. User is on /plan page with active plan
2. Taps pencil icon on plan info card
3. EditPlanSheet opens from bottom
4. User can:
   - Edit plan name → Save → Toast success → Sheet closes
   - Tap "Delete Plan" → DeletePlanDialog opens → Confirm → Returns to empty state
   - Cancel → Sheet closes

### Add Template Flow
1. User is on /plan page with active plan
2. Taps "+ Add" button in templates header
3. Navigates to `/plan/template/new`
4. Sees empty template form with defaults:
   - Name: empty (placeholder "e.g., Morning Snack")
   - Icon: 🍽️ (default)
   - Time, calories, protein: empty
   - No foods
5. User fills in details and taps "Create Template"
6. Template is saved and user returns to /plan page

---

## Test User Handling

For test users (mock data):
- Edit plan name: Show toast success but don't persist (simulated)
- Add template: Show toast success, navigate back (UI-only demo)
- Delete plan: Simulate success with delay (already implemented)

---

## Implementation Order

1. Update `useNutritionPlan` to return plan ID
2. Add `useUpdateNutritionPlan` hook
3. Create `EditPlanSheet` component
4. Update `Plan.tsx` to use EditPlanSheet
5. Add `useCreateMealTemplate` hook
6. Update `EditMealTemplate.tsx` for create mode
7. Update `Plan.tsx` handleAddTemplate to navigate

