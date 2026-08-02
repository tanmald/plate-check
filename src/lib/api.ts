import { supabase } from './supabase';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Match classification returned by analyze-meal.
 *
 * 'required' and 'allowed' are legacy values that still exist in meal_logs
 * rows written before the option-satisfaction scoring model shipped; keep
 * them so old meals still render.
 */
export type MatchType =
  | 'on_plan'
  | 'addon'
  | 'off_plan'
  | 'disallowed'
  | 'required'
  | 'allowed';

export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type PhotoQuality = 'clear' | 'partial' | 'poor';

export interface DetectedFood {
  name: string;
  matched: boolean;
  confidence: number;
  category?: string;
  matchType?: MatchType;
  /** Name of the plan component this food satisfies, when it satisfies one. */
  component?: string;
}

/**
 * One component of the plan option the meal was scored against, with the
 * partial credit (0..1) the analysis gave it.
 */
export interface MealComponentResult {
  name: string;
  required: boolean;
  present: boolean;
  satisfaction: number;
  matchedFood?: string;
  /** What is actually visible in the photo supporting (or failing) this component. */
  evidence?: string;
  weight?: number;
}

export interface SuggestedSwap {
  original: string;
  suggested: string[];
  reason?: string;
}

export interface AnalyzeMealRequest {
  imageUrl: string;
  mealType: string;
  userId: string;
  planId?: string;
  /** BCP-47 tag of the UI language, so the analysis prose comes back translated. */
  language?: string;
}

export interface AnalyzeMealResponse {
  score: number;
  /** The plan option the plate best matched, or null when the plan has no options. */
  bestOption: { number: number; description: string } | null;
  components: MealComponentResult[];
  detectedFoods: DetectedFood[];
  offPlan: string[];
  disallowed: string[];
  missingRequired: string[];
  feedback: string;
  confidence: ConfidenceLevel;
  photoQuality: PhotoQuality;
  /** Anything the analysis inferred rather than clearly saw. */
  assumptions: string[];
  /** Problems with the plan itself (vague option, missing quantity, likely mistranslation). */
  planNotes: string[];
  /** `confidence`, downgraded when the photo was partial or poor. */
  analysisConfidence: ConfidenceLevel;
  suggestedSwaps: SuggestedSwap[];
}

export interface MealOption {
  number: number;
  description: string;
  foods: string[];
}

export interface MealTemplate {
  id: string;
  type: string;
  icon: string;
  name: string;
  options: MealOption[];
  requiredFoods: string[];
  allowedFoods: string[];
  optionalAddons: string[];
  calories: string;
  protein: string;
  isOptional: boolean;
  isPreWorkout: boolean;
  scheduledTime: string | null;
  referencesMeal: string | null;
  snackTimeCategory: string | null;
}

export interface ParsePlanRequest {
  fileUrl: string;
  userId: string;
  fileType: string;
}

export interface ParsePlanResponse {
  planId: string;
  planName: string;
  mealTemplates: MealTemplate[];
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

// ============================================================================
// Error Handling
// ============================================================================

export class EdgeFunctionError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public functionName?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

// ============================================================================
// Retry Logic
// ============================================================================

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 1,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) or if this is the last attempt
      if (attempt === maxRetries || (error as any)?.statusCode < 500) {
        break;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================================================
// Edge Function Clients
// ============================================================================

/**
 * Fill in any field the edge function omitted, so the UI can read the whole
 * shape unconditionally. Also normalises meals stored before the
 * option-satisfaction model shipped, which carry only the legacy fields.
 */
export function normalizeAnalyzeMealResponse(
  raw: Partial<AnalyzeMealResponse> & { score: number }
): AnalyzeMealResponse {
  const detectedFoods = raw.detectedFoods ?? [];

  return {
    score: raw.score,
    bestOption: raw.bestOption ?? null,
    components: raw.components ?? [],
    detectedFoods,
    offPlan:
      raw.offPlan ??
      detectedFoods.filter((f) => f.matchType === 'off_plan').map((f) => f.name),
    disallowed:
      raw.disallowed ??
      detectedFoods
        .filter((f) => f.matchType === 'disallowed')
        .map((f) => f.name),
    missingRequired: raw.missingRequired ?? [],
    feedback: raw.feedback ?? '',
    confidence: raw.confidence ?? 'medium',
    photoQuality: raw.photoQuality ?? 'clear',
    assumptions: raw.assumptions ?? [],
    planNotes: raw.planNotes ?? [],
    analysisConfidence: raw.analysisConfidence ?? raw.confidence ?? 'medium',
    suggestedSwaps: raw.suggestedSwaps ?? [],
  };
}

/**
 * Call the analyze-meal Edge Function
 * Analyzes a meal photo against a nutrition plan and returns an alignment score
 */
export async function analyzeMeal(
  request: AnalyzeMealRequest
): Promise<AnalyzeMealResponse> {
  return retryWithBackoff(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-meal', {
        body: request,
      });

      if (error) {
        throw new EdgeFunctionError(
          `Failed to analyze meal: ${error.message}`,
          error.status,
          'analyze-meal',
          error
        );
      }

      if (!data) {
        throw new EdgeFunctionError(
          'No data returned from analyze-meal function',
          undefined,
          'analyze-meal'
        );
      }

      // Validate response structure
      if (typeof data.score !== 'number') {
        throw new EdgeFunctionError(
          'Invalid response format from analyze-meal',
          undefined,
          'analyze-meal',
          data
        );
      }

      return normalizeAnalyzeMealResponse(data);
    } catch (error) {
      if (error instanceof EdgeFunctionError) {
        throw error;
      }
      throw new EdgeFunctionError(
        'Unexpected error calling analyze-meal',
        undefined,
        'analyze-meal',
        error
      );
    }
  });
}

/**
 * Call the parse-nutrition-plan Edge Function
 * Parses a nutrition plan document and extracts meal templates
 */
export async function parseNutritionPlan(
  request: ParsePlanRequest
): Promise<ParsePlanResponse> {
  return retryWithBackoff(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('parse-nutrition-plan', {
        body: request,
      });

      if (error) {
        throw new EdgeFunctionError(
          `Failed to parse nutrition plan: ${error.message}`,
          error.status,
          'parse-nutrition-plan',
          error
        );
      }

      if (!data) {
        throw new EdgeFunctionError(
          'No data returned from parse-nutrition-plan function',
          undefined,
          'parse-nutrition-plan'
        );
      }

      // Validate response structure
      if (!data.planId || !data.planName || !Array.isArray(data.mealTemplates)) {
        throw new EdgeFunctionError(
          'Invalid response format from parse-nutrition-plan',
          undefined,
          'parse-nutrition-plan',
          data
        );
      }

      return data as ParsePlanResponse;
    } catch (error) {
      if (error instanceof EdgeFunctionError) {
        throw error;
      }
      throw new EdgeFunctionError(
        'Unexpected error calling parse-nutrition-plan',
        undefined,
        'parse-nutrition-plan',
        error
      );
    }
  });
}
