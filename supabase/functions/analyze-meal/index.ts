import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface AnalyzeMealRequest {
  imageUrl: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  userId: string;
  planId?: string;
}

type MatchType = "required" | "allowed" | "off_plan";

interface AnalyzeMealResponse {
  score: number;
  detectedFoods: Array<{
    name: string;
    matched: boolean;
    matchType: MatchType;
    confidence: number;
  }>;
  missingRequired: string[];
  feedback: string;
  confidence: "high" | "medium" | "low";
  suggestedSwaps: Array<{
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

  const systemPrompt = `You are a nutrition wellness coach. Analyze meal photos to help users understand how well their meals align with their personal wellness goals.

${templateContext}

Analyze the meal photo and return JSON:
{
  "detectedFoods": [
    {
      "name": "food name in English",
      "matchType": "required" | "allowed" | "off_plan",
      "confidence": 0.0-1.0
    }
  ],
  "missingRequired": ["required food from plan not detected in the photo"],
  "feedback": "1-2 sentence encouraging feedback in English about how well the meal aligns with the user's wellness goals",
  "confidence": "high" | "medium" | "low",
  "suggestedSwaps": [
    { "original": "off-plan food", "suggested": ["plan-aligned alternative 1", "alternative 2"] }
  ]
}

Classification rules for matchType:
- "required": food explicitly listed as required in the plan AND detected in the photo
- "allowed": food in the allowed_foods list or matching a meal option AND detected in the photo
- "off_plan": food detected but not in required_foods or allowed_foods

For missingRequired: list required_foods from the plan that were NOT detected in the photo.
Only include suggestedSwaps for off_plan foods.
Do NOT include a score field — it will be calculated deterministically.`;

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
  const raw = JSON.parse(data.choices[0].message.content);

  // Compute score deterministically — not delegated to the LLM
  const missingRequired: string[] = raw.missingRequired ?? [];
  const offPlanCount = (raw.detectedFoods ?? []).filter(
    (f: { matchType: string }) => f.matchType === "off_plan"
  ).length;
  const missingPenalty = Math.min(60, missingRequired.length * 20);
  const offPlanPenalty = Math.min(40, offPlanCount * 10);
  const score = Math.max(0, Math.min(100, 100 - missingPenalty - offPlanPenalty));

  // Derive matched boolean from matchType for backward compat
  const detectedFoods = (raw.detectedFoods ?? []).map(
    (f: { name: string; matchType: MatchType; confidence: number }) => ({
      ...f,
      matched: f.matchType !== "off_plan",
    })
  );

  const result: AnalyzeMealResponse = {
    score,
    detectedFoods,
    missingRequired,
    feedback: raw.feedback ?? "",
    confidence: raw.confidence ?? "medium",
    suggestedSwaps: raw.suggestedSwaps ?? [],
  };

  return result;
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
