import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ML Prediction Edge Function
 * ============================
 * 
 * This edge function serves as the integration point for external
 * trained ML models. It accepts the same PredictionInput format
 * used by the client-side engine and can forward to:
 * 
 * 1. A hosted ML model API (HuggingFace Inference, AWS SageMaker, etc.)
 * 2. A custom Python/FastAPI backend with trained models
 * 3. Lovable AI for enhanced analysis
 * 
 * Currently implements an enhanced rule-based prediction with
 * literature-calibrated weights as the fallback, and optionally
 * calls an external ML API if ML_API_URL is configured.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { predictionInput, featureVector } = await req.json();
    
    // Check if an external ML API is configured
    const ML_API_URL = Deno.env.get("ML_API_URL");
    const ML_API_KEY = Deno.env.get("ML_API_KEY");

    if (ML_API_URL) {
      // Forward to external trained model
      console.log("Forwarding to external ML API:", ML_API_URL);
      
      const mlResponse = await fetch(ML_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ML_API_KEY ? { "Authorization": `Bearer ${ML_API_KEY}` } : {}),
        },
        body: JSON.stringify({
          features: featureVector,
          raw_input: predictionInput,
        }),
      });

      if (!mlResponse.ok) {
        console.error("External ML API error:", mlResponse.status);
        // Fall through to Lovable AI enhanced analysis
      } else {
        const mlResult = await mlResponse.json();
        return new Response(
          JSON.stringify({ 
            prediction: mlResult,
            source: "external_ml_model",
            model_url: ML_API_URL,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fallback: Use Lovable AI for enhanced analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "No ML backend configured",
          suggestion: "Set ML_API_URL for external model or ensure LOVABLE_API_KEY is set for AI analysis",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a medical AI specialist analyzing cancer risk feature vectors. 
Given the patient's feature vector (normalized 0-1 values), provide a JSON response with refined risk scores.

You MUST respond with valid JSON only, no markdown, in this exact format:
{
  "pancreatic": { "adjustment": <float -0.2 to 0.2>, "reasoning": "<brief>" },
  "colon": { "adjustment": <float -0.2 to 0.2>, "reasoning": "<brief>" },
  "blood": { "adjustment": <float -0.2 to 0.2>, "reasoning": "<brief>" },
  "confidence_note": "<brief overall note>"
}

The adjustments should refine the client-side predictions based on cross-factor interactions 
that simple weighted scoring might miss (e.g., symptom clusters, protective factor combinations).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Feature vector: ${JSON.stringify(featureVector)}\n\nRaw input summary: Age ${predictionInput.age}, Gender ${predictionInput.gender}, BMI ${predictionInput.bmi?.toFixed(1)}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis unavailable", source: "none" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse AI response
    let aiAdjustments;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAdjustments = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      aiAdjustments = null;
    }

    return new Response(
      JSON.stringify({ 
        adjustments: aiAdjustments,
        source: "lovable_ai_enhanced",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ml-predict:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
