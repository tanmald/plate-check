import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface AnalyzeMealRequest {
  imageUrl: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack" | "fasting";
  userId: string;
  planId?: string;
  /** BCP-47 tag of the user's UI language, e.g. "pt-PT". Prose is written in it. */
  language?: string;
}

type MatchType = "on_plan" | "addon" | "off_plan" | "disallowed";

interface MealComponentResult {
  name: string;
  required: boolean;
  present: boolean; // derived: satisfaction >= 0.5
  satisfaction: number; // 0..1 — how well the visible evidence supports this component
  matchedFood?: string;
  evidence?: string; // what is actually visible in the photo
  weight?: number;
}

type PhotoQuality = "clear" | "partial" | "poor";

interface AnalyzeMealResponse {
  score: number;
  bestOption: { number: number; description: string } | null;
  components: MealComponentResult[];
  detectedFoods: Array<{
    name: string;
    matched: boolean;
    matchType: MatchType;
    confidence: number;
    component?: string;
  }>;
  offPlan: string[];
  disallowed: string[];
  missingRequired: string[];
  feedback: string;
  confidence: "high" | "medium" | "low";
  // Criticality: transparency about what could and could not be verified.
  photoQuality: PhotoQuality;
  assumptions: string[];
  planNotes: string[];
  analysisConfidence: "high" | "medium" | "low";
  suggestedSwaps: Array<{
    original: string;
    suggested: string[];
    reason?: string;
  }>;
}

interface OptionComponent {
  name: string;
  examples?: string[];
  required: boolean;
  weight?: number;
}

interface MealOption {
  number: number;
  description: string;
  foods: string[];
  components?: OptionComponent[];
}

interface MealTemplate {
  id: string;
  type: string;
  required_foods: string[];
  allowed_foods: string[];
  disallowed_foods: string[];
  options: MealOption[];
  optional_addons: string[];
  references_meal: string | null;
  calories_min: number | null;
  calories_max: number | null;
  macros: Record<string, unknown> | null;
}

/** A single option flattened across all templates of the meal, with a stable global number. */
interface FlatOption {
  number: number;
  description: string;
  foods: string[];
  components: OptionComponent[];
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "fasting"];

/** Languages the model is asked to write prose in, keyed by BCP-47 prefix. */
const LANGUAGE_NAMES: Record<string, string> = {
  pt: "European Portuguese (pt-PT)",
  en: "English",
  es: "Spanish",
  fr: "French",
};

function resolveLanguageName(tag?: string): string {
  if (!tag) return LANGUAGE_NAMES.en;
  const prefix = tag.toLowerCase().split("-")[0];
  return LANGUAGE_NAMES[prefix] ?? LANGUAGE_NAMES.en;
}

// ============================================================================
// Database Helpers
// ============================================================================

/** A template is "empty" when it carries no usable plan structure of its own. */
function isEmptyTemplate(t: MealTemplate): boolean {
  const noOptions =
    !t.options ||
    t.options.length === 0 ||
    t.options.every(
      (o) =>
        (!o.foods || o.foods.length === 0) &&
        (!o.components || o.components.length === 0)
    );
  const noFoods =
    (!t.required_foods || t.required_foods.length === 0) &&
    (!t.allowed_foods || t.allowed_foods.length === 0);
  return noOptions && noFoods;
}

function normalizeMealType(raw: string): string | null {
  const lower = (raw || "").toLowerCase().trim();
  return MEAL_TYPES.find((m) => lower.includes(m)) ?? null;
}

async function resolveTargetPlanId(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  planId?: string
): Promise<string | undefined> {
  if (planId) return planId;

  const { data: activePlan } = await supabase
    .from("nutrition_plans")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return activePlan?.id;
}

async function fetchTemplatesByType(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  planId: string,
  mealType: string
): Promise<MealTemplate[]> {
  const { data, error } = await supabase
    .from("meal_templates")
    .select("*")
    .eq("user_id", userId)
    .eq("plan_id", planId)
    .eq("type", mealType);

  if (error) {
    console.error("Error fetching meal templates:", error);
    return [];
  }
  return (data || []) as MealTemplate[];
}

async function fetchMealTemplates(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  mealType: string,
  planId?: string
): Promise<MealTemplate[]> {
  const targetPlanId = await resolveTargetPlanId(supabase, userId, planId);
  if (!targetPlanId) {
    console.log("No active nutrition plan found for user:", userId);
    return [];
  }

  const templates = await fetchTemplatesByType(
    supabase,
    userId,
    targetPlanId,
    mealType
  );

  // Reference resolution: e.g. a dinner that says "Follow lunch rules" is stored
  // with empty options + references_meal = "lunch". Dereference it so the meal is
  // scored against the referenced meal's real options.
  const allEmpty = templates.length > 0 && templates.every(isEmptyTemplate);
  const ref = templates.find((t) => t.references_meal)?.references_meal ?? null;
  const refType = ref ? normalizeMealType(ref) : null;

  if (allEmpty && refType && refType !== mealType) {
    console.log(`Resolving ${mealType} → references ${refType}`);
    const refTemplates = await fetchTemplatesByType(
      supabase,
      userId,
      targetPlanId,
      refType
    );
    if (refTemplates.length > 0) return refTemplates;
  }

  return templates;
}

// ============================================================================
// Option flattening
// ============================================================================

/**
 * Collapse every template of the meal into one pool of options with stable global
 * numbers. When a template has no explicit options but does have required/allowed
 * foods, synthesize a single option from them so option-satisfaction still applies.
 */
function flattenOptions(templates: MealTemplate[]): {
  options: FlatOption[];
  disallowed: string[];
} {
  const options: FlatOption[] = [];
  const disallowed = new Set<string>();
  let counter = 0;

  for (const t of templates) {
    (t.disallowed_foods || []).forEach((d) => disallowed.add(d));

    const hasOptions = t.options && t.options.length > 0;
    if (hasOptions) {
      for (const o of t.options) {
        const hasContent =
          (o.foods && o.foods.length > 0) ||
          (o.components && o.components.length > 0);
        if (!hasContent) continue;
        counter += 1;
        options.push({
          number: counter,
          description: o.description || `Option ${counter}`,
          foods: o.foods || [],
          components: o.components || [],
        });
      }
    } else if (
      (t.required_foods && t.required_foods.length > 0) ||
      (t.allowed_foods && t.allowed_foods.length > 0)
    ) {
      // Synthesize an option from legacy required/allowed foods.
      counter += 1;
      const components: OptionComponent[] = (t.required_foods || []).map(
        (name) => ({ name, required: true, weight: 1 })
      );
      options.push({
        number: counter,
        description:
          t.required_foods && t.required_foods.length > 0
            ? `Required: ${t.required_foods.join(", ")}`
            : `Allowed: ${(t.allowed_foods || []).join(", ")}`,
        foods: [...(t.required_foods || []), ...(t.allowed_foods || [])],
        components,
      });
    }
  }

  return { options, disallowed: [...disallowed] };
}

// ============================================================================
// Prompt building
// ============================================================================

function buildTemplateContext(
  mealType: string,
  options: FlatOption[],
  disallowed: string[]
): string {
  if (options.length === 0) {
    return `No specific meal plan found for ${mealType}. Assess the plate against general healthy-eating principles; there are no plan options to satisfy.`;
  }

  const optionsText = options
    .map((o) => {
      const components =
        o.components.length > 0
          ? o.components
              .map((c) => {
                const tag = c.required ? "required" : "optional";
                const examples =
                  c.examples && c.examples.length > 0
                    ? ` (e.g. ${c.examples.join(", ")})`
                    : "";
                return `      - [${tag}] ${c.name}${examples}`;
              })
              .join("\n")
          : `      - (foods: ${o.foods.join(", ") || "any"})`;
      return `  Option ${o.number}: ${o.description}\n    Components:\n${components}`;
    })
    .join("\n");

  const disallowedText =
    disallowed.length > 0
      ? `\nDisallowed foods (never allowed, penalise if present): ${disallowed.join(", ")}`
      : "";

  return `Meal plan for ${mealType}. The plate should satisfy the components of ONE option (whichever it best matches):\n${optionsText}${disallowedText}`;
}

/**
 * Food names stay in English so they keep matching the plan's own vocabulary,
 * which is stored in English. Everything the user reads as prose is written in
 * their own language.
 */
function buildResponseSchema(languageName: string): string {
  return `Return JSON (do NOT include a score field — the score is computed separately):
{
  "bestOptionNumber": <number of the option the plate best matches, or null if no options>,
  "components": [
    {
      "name": "component name from the chosen option, copied verbatim in English",
      "required": true,
      "satisfaction": 0.0-1.0,
      "matchedFood": "food from the photo that satisfies it, or null",
      "evidence": "what is actually visible that supports (or fails) this component, written in ${languageName}"
    }
  ],
  "detectedFoods": [
    { "name": "food name in English", "matchType": "on_plan" | "addon" | "off_plan" | "disallowed", "confidence": 0.0-1.0, "component": "component name it satisfies, or null" }
  ],
  "feedback": "1-2 sentence specific, honest feedback written in ${languageName} about how the meal aligns with the plan",
  "confidence": "high" | "medium" | "low",
  "photoQuality": "clear" | "partial" | "poor",
  "assumptions": ["anything you inferred rather than clearly saw, written in ${languageName}"],
  "planNotes": ["problems with the plan itself: vague option, missing quantity, ambiguous or likely-mistranslated term — written in ${languageName}"],
  "suggestedSwaps": [
    { "original": "off-plan or disallowed food", "suggested": ["plan-aligned alternative 1", "alternative 2"], "reason": "short reason written in ${languageName}" }
  ]
}

LANGUAGE: every human-readable sentence ("feedback", "evidence", "assumptions",
"planNotes", "reason") MUST be written in ${languageName}. Food and component
names stay in English so they keep matching the plan.`;
}

const CLASSIFICATION_RULES = `Be a CRITICAL, evidence-based reviewer. Judge only what is visible; do not give the benefit of the doubt.

Scoring each component (field "satisfaction", 0.0-1.0):
- 1.0 = the component is clearly present in an adequate portion for the plan's requirement.
- ~0.5 = present but uncertain, partly obscured, or the portion looks insufficient (e.g. plan asks for "half plate of vegetables" but only a garnish is visible).
- 0.0 = not visible / absent.
- NEVER assume hidden or unseen ingredients ("there is probably protein under the sauce" is NOT allowed — if you cannot see it, satisfaction is low). Judge PORTION/QUANTITY against the requirement, not just presence.
- Put what you actually see in "evidence"; put anything you inferred in "assumptions".
- Lower "confidence" and set "photoQuality" to "partial"/"poor" when the image is blurry, cropped, or ambiguous.

Option & food classification:
- Choose the single option the plate best matches (bestOptionNumber). When options exist you MUST pick the closest one (never null), even if the plate matches it poorly. List that option's components in "components".
- STRICT MATCHING: a food satisfies a component ONLY if it is genuinely one of that component's example foods. Do NOT stretch a component to fit an unrelated food. Cereal grains (rice, pasta, bread, couscous, oats) are NOT legumes/pulses, NOT vegetables, and NOT protein. If a food is not clearly part of any option's components, it is "off_plan".
- matchType for each detected food: "on_plan" (satisfies a component; set "component"), "addon" (plan explicitly marks optional; do not invent add-ons), "off_plan" (not part of any option), "disallowed" (in the disallowed list).
- A food that belongs to a DIFFERENT option of the same meal is still "off_plan" for the chosen option — the plan's options are alternatives, not a buffet — but say so in "feedback" so the user understands they mixed two options rather than ate something outside the plan.
- Be critical of the PLAN too: if an option is vague, lacks quantities, or contains a term that looks mistranslated (e.g. an English cereal word like "grains" listed among legumes may be Portuguese "grão" = chickpeas), record it in "planNotes" — do not silently trust the plan text.
- Only suggest swaps for off_plan or disallowed foods.
- If there are no plan options, return bestOptionNumber: null and an empty components array; classify foods as on_plan (generally healthy) or off_plan.`;

// ============================================================================
// Vision Analysis
// ============================================================================

async function analyzeWithVision(
  imageUrl: string,
  mealType: string,
  options: FlatOption[],
  disallowed: string[],
  openaiApiKey: string,
  languageName: string
): Promise<AnalyzeMealResponse> {
  const templateContext = buildTemplateContext(mealType, options, disallowed);

  const systemPrompt = `You are a nutrition wellness coach. Analyze meal photos to help users understand how well their meals align with their personal wellness goals.

${templateContext}

${buildResponseSchema(languageName)}

${CLASSIFICATION_RULES}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please analyze this ${mealType} photo against my nutrition plan. Write all prose in ${languageName}.`,
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 1000,
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

  return computeResult(raw, options);
}

// ============================================================================
// Deterministic scoring (option satisfaction with partial credit)
// ============================================================================

function componentWeight(c: { required?: boolean; weight?: number }): number {
  if (typeof c.weight === "number") return c.weight;
  return c.required ? 1 : 0;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const LEGUME_WORDS = ["bean", "lentil", "pea", "chickpea", "fava", "legume"];

/** Heuristic: flag an English cereal word ("grain(s)") sitting among legumes — a
 * common mistranslation of Portuguese "grão" (chickpeas). Critical of the PLAN. */
function detectPlanNotes(options: FlatOption[]): string[] {
  for (const o of options) {
    const haystack = [
      o.description,
      ...o.foods,
      ...o.components.flatMap((c) => [c.name, ...(c.examples ?? [])]),
    ]
      .join(" ")
      .toLowerCase();
    const hasGrain = /\bgrains?\b/.test(haystack);
    const hasLegume = LEGUME_WORDS.some((w) => haystack.includes(w));
    if (hasGrain && hasLegume) {
      return [
        'Your plan lists "grains" alongside legumes — this may be a mistranslation of "grão" (chickpeas). If so, cereals like rice are NOT allowed. Please confirm or fix your plan.',
      ];
    }
  }
  return [];
}

function downgradeConfidence(
  base: "high" | "medium" | "low",
  photoQuality: PhotoQuality
): "high" | "medium" | "low" {
  if (photoQuality === "poor") return "low";
  if (photoQuality === "partial") return base === "high" ? "medium" : base;
  return base;
}

function computeResult(
  raw: Record<string, unknown>,
  options: FlatOption[]
): AnalyzeMealResponse {
  const hasPlan = options.length > 0;
  const bestOptionNumber = raw.bestOptionNumber as number | null | undefined;
  const picked =
    typeof bestOptionNumber === "number"
      ? options.find((o) => o.number === bestOptionNumber) ?? null
      : null;
  // If the plan has options but the model matched none, still evaluate against the
  // first option's required components (so a non-matching plate scores low, not high).
  const chosen: FlatOption | null = picked ?? (hasPlan ? options[0] : null);

  const detectedFoods = ((raw.detectedFoods ?? []) as Array<{
    name: string;
    matchType?: MatchType;
    confidence?: number;
    component?: string | null;
  }>).map((f) => {
    const matchType: MatchType = f.matchType ?? "off_plan";
    return {
      name: f.name,
      matchType,
      confidence: f.confidence ?? 0.5,
      component: f.component ?? undefined,
      matched: matchType === "on_plan" || matchType === "addon",
    };
  });

  const modelComponents = (raw.components ?? []) as Array<{
    name: string;
    required?: boolean;
    satisfaction?: number;
    present?: boolean;
    matchedFood?: string | null;
    evidence?: string | null;
  }>;

  // Credit for a component: the model's 0..1 satisfaction (partial credit for
  // uncertain/insufficient evidence), falling back to a matched food or present flag.
  const creditFor = (
    modelComp: (typeof modelComponents)[number] | undefined,
    hasFoodMatch: boolean
  ): number => {
    if (modelComp && typeof modelComp.satisfaction === "number") {
      return clamp01(modelComp.satisfaction);
    }
    if (modelComp?.present || hasFoodMatch) return 1;
    return 0;
  };

  // Canonical components come from the CHOSEN PLAN OPTION when it defines them, so
  // required slots (e.g. protein, vegetables) are always evaluated even if the model
  // under-reports them.
  const planComps = chosen?.components ?? [];
  let components: MealComponentResult[];
  if (planComps.length > 0) {
    components = planComps.map((pc) => {
      const modelComp = modelComponents.find(
        (mc) => mc.name.toLowerCase() === pc.name.toLowerCase()
      );
      const foodMatch = detectedFoods.find(
        (f) =>
          f.matchType === "on_plan" &&
          (f.component ?? "").toLowerCase() === pc.name.toLowerCase()
      );
      const satisfaction = creditFor(modelComp, Boolean(foodMatch));
      return {
        name: pc.name,
        required: pc.required,
        satisfaction,
        present: satisfaction >= 0.5,
        matchedFood: foodMatch?.name ?? modelComp?.matchedFood ?? undefined,
        evidence: modelComp?.evidence ?? undefined,
        weight: componentWeight(pc),
      };
    });
  } else {
    // Plan option has no structured components (legacy plans): trust the model's list.
    components = modelComponents.map((c) => {
      const required = c.required ?? true;
      const satisfaction = creditFor(c, false);
      return {
        name: c.name,
        required,
        satisfaction,
        present: satisfaction >= 0.5,
        matchedFood: c.matchedFood ?? undefined,
        evidence: c.evidence ?? undefined,
        weight: required ? 1 : 0,
      };
    });
  }

  // Satisfaction = weighted, confidence-scaled fraction of required components.
  const requiredComponents = components.filter((c) => c.required);
  const denom = requiredComponents.reduce((sum, c) => sum + (c.weight ?? 1), 0);
  const numer = requiredComponents.reduce(
    (sum, c) => sum + (c.weight ?? 1) * c.satisfaction,
    0
  );
  const satisfaction = denom > 0 ? numer / denom : 1;

  const offPlan = detectedFoods
    .filter((f) => f.matchType === "off_plan")
    .map((f) => f.name);
  const disallowed = detectedFoods
    .filter((f) => f.matchType === "disallowed")
    .map((f) => f.name);

  const offPlanPenalty = Math.min(30, offPlan.length * 10);
  const disallowedPenalty = Math.min(40, disallowed.length * 20);

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(satisfaction * 100 - offPlanPenalty - disallowedPenalty)
    )
  );

  const missingRequired = requiredComponents
    .filter((c) => !c.present)
    .map((c) => c.name);

  const photoQuality: PhotoQuality =
    raw.photoQuality === "poor" || raw.photoQuality === "partial"
      ? raw.photoQuality
      : "clear";
  const modelConfidence =
    (raw.confidence as "high" | "medium" | "low") ?? "medium";

  const planNotes = [
    ...((raw.planNotes as string[]) ?? []),
    ...detectPlanNotes(options),
  ];

  return {
    score,
    bestOption: chosen
      ? { number: chosen.number, description: chosen.description }
      : null,
    components,
    detectedFoods,
    offPlan,
    disallowed,
    missingRequired,
    feedback: (raw.feedback as string) ?? "",
    confidence: modelConfidence,
    photoQuality,
    assumptions: (raw.assumptions as string[]) ?? [],
    planNotes,
    analysisConfidence: downgradeConfidence(modelConfidence, photoQuality),
    suggestedSwaps:
      (raw.suggestedSwaps as AnalyzeMealResponse["suggestedSwaps"]) ?? [],
  };
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { imageUrl, mealType, userId, planId, language }: AnalyzeMealRequest =
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

    const templates = await fetchMealTemplates(
      supabase,
      userId,
      mealType,
      planId
    );
    const { options, disallowed } = flattenOptions(templates);
    console.log(
      `Found ${templates.length} template(s), ${options.length} option(s) for ${mealType}`
    );

    // Transparency: if a reference was resolved, the returned templates carry the
    // referenced meal's type. Surface that to the user rather than doing it silently.
    const resolvedType = templates[0]?.type;
    const referenceNote =
      resolvedType && resolvedType !== mealType
        ? `Scored against your ${resolvedType} rules because your ${mealType} plan says to follow them.`
        : null;

    const analysisResult = await analyzeWithVision(
      imageUrl,
      mealType,
      options,
      disallowed,
      openaiApiKey,
      resolveLanguageName(language)
    );

    if (referenceNote) {
      analysisResult.planNotes = [referenceNote, ...analysisResult.planNotes];
    }

    console.log(
      `Analysis complete — score: ${analysisResult.score}, option: ${analysisResult.bestOption?.number ?? "none"}, confidence: ${analysisResult.analysisConfidence}`
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
