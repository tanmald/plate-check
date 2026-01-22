import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { extractText } from "unpdf";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

// ============================================================================
// Type Definitions
// ============================================================================

interface ParsePlanRequest {
  fileUrl: string;
  userId: string;
  fileType: "pdf" | "image" | "text";
}

interface MealOption {
  number: number;
  description: string;
  foods: string[];
}

interface MealTemplate {
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

interface ParsePlanResponse {
  planId: string;
  planName: string;
  mealTemplates: MealTemplate[];
  confidence: "high" | "medium" | "low";
  warnings?: string[];
}

interface OpenAIParsedPlan {
  planName: string;
  meals: Array<{
    mealType: "breakfast" | "lunch" | "dinner" | "snack" | "fasting";
    name: string;
    options: Array<{
      number: number;
      description: string;
      foods: string[];
    }>;
    requiredFoods: string[];
    allowedFoods: string[];
    optionalAddons: string[];
    caloriesRange?: string;
    proteinRange?: string;
    isOptional: boolean;
    isPreWorkout: boolean;
    scheduledTime?: string;
    referencesMeal?: string;
    snackTimeCategory?: string;
  }>;
  confidence: "high" | "medium" | "low";
  warnings: string[];
}

// ============================================================================
// Helper Functions: Text Extraction
// ============================================================================

/**
 * Extract text from PDF with fallback to AWS Textract
 */
async function extractPDFText(fileUrl: string): Promise<string> {
  console.log("Extracting text from PDF...");

  try {
    // Fetch PDF file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    // Try local extraction first
    try {
      console.log("Attempting local PDF extraction with unpdf...");
      const text = await extractText(new Uint8Array(arrayBuffer), {
        mergePages: true,
      });

      if (text && text.trim().length > 50) {
        console.log(`PDF extracted locally (${text.length} characters)`);
        return text;
      } else {
        console.log("Local extraction returned insufficient text, falling back to Textract");
        throw new Error("Insufficient text extracted");
      }
    } catch (localError) {
      console.error("Local PDF extraction failed:", localError.message);

      // Fallback to AWS Textract
      console.log("Falling back to AWS Textract...");
      const textractText = await extractWithTextract(arrayBuffer);
      console.log(`PDF extracted with Textract (${textractText.length} characters)`);
      return textractText;
    }
  } catch (error) {
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
}

/**
 * Extract text from DOCX with fallback to AWS Textract
 */
async function extractDOCXText(fileUrl: string): Promise<string> {
  console.log("Extracting text from DOCX...");

  try {
    // Fetch DOCX file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch DOCX: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();

    // Try local extraction first (using docxml or mammoth)
    try {
      console.log("Attempting local DOCX extraction...");

      // Try importing docxml from deno.land/x
      try {
        const { Document } = await import("https://deno.land/x/docxml@v1.0.3/mod.ts");
        const doc = await Document.fromArchive(new Uint8Array(arrayBuffer));
        const text = doc.toString(); // Extract raw text

        if (text && text.trim().length > 50) {
          console.log(`DOCX extracted locally (${text.length} characters)`);
          return text;
        } else {
          throw new Error("Insufficient text extracted");
        }
      } catch (docxmlError) {
        console.error("docxml extraction failed:", docxmlError.message);
        throw docxmlError;
      }
    } catch (localError) {
      console.error("Local DOCX extraction failed:", localError.message);

      // Fallback to AWS Textract
      console.log("Falling back to AWS Textract...");
      const textractText = await extractWithTextract(arrayBuffer);
      console.log(`DOCX extracted with Textract (${textractText.length} characters)`);
      return textractText;
    }
  } catch (error) {
    throw new Error(`Failed to extract DOCX text: ${error.message}`);
  }
}

/**
 * AWS Textract fallback for document text extraction
 */
async function extractWithTextract(documentBuffer: ArrayBuffer): Promise<string> {
  const awsAccessKeyId = Deno.env.get("AWS_ACCESS_KEY_ID");
  const awsSecretAccessKey = Deno.env.get("AWS_SECRET_ACCESS_KEY");
  const awsRegion = Deno.env.get("AWS_REGION") || "us-east-1";

  if (!awsAccessKeyId || !awsSecretAccessKey) {
    throw new Error(
      "PDF/DOCX extraction failed and AWS Textract fallback is not configured. Please either: (1) Upload an image (.jpg or .png) of your nutrition plan instead, or (2) Set up AWS Textract credentials for PDF/DOCX support."
    );
  }

  const client = new TextractClient({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKeyId,
      secretAccessKey: awsSecretAccessKey,
    },
  });

  const command = new DetectDocumentTextCommand({
    Document: {
      Bytes: new Uint8Array(documentBuffer),
    },
  });

  const response = await client.send(command);

  // Combine all detected text blocks
  const text =
    response.Blocks?.filter((block) => block.BlockType === "LINE")
      .map((block) => block.Text)
      .join("\n") || "";

  if (!text || text.trim().length < 50) {
    throw new Error("Textract returned insufficient text");
  }

  return text;
}

// ============================================================================
// Helper Functions: OpenAI Integration
// ============================================================================

/**
 * Parse nutrition plan from image using GPT-4 Vision API
 */
async function parseImageWithVision(
  fileUrl: string,
  openaiApiKey: string
): Promise<OpenAIParsedPlan> {
  console.log("Calling OpenAI Vision API to parse plan image...");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a nutrition plan parser. Extract meal information from nutrition plan images.

CRITICAL PARSING RULES:

1. **Meal Options vs Ingredients**:
   - "options" = Complete numbered meal choices (e.g., "Option 1: Eggs with toast", "1 - Oatmeal with fruit")
   - "allowedFoods" = General ingredient pool / allowed foods across options
   - "optionalAddons" = Items explicitly marked as optional, "if desired", "if hungry"
   - "requiredFoods" = Keep for backward compatibility (foods that must appear)

2. **Numbered Options**: Parse "1 - ", "Option 1:", "Opção 1:", "1.", "1)" as separate options

3. **Optional Meals**: Detect "Optional", "If hungry", "Se tiver fome", "Opcional" → isOptional: true

4. **Meal References**: Detect "same as lunch", "follow rules of [meal]", "igual ao almoço", "manter regras do" → referencesMeal: "[meal name]"

5. **Fasting/Wake-up**: Detect "upon waking", "em jejum", "ao acordar", "fasting" → mealType: "fasting"

6. **Pre-workout**: Detect "Pré Treino", "Pre-workout", "Pré-Treino", "Before workout" → isPreWorkout: true

7. **Meal Times**: Extract HH:MM or "H:MM AM/PM" patterns → scheduledTime

8. **Snack Categories**: Based on time or order → snackTimeCategory: "morning" | "afternoon" | "evening"

Return JSON:
{
  "planName": "string",
  "meals": [
    {
      "mealType": "breakfast" | "lunch" | "dinner" | "snack" | "fasting",
      "name": "string (descriptive name)",
      "options": [
        { "number": 1, "description": "Full option text", "foods": ["food1", "food2"] }
      ],
      "requiredFoods": ["backward compat: key foods that must appear"],
      "allowedFoods": ["ingredient pool / general allowed items"],
      "optionalAddons": ["items marked optional or 'if desired'"],
      "caloriesRange": "string or null",
      "proteinRange": "string or null",
      "isOptional": boolean,
      "isPreWorkout": boolean,
      "scheduledTime": "HH:MM or null",
      "referencesMeal": "meal name or null",
      "snackTimeCategory": "morning" | "afternoon" | "evening" | null
    }
  ],
  "confidence": "high" | "medium" | "low",
  "warnings": ["array of warnings"]
}`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please parse this nutrition plan image and extract the meal information.",
            },
            {
              type: "image_url",
              image_url: {
                url: fileUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI Vision API error:", errorData);
    throw new Error(`OpenAI Vision API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const parsedPlan: OpenAIParsedPlan = JSON.parse(data.choices[0].message.content);

  console.log("Image parsed successfully:", parsedPlan);
  return parsedPlan;
}

/**
 * Parse nutrition plan from extracted text using GPT-4 text API
 */
async function parseTextWithGPT4(
  extractedText: string,
  openaiApiKey: string
): Promise<OpenAIParsedPlan> {
  console.log("Calling OpenAI text API to parse nutrition plan text...");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a nutrition plan parser. Extract meal information from nutrition plan text.

CRITICAL PARSING RULES:

1. **Meal Options vs Ingredients**:
   - "options" = Complete numbered meal choices (e.g., "Option 1: Eggs with toast", "1 - Oatmeal with fruit")
   - "allowedFoods" = General ingredient pool / allowed foods across options
   - "optionalAddons" = Items explicitly marked as optional, "if desired", "if hungry"
   - "requiredFoods" = Keep for backward compatibility (foods that must appear)

2. **Numbered Options**: Parse "1 - ", "Option 1:", "Opção 1:", "1.", "1)" as separate options

3. **Optional Meals**: Detect "Optional", "If hungry", "Se tiver fome", "Opcional" → isOptional: true

4. **Meal References**: Detect "same as lunch", "follow rules of [meal]", "igual ao almoço", "manter regras do" → referencesMeal: "[meal name]"

5. **Fasting/Wake-up**: Detect "upon waking", "em jejum", "ao acordar", "fasting" → mealType: "fasting"

6. **Pre-workout**: Detect "Pré Treino", "Pre-workout", "Pré-Treino", "Before workout" → isPreWorkout: true

7. **Meal Times**: Extract HH:MM or "H:MM AM/PM" patterns → scheduledTime

8. **Snack Categories**: Based on time or order → snackTimeCategory: "morning" | "afternoon" | "evening"

Return JSON:
{
  "planName": "string",
  "meals": [
    {
      "mealType": "breakfast" | "lunch" | "dinner" | "snack" | "fasting",
      "name": "string (descriptive name)",
      "options": [
        { "number": 1, "description": "Full option text", "foods": ["food1", "food2"] }
      ],
      "requiredFoods": ["backward compat: key foods that must appear"],
      "allowedFoods": ["ingredient pool / general allowed items"],
      "optionalAddons": ["items marked optional or 'if desired'"],
      "caloriesRange": "string or null",
      "proteinRange": "string or null",
      "isOptional": boolean,
      "isPreWorkout": boolean,
      "scheduledTime": "HH:MM or null",
      "referencesMeal": "meal name or null",
      "snackTimeCategory": "morning" | "afternoon" | "evening" | null
    }
  ],
  "confidence": "high" | "medium" | "low",
  "warnings": ["array of warnings"]
}`,
        },
        {
          role: "user",
          content: `Please parse this nutrition plan text and extract the meal information:\n\n${extractedText}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("OpenAI text API error:", errorData);
    throw new Error(`OpenAI text API error: ${errorData.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  const parsedPlan: OpenAIParsedPlan = JSON.parse(data.choices[0].message.content);

  console.log("Text parsed successfully:", parsedPlan);
  return parsedPlan;
}

// ============================================================================
// Main Handler
// ============================================================================

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
    const { fileUrl, userId, fileType }: ParsePlanRequest = await req.json();

    console.log("Received request:", { fileUrl: fileUrl.substring(0, 100), userId, fileType });

    // Validate required fields
    if (!fileUrl || !userId || !fileType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: fileUrl, userId, fileType" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Get environment variables
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse plan based on file type
    let parsedPlan: OpenAIParsedPlan;

    try {
      console.log(`Processing ${fileType} file...`);

      if (fileType === "pdf") {
        // Extract text from PDF, then parse with GPT-4
        console.log("Starting PDF extraction...");
        const extractedText = await extractPDFText(fileUrl);
        console.log(`Extracted ${extractedText.length} characters from PDF`);
        parsedPlan = await parseTextWithGPT4(extractedText, openaiApiKey);
      } else if (fileType === "text") {
        // For DOCX files
        console.log("Starting DOCX extraction...");
        const extractedText = await extractDOCXText(fileUrl);
        console.log(`Extracted ${extractedText.length} characters from DOCX`);
        parsedPlan = await parseTextWithGPT4(extractedText, openaiApiKey);
      } else {
        // For images, use Vision API
        console.log("Processing image with Vision API...");
        parsedPlan = await parseImageWithVision(fileUrl, openaiApiKey);
      }
    } catch (parseError) {
      console.error("Error during parsing:", parseError);
      throw new Error(`Failed to parse ${fileType}: ${parseError.message}`);
    }

    // Create meal templates with icons
    const mealIcons: Record<string, string> = {
      breakfast: "☀️",
      lunch: "🌤️",
      dinner: "🌙",
      snack: "🍎",
      fasting: "💧",
    };

    const mealTemplates: MealTemplate[] = parsedPlan.meals.map((meal) => ({
      id: crypto.randomUUID(),
      type: meal.mealType,
      icon: meal.isPreWorkout ? "💪" : mealIcons[meal.mealType] || "🍽️",
      name: meal.name,
      options: meal.options || [],
      requiredFoods: meal.requiredFoods || [],
      allowedFoods: meal.allowedFoods || [],
      optionalAddons: meal.optionalAddons || [],
      calories: meal.caloriesRange || "",
      protein: meal.proteinRange || "",
      isOptional: meal.isOptional || false,
      isPreWorkout: meal.isPreWorkout || false,
      scheduledTime: meal.scheduledTime || null,
      referencesMeal: meal.referencesMeal || null,
      snackTimeCategory: meal.snackTimeCategory || null,
    }));

    // Store in database
    const planId = crypto.randomUUID();

    // 1. Create plan_upload record
    const fileName = fileUrl.split("/").pop() || "unknown";
    const { error: uploadError } = await supabase.from("plan_uploads").insert({
      id: crypto.randomUUID(),
      user_id: userId,
      file_name: fileName,
      file_path: fileUrl,
      status: "parsed",
    });

    if (uploadError) {
      console.error("Error creating plan_upload:", uploadError);
    }

    // 2. Create nutrition_plan record
    const { error: planError } = await supabase.from("nutrition_plans").insert({
      id: planId,
      user_id: userId,
      name: parsedPlan.planName,
      is_active: false, // Will be activated on user confirmation
      confirmed_at: null,
    });

    if (planError) {
      console.error("Error creating nutrition_plan:", planError);
      throw new Error(`Database error: ${planError.message}`);
    }

    // 3. Create meal_template records
    const templateRecords = mealTemplates.map((template) => ({
      id: template.id,
      user_id: userId,
      plan_id: planId,
      type: template.type,
      name: template.name,
      options: template.options,
      required_foods: template.requiredFoods,
      allowed_foods: template.allowedFoods,
      optional_addons: template.optionalAddons,
      is_optional: template.isOptional,
      is_pre_workout: template.isPreWorkout,
      scheduled_time: template.scheduledTime,
      references_meal: template.referencesMeal,
      snack_time_category: template.snackTimeCategory,
      calories_min: template.calories ? parseInt(template.calories.split("-")[0]) : null,
      calories_max: template.calories
        ? parseInt(template.calories.split("-")[1] || template.calories.split("-")[0])
        : null,
      macros: template.protein ? { protein: template.protein } : null,
    }));

    const { error: templatesError } = await supabase
      .from("meal_templates")
      .insert(templateRecords);

    if (templatesError) {
      console.error("Error creating meal_templates:", templatesError);
      throw new Error(`Database error: ${templatesError.message}`);
    }

    // Return response
    const response: ParsePlanResponse = {
      planId,
      planName: parsedPlan.planName,
      mealTemplates,
      confidence: parsedPlan.confidence,
      warnings: parsedPlan.warnings,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in parse-nutrition-plan:", error);
    console.error("Error stack:", error.stack);

    // Return detailed error message
    const errorMessage = error.message || "Internal server error";
    const errorDetails = error.stack ? `\n\nStack: ${error.stack.substring(0, 500)}` : "";

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString()
      }),
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
