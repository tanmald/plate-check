import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ExtractIngredientsRequest {
  mealName: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  planConstraints?: {
    allowedFoods?: string[];
    caloriesRange?: string;
  };
}

interface Ingredient {
  name: string;
  quantity: string;
  category: string;
}

interface ExtractIngredientsResponse {
  ingredients: Ingredient[];
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { mealName, mealType, planConstraints }: ExtractIngredientsRequest = await req.json();

    if (!mealName || !mealType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: mealName, mealType" }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
      );
    }

    const constraintsContext = planConstraints?.allowedFoods?.length
      ? `\nThe nutrition plan allows: ${planConstraints.allowedFoods.join(", ")}.`
      : "";

    const prompt = `You are a nutrition assistant helping to extract a shopping list from a meal name.

Meal: "${mealName}" (${mealType})${constraintsContext}

Extract the main ingredients needed to prepare this meal for 1-2 people. Return a JSON array of ingredients with:
- name: ingredient name in Portuguese (e.g., "salmão", "quinoa", "brócolos")
- quantity: typical quantity for 1-2 people (e.g., "200g", "1 un", "80g", or "" if not applicable)
- category: one of "Peixe & Marisco", "Carnes", "Legumes", "Fruta", "Lacticínios", "Cereais & Leguminosas", "Condimentos & Ervas", "Outros"

Return only the JSON array, no explanation. Example:
[{"name":"salmão","quantity":"200g","category":"Peixe & Marisco"},{"name":"quinoa","quantity":"80g","category":"Cereais & Leguminosas"}]`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content?.trim();

    let ingredients: Ingredient[];
    try {
      ingredients = JSON.parse(content);
    } catch {
      throw new Error("Failed to parse OpenAI response as JSON");
    }

    const response: ExtractIngredientsResponse = { ingredients };

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS_HEADERS } }
    );
  }
});
