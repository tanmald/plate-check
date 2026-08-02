/**
 * Client-side scoring utility.
 *
 * The authoritative score comes from the `analyze-meal` edge function, which
 * scores the plate against the components of the plan option it best matches.
 * This module mirrors that same formula so the number can be recomputed live
 * when the user corrects the detected foods — without the client and the
 * backend ever disagreeing about how a score is derived.
 */

import type { MatchType, MealComponentResult } from './api';

export interface EditableFood {
  id: string;
  name: string;
  matched: boolean;
  matchType?: MatchType;
  category: string;
  isNew?: boolean;
  isDeleted?: boolean;
  originalName?: string;
  /** Plan component this food satisfies, when the analysis matched one. */
  component?: string;
}

export interface ScoreBreakdown {
  score: number;
  /** Weighted fraction (0..1) of the option's required components satisfied. */
  satisfaction: number;
  components: MealComponentResult[];
  satisfiedComponents: MealComponentResult[];
  missingComponents: MealComponentResult[];
  onPlan: EditableFood[];
  addons: EditableFood[];
  offPlan: EditableFood[];
  disallowed: EditableFood[];
  offPlanPenalty: number;
  disallowedPenalty: number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const componentWeight = (c: Pick<MealComponentResult, 'required' | 'weight'>) =>
  typeof c.weight === 'number' ? c.weight : c.required ? 1 : 0;

/**
 * Normalise legacy match types. Meals logged before the option-satisfaction
 * model stored 'required'/'allowed'; both mean "counts towards the plan".
 */
function resolveType(f: EditableFood): MatchType {
  if (f.matchType === 'required' || f.matchType === 'allowed') return 'on_plan';
  if (f.matchType) return f.matchType;
  return f.matched ? 'on_plan' : 'off_plan';
}

/**
 * Score formula (mirrors `analyze-meal`):
 *   round(satisfaction × 100)
 *   − 10 per off-plan food      (capped at −30)
 *   − 20 per disallowed food    (capped at −40)
 *
 * `satisfaction` is the weighted share of the chosen option's required
 * components that the plate satisfies, with partial credit. A required
 * component whose matched food the user deleted drops to 0.
 */
export function getScoreBreakdown(
  foods: EditableFood[],
  components: MealComponentResult[] = []
): ScoreBreakdown {
  const active = foods.filter((f) => !f.isDeleted);
  const deletedNames = new Set(
    foods.filter((f) => f.isDeleted).map((f) => f.name.toLowerCase())
  );

  // Re-evaluate each component against the user's edits: if the food that
  // satisfied it was removed, it is no longer satisfied.
  const resolved = components.map((c) => {
    const matchedRemoved =
      !!c.matchedFood && deletedNames.has(c.matchedFood.toLowerCase());
    const satisfaction = matchedRemoved ? 0 : clamp01(c.satisfaction ?? 0);
    return { ...c, satisfaction, present: satisfaction >= 0.5 };
  });

  const required = resolved.filter((c) => c.required);
  const denom = required.reduce((sum, c) => sum + componentWeight(c), 0);
  const numer = required.reduce(
    (sum, c) => sum + componentWeight(c) * c.satisfaction,
    0
  );
  // No required components (plan-less meal): nothing to fall short of.
  const satisfaction = denom > 0 ? numer / denom : 1;

  const onPlan = active.filter((f) => resolveType(f) === 'on_plan');
  const addons = active.filter((f) => resolveType(f) === 'addon');
  const offPlan = active.filter((f) => resolveType(f) === 'off_plan');
  const disallowed = active.filter((f) => resolveType(f) === 'disallowed');

  const offPlanPenalty = Math.min(30, offPlan.length * 10);
  const disallowedPenalty = Math.min(40, disallowed.length * 20);

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(satisfaction * 100 - offPlanPenalty - disallowedPenalty)
    )
  );

  return {
    score,
    satisfaction,
    components: resolved,
    satisfiedComponents: resolved.filter((c) => c.present),
    missingComponents: required.filter((c) => !c.present),
    onPlan,
    addons,
    offPlan,
    disallowed,
    offPlanPenalty,
    disallowedPenalty,
  };
}

/**
 * Generate a unique ID for new foods
 */
export function generateFoodId(): string {
  return `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Common food categories for the category selector
 */
export const FOOD_CATEGORIES = [
  'Protein',
  'Carbs',
  'Vegetables',
  'Fruits',
  'Dairy',
  'Fats',
  'Sauce',
  'Beverage',
  'Other',
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
