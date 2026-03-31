import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface AnalyzeMealRequest {
  imageUrl: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  userId: string;
  planId?: string;
}

interface AnalyzeMealResponse {
  score: number;
  detectedFoods: Array<{
    name: string;
    matched: boolean;
    confidence: number;
  }>;
  feedback: string;
  confidence: "high" | "medium" | "low";
  suggestedSwaps?: Array<{
    original: string;
    suggested: string[];
  }>;
}

interface MealTemplate {
  id: string;
  type: string;
  required_foods: string[];
  allowed_foods: string[];
  disallowed_foods: string[];
  options: Array<{ number: number; description: string; foods: string[] }>;
  optional_addons: string[];
  calories_min: number | null;
  calories_max: number | null;
  macros: Record<string, unknown> | null;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// Database Helpers
// ============================================================================

async function fetchMealTemplates(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  mealType: string,
  planId?: string
): Promise<MealTemplate[]> {
  let targetPlanId = planId;

  if (!targetPlanId) {
    const { data: activePlan } = await supabase
      .from("nutrition_plans")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (activePlan) {
      targetPlanId = activePlan.id;
    }
  }

  if (!targetPlanId) {
    console.log("No active nutrition plan found for user:", userId);
    return [];
  }

  const { data, error } = await supabase
    .from("meal_templates")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_id", targetPlanId)
    .eq("type", mealType);

  if (error) {
    console.error("Error fetching meal templates:", error);
    return [];
  }

  return (data || []) as MealTemplate[];
}

// ============================================================================
// Vision Analysis
// ============================================================================

async function analyzeWithVision(
  imageUrl: string,
  mealType: string,
  templates: MealTemplate[],
  openaiApiKey: string
): Promise<AnalyzeMealResponse> {
  const templateContext =
    templates.length > 0
      ? templates
          .map(
            (t) =>
              `Meal plan for ${mealType}:
- Required foods: ${t.required_foods.join(", ") || "none specified"}
- Allowed foods: ${t.allowed_foods.join(", ") || "any"}
- Disallowed foods: ${t.disallowed_foods.join(", ") || "none"}
- Meal options: ${
                t.options.length > 0
                  ? t.options
                      .map((o) => `Option ${o.number}: ${o.foods.join(", ")}`)
                      .join(" | ")
                  : "any"
              }`
          )
          .join("\n")
      : "No specific meal plan found. Score based on general healthy eating principles.";

  const systemPrompt = `You are a nutrition compliance analyzer. Analyze meal photos against a user's nutrition plan.

${templateContext}

Analyze the meal photo and return JSON:
{
  "detectedFoods": [
    { "name": "food name in English", "matched": true/false, "confidence": 0.0-1.0 }
  ],
  "score": 0-100,
  "feedback": "1-2 sentence feedback in English about adherence to the plan",
  "confidence": "high" | "medium" | "low",
  "suggestedSwaps": [
    { "original": "food not aligned with plan", "suggested": ["better alternatives from the plan"] }
  ]
}

Scoring guidelines:
- 80-100: All required foods present, no disallowed foods, closely follows a meal option
- 60-79: Most required foods present, minor deviations
- 40-59: Some plan foods missing or extra unplanned items
- 20-39: Few plan foods, significant deviations
- 0-19: Mostly off plan, disallowed foods present

For "matched": set true if the food aligns with required_foods, allowed_foods, or a meal option.
Only include suggestedSwaps for foods that are off-plan or could be better aligned.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this ${mealType} photo against my nutrition plan.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `OpenAI Vision API error: ${errorData.error?.message || "Unknown error"}`
    );
  }

  const data = await response.json();
  const result = JSON.parse(data.choices[0].message.content);

  return result as AnalyzeMealResponse;
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { imageUrl, mealType, userId, planId }: AnalyzeMealRequest =
      await req.json();

    if (!imageUrl || !mealType || !userId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: imageUrl, mealType, userId",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch meal templates from the user's active plan
    const templates = await fetchMealTemplates(
      supabase,
      userId,
      mealType,
      planId
    );
    console.log(`Found ${templates.length} meal template(s) for ${mealType}`);

    // Analyze image against the plan using GPT-4o Vision
    const analysisResult = await analyzeWithVision(
      imageUrl,
      mealType,
      templates,
      openaiApiKey
    );

    console.log(
      `Analysis complete — score: ${analysisResult.score}, confidence: ${analysisResult.confidence}`
    );

    return new Response(JSON.stringify(analysisResult), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (error) {
    console.error("Error in analyze-meal:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      }
    );
  }
});
