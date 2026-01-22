import { supabase } from './supabase';

// ============================================================================
// Type Definitions
// ============================================================================

export interface DetectedFood {
  name: string;
  matched: boolean;
  confidence: number;
  category?: string;
}

export interface SuggestedSwap {
  original: string;
  suggested: string;
  reason: string;
}

export interface AnalyzeMealRequest {
  imageUrl: string;
  mealType: string;
  userId: string;
  planId?: string;
}

export interface AnalyzeMealResponse {
  score: number;
  detectedFoods: DetectedFood[];
  feedback: string;
  confidence: 'high' | 'medium' | 'low';
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
 * Call the analyze-meal Edge Function
 * Analyzes a meal photo against a nutrition plan and returns adherence score
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

      return data as AnalyzeMealResponse;
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
