# Plan Import / Data Input - Progress Tracker

**Last Updated:** 2026-01-22
**Session Status:** COMPLETE

---

## Part 1: January 6 Tasks - Notion Status Updates

### Status Verification Results

| Task | Notion URL | Current Status | Verified Status | Action Needed |
|------|------------|----------------|-----------------|---------------|
| As a user, I can upload a nutrition plan document | [Link](https://www.notion.so/2e0cad3d922e8017bd64d9f51864748d) | Testing | **Done** | ✅ Updated to Done |
| As a user, I can see the uploaded plan being processed | [Link](https://www.notion.so/2e0cad3d922e8085bb76fc187e7cd666) | Testing | **Done** | ✅ Updated to Done |
| As a user, I can review parsed plan information | [Link](https://www.notion.so/2e0cad3d922e8000841ef530b4946036) | In Progress | **Done** | ✅ Updated to Done |
| As a user, I can confirm or correct imported data | [Link](https://www.notion.so/2e0cad3d922e804581a2ffce931605b5) | Not Started | **In Progress** | ⚠️ Left as Not Started (no "In Progress" status available) |
| As a user, I can discard an imported plan and try again | [Link](https://www.notion.so/2e0cad3d922e80deb855fe567d72aa29) | Not Started | **Done** | ✅ Updated to Done |

### Implementation Evidence (from codebase exploration)
- **Upload**: File input in `Plan.tsx` line 89-98, supports PDF/DOCX/images
- **Processing state**: Loading UI in `Plan.tsx` lines 147-157 with animated spinner
- **Review**: Displays confidence, warnings, templates in `Plan.tsx` lines 158-270
- **Confirm**: Works via `handleConfirmPlan`, edit shows "coming soon" toast (lines 74-80)
- **Discard**: "Replace Plan" button and auto-reset on error (lines 44-50, 402)

---

## Part 2: January 21 Tasks - Implementation Plan

### Tasks to Implement (by Priority)

| Priority | Task | Notion URL | Status |
|----------|------|------------|--------|
| CRITICAL | Fix required vs allowed foods (options vs ingredient pool) | [Link](https://www.notion.so/19ab902128bf477080f66518ff45a5df) | ⬜ Not Started |
| HIGH | Detect optional vs required meals | [Link](https://www.notion.so/171654c2967e47c9b6c9fdd3ef61c673) | ⬜ Not Started |
| HIGH | Handle meal references ("same as lunch") | [Link](https://www.notion.so/b5ee81889d9a4c2082eaffba27cf6be2) | ⬜ Not Started |
| HIGH | Detect fasting/wake-up instructions | [Link](https://www.notion.so/ffb745d7a19941b8aa801eb14f03593f) | ⬜ Not Started |
| HIGH | Extract full numbered options | [Link](https://www.notion.so/dec1caa5bf56421096f7bec6194bb410) | ⬜ Not Started |
| HIGH | Categorize snacks by time of day | [Link](https://www.notion.so/29c860486ee148228941970f907ef563) | ⬜ Not Started |
| HIGH | Detect pre-workout blocks | [Link](https://www.notion.so/beaa55d4180545acab966ee8f149a600) | ⬜ Not Started |
| MEDIUM | Extract and store meal times | [Link](https://www.notion.so/54ef1161467d4683aafa9319f17688f2) | ⬜ Not Started |

---

## Implementation Steps

### Step 1: Database Migration ✅ DONE
Create new migration file with these columns for `meal_templates`:
- `options JSONB DEFAULT '[]'` - Numbered meal options
- `optional_addons TEXT[] DEFAULT '{}'` - Optional items
- `is_optional BOOLEAN DEFAULT false` - Meal is optional
- `is_pre_workout BOOLEAN DEFAULT false` - Pre-workout meal
- `scheduled_time TEXT` - Time like "8:00 AM"
- `references_meal TEXT` - "same as lunch"
- `snack_time_category TEXT` - morning/afternoon/evening

### Step 2: Edge Function Updates ✅ DONE
**File:** `supabase/functions/parse-nutrition-plan/index.ts`
- Update TypeScript interfaces
- Enhance GPT prompt with new parsing rules
- Map new fields to database

### Step 3: Frontend Types ✅ DONE
**File:** `src/lib/api.ts`
- Add `MealOption` interface
- Update `MealTemplate` interface with new fields

### Step 4: Frontend UI ✅ DONE
**File:** `src/pages/Plan.tsx`
- Redesign template display (options as cards, not chips)
- Add badges: OPTIONAL, PRE-WORKOUT, time, references
- Add icon for "fasting" meal type

### Step 5: Hook Updates ✅ DONE
**File:** `src/hooks/use-nutrition-plan.ts`
- Update `transformTemplate` to read new columns

### Step 6: Test Data ✅ DONE
**File:** `src/lib/test-data.ts`
- Update mock data with new fields

---

## Files to Modify

1. `supabase/migrations/YYYYMMDD_enhanced_meal_templates.sql` (NEW)
2. `supabase/functions/parse-nutrition-plan/index.ts`
3. `src/lib/api.ts`
4. `src/pages/Plan.tsx`
5. `src/hooks/use-nutrition-plan.ts`
6. `src/lib/test-data.ts`

---

## Progress Log

### 2026-01-21 Session 1
- [x] Searched Notion for "Plan Import / Data Input" project tasks
- [x] Fetched task details to identify creation dates (Jan 6 vs Jan 21)
- [x] Explored codebase to verify Jan 6 task implementations
- [x] Created implementation plan for Jan 21 tasks
- [x] Created this progress tracking document

### 2026-01-21 Session 2 (continued)
- [x] Updated Notion statuses for Jan 6 tasks (4 updated to Done)
- [x] Created database migration with new columns (options, optional_addons, is_optional, is_pre_workout, scheduled_time, references_meal, snack_time_category)
- [x] Updated Edge Function with enhanced GPT prompt and parsing logic
- [x] Updated frontend types in api.ts and use-nutrition-plan.ts
- [x] Updated test data with examples of all new features
- [x] Updated Plan.tsx UI with:
  - Options displayed as numbered cards
  - OPTIONAL badge (yellow) for optional meals
  - PRE-WORKOUT badge (orange) with Zap icon
  - Scheduled time display with Clock icon
  - "Same rules as [meal]" reference notes
  - Optional add-ons section with dashed border style
- [x] Build verified successful

### 2026-01-22 Session 3 (continued)
- [x] Completed Plan.tsx UI updates (review state and active state)
- [x] Final build verification passed

---

## How to Continue / Next Steps

All implementation steps are now COMPLETE. To verify:

1. Test with test user (test@platecheck.app) to see mock data with new features
2. Upload a real nutrition plan to test AI parsing
3. Verify that the new fields appear correctly in the Plan page
4. Update Notion task statuses for Jan 21 tasks (mark as Done)

### Test Plan Document for Manual Testing
```
PLANO NUTRICIONAL

Jejum (ao acordar - 6:00):
- 1-2 copos de agua com limao

Pequeno-almoco (9:30):
Opcao 1: 2 ovos mexidos + torrada integral
Opcao 2: Papas de aveia com banana
Opcional: cafe com leite

Lanche da manha (11:00 - Opcional, se tiver fome):
- Iogurte grego com frutos vermelhos

Almoco (12:30):
Opcao 1: Frango grelhado + arroz + legumes
Opcao 2: Peixe + quinoa + salada

Pre-Treino (16:00):
- Banana com manteiga de amendoim

Jantar (20:00):
Manter as regras do almoco
```
