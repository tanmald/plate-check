import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Parse request body
    const { imageUrl, mealType, userId, planId }: AnalyzeMealRequest = await req.json();

    // Validate required fields
    if (!imageUrl || !mealType || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: imageUrl, mealType, userId" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // TODO: Integrate with vision model API (e.g., OpenAI GPT-4 Vision, Google Vision AI)
    // TODO: Fetch user's nutrition plan from database
    // TODO: Compare detected foods against plan requirements
    // TODO: Calculate adherence score
    // TODO: Generate feedback and suggested swaps

    // Mock response for now (replace with actual vision model integration)
    const mockResponse: AnalyzeMealResponse = {
      score: 75,
      detectedFoods: [
        { name: "Eggs", matched: true, confidence: 0.95 },
        { name: "Whole grain toast", matched: true, confidence: 0.92 },
        { name: "Butter", matched: false, confidence: 0.88 },
      ],
      feedback:
        "Good protein and whole grain choices. Consider reducing butter for better alignment with your plan.",
      confidence: "high",
      suggestedSwaps: [
        {
          original: "Butter",
          suggested: ["Avocado", "Olive oil", "Nut butter"],
        },
      ],
    };

    return new Response(JSON.stringify(mockResponse), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
