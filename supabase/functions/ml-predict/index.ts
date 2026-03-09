import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ML Prediction Edge Function v3.0
 * ==================================
 * 
 * Enhanced with duration context, cluster data, and tumor markers.
 * Uses Lovable AI (Gemini) for cross-factor interaction analysis.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    
    // Check for external ML API
    const ML_API_URL = Deno.env.get("ML_API_URL");
    const ML_API_KEY = Deno.env.get("ML_API_KEY");

    if (ML_API_URL) {
      console.log("Forwarding to external ML API:", ML_API_URL);
      const mlResponse = await fetch(ML_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ML_API_KEY ? { "Authorization": `Bearer ${ML_API_KEY}` } : {}),
        },
        body: JSON.stringify({ features: featureVector, raw_input: predictionInput }),
      });

      if (mlResponse.ok) {
        const mlResult = await mlResponse.json();
        return new Response(
          JSON.stringify({ prediction: mlResult, source: "external_ml_model", model_url: ML_API_URL }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("External ML API error:", mlResponse.status);
    }

    // Lovable AI enhanced analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "No ML backend configured", source: "none" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build rich context for AI
    const symptomDurations = [];
    if (predictionInput.fatigueDuration) symptomDurations.push(`fatigue: ${predictionInput.fatigueDuration}`);
    if (predictionInput.weightLossDuration) symptomDurations.push(`weight loss: ${predictionInput.weightLossDuration}`);
    if (predictionInput.jaundiceDuration) symptomDurations.push(`jaundice: ${predictionInput.jaundiceDuration}`);
    if (predictionInput.bloodInStoolDuration) symptomDurations.push(`blood in stool: ${predictionInput.bloodInStoolDuration}`);
    if (predictionInput.infectionsDuration) symptomDurations.push(`infections: ${predictionInput.infectionsDuration}`);

    const tumorMarkers = [];
    if (predictionInput.ca199 !== undefined) tumorMarkers.push(`CA 19-9: ${predictionInput.ca199} U/mL`);
    if (predictionInput.cea !== undefined) tumorMarkers.push(`CEA: ${predictionInput.cea} ng/mL`);
    if (predictionInput.ldh !== undefined) tumorMarkers.push(`LDH: ${predictionInput.ldh} U/L`);

    const systemPrompt = `You are a medical AI specialist analyzing cancer risk feature vectors for pancreatic, colon, and blood cancers.

Given the patient's feature vector (normalized 0-1 values), symptom durations, and tumor markers, provide a JSON response with refined risk score adjustments.

Consider cross-factor interactions that simple weighted scoring might miss:
- Symptom clusters (e.g., jaundice + weight loss + back pain for pancreatic)
- Duration-symptom severity escalation
- Protective factor combinations
- Tumor marker significance in context of other findings
- Gender and age-specific epidemiological patterns

You MUST respond with valid JSON only, no markdown, in this exact format:
{
  "pancreatic": { "adjustment": <float -0.15 to 0.15>, "reasoning": "<brief>" },
  "colon": { "adjustment": <float -0.15 to 0.15>, "reasoning": "<brief>" },
  "blood": { "adjustment": <float -0.15 to 0.15>, "reasoning": "<brief>" },
  "confidence_note": "<brief overall note>"
}

Keep adjustments conservative (-0.15 to 0.15) as the client-side engine already applies cluster boosts and duration weighting.`;

    const userContent = [
      `Feature vector: ${JSON.stringify(featureVector)}`,
      `Patient: Age ${predictionInput.age}, Gender ${predictionInput.gender}, BMI ${predictionInput.bmi?.toFixed(1)}`,
      symptomDurations.length > 0 ? `Symptom durations: ${symptomDurations.join(', ')}` : 'No symptom duration data',
      tumorMarkers.length > 0 ? `Tumor markers: ${tumorMarkers.join(', ')}` : 'No tumor marker data',
      `Smoking: ${predictionInput.smoking}, Alcohol: ${predictionInput.alcohol}`,
      `Family cancer history: ${predictionInput.familyCancerHistory ? 'Yes' : 'No'}`,
    ].join('\n');

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
          { role: "user", content: userContent },
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

    let aiAdjustments;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAdjustments = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      aiAdjustments = null;
    }

    return new Response(
      JSON.stringify({ adjustments: aiAdjustments, source: "lovable_ai_enhanced" }),
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
