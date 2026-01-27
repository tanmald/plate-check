/**
 * Client-side scoring utility for real-time adherence score calculation
 */

export interface EditableFood {
  id: string;
  name: string;
  matched: boolean;
  category: string;
  isNew?: boolean;
  isDeleted?: boolean;
  originalName?: string;
}

/**
 * Calculate adherence score based on matched/unmatched foods
 * Formula: (matchedCount / totalCount) * 100
 */
export function calculateAdherenceScore(foods: EditableFood[]): number {
  const activeFoods = foods.filter((f) => !f.isDeleted);

  if (activeFoods.length === 0) return 0;

  const matchedCount = activeFoods.filter((f) => f.matched).length;
  const baseScore = (matchedCount / activeFoods.length) * 100;

  return Math.round(Math.min(100, Math.max(0, baseScore)));
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
  "Protein",
  "Carbs",
  "Vegetables",
  "Fruits",
  "Dairy",
  "Fats",
  "Sauce",
  "Beverage",
  "Other",
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];
