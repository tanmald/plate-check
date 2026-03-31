/**
 * Client-side scoring utility for real-time adherence score calculation
 */

import type { MatchType } from './api';

export interface EditableFood {
  id: string;
  name: string;
  matched: boolean;
  matchType?: MatchType;
  category: string;
  isNew?: boolean;
  isDeleted?: boolean;
  originalName?: string;
}

export interface ScoreBreakdown {
  score: number;
  requiredPresent: EditableFood[];
  allowedPresent: EditableFood[];
  offPlan: EditableFood[];
  missingRequired: string[];
  missingPenalty: number;
  offPlanPenalty: number;
}

/**
 * Score formula (transparent and deterministic):
 *   100 base
 *   − 20 per missing required food  (capped at −60)
 *   − 10 per off-plan food detected (capped at −40)
 *
 * When matchType is unavailable (legacy / mock data), falls back to:
 *   matched = true  → 'allowed'
 *   matched = false → 'off_plan'
 */
export function getScoreBreakdown(
  foods: EditableFood[],
  missingRequired: string[] = []
): ScoreBreakdown {
  const active = foods.filter((f) => !f.isDeleted);

  const resolveType = (f: EditableFood): MatchType =>
    f.matchType ?? (f.matched ? 'allowed' : 'off_plan');

  const requiredPresent = active.filter((f) => resolveType(f) === 'required');
  const allowedPresent = active.filter((f) => resolveType(f) === 'allowed');
  const offPlan = active.filter((f) => resolveType(f) === 'off_plan');

  const missingPenalty = Math.min(60, missingRequired.length * 20);
  const offPlanPenalty = Math.min(40, offPlan.length * 10);

  const score = Math.max(0, Math.min(100, 100 - missingPenalty - offPlanPenalty));

  return { score, requiredPresent, allowedPresent, offPlan, missingRequired, missingPenalty, offPlanPenalty };
}

/**
 * Calculate adherence score based on matched/unmatched foods.
 * Kept for compatibility — delegates to getScoreBreakdown.
 */
export function calculateAdherenceScore(
  foods: EditableFood[],
  missingRequired: string[] = []
): number {
  return getScoreBreakdown(foods, missingRequired).score;
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
