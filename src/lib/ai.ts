/**
 * CANary AI Explanation Engine v2.0
 * ====================================
 * Generates detailed, personalised medical explanations
 * using the prediction engine output — no external API needed.
 *
 * Produces human-readable, clinically-grounded summaries
 * based on risk scores, symptom clusters, lab values,
 * tumor markers, and lifestyle factors.
 */

import { PredictionResult, PredictionInput, CancerRiskResult } from "./predictionEngine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pct = (p: number) => `${Math.round(p * 100)}%`;

const riskSentence = (label: "Low" | "Medium" | "High"): string => {
  if (label === "High")
    return "This is an elevated risk level that warrants prompt medical attention.";
  if (label === "Medium")
    return "This is a moderate risk level — a check-up with your doctor is advisable.";
  return "This is a reassuring result, though regular screening remains important.";
};

const confidenceNote = (conf: "Low" | "Medium" | "High"): string => {
  if (conf === "High") return "The model has high confidence in this estimate due to the completeness of your data.";
  if (conf === "Medium") return "The model has moderate confidence — adding lab values would improve accuracy.";
  return "Confidence is limited due to missing data. Consider providing lab values for a more accurate estimate.";
};

// ─── Per-cancer narrative builder ─────────────────────────────────────────────

const buildPancreaticNarrative = (
  result: CancerRiskResult,
  input: PredictionInput
): string => {
  const lines: string[] = [];
  const p = pct(result.probability);

  lines.push(
    `Your pancreatic cancer risk score is ${p} — categorised as ${result.riskLabel} risk. ` +
    riskSentence(result.riskLabel)
  );

  // Key symptoms
  const symptoms: string[] = [];
  if (input.jaundice) symptoms.push("jaundice");
  if (input.abdominalPain) symptoms.push("abdominal pain");
  if (input.backPain) symptoms.push("back pain");
  if (input.newDiabetes) symptoms.push("newly developed diabetes");
  if (input.floatingStool) symptoms.push("floating stools");
  if (input.nausea) symptoms.push("nausea");
  if (input.weightLoss) symptoms.push("unexplained weight loss");

  if (symptoms.length > 0) {
    lines.push(
      `Relevant symptoms you reported include: ${symptoms.join(", ")}. ` +
      (symptoms.length >= 3
        ? "The co-occurrence of multiple symptoms is clinically significant and increases the specificity of this risk estimate."
        : "Even individual symptoms like these can be early indicators worth discussing with your doctor.")
    );
  }

  // Tumor marker
  if (input.ca199 !== undefined) {
    if (input.ca199 > 200)
      lines.push(`Your CA 19-9 level (${input.ca199} U/mL) is significantly elevated. CA 19-9 above 200 U/mL is a strong marker associated with pancreatic disease and should be evaluated urgently.`);
    else if (input.ca199 > 37)
      lines.push(`Your CA 19-9 level (${input.ca199} U/mL) is above the normal threshold of 37 U/mL. This warrants further investigation alongside your clinical symptoms.`);
    else
      lines.push(`Your CA 19-9 level (${input.ca199} U/mL) is within the normal range, which is a reassuring finding.`);
  }

  // Lifestyle
  if (input.smoking === "regularly" || input.smoking === "chain")
    lines.push("Smoking is one of the strongest modifiable risk factors for pancreatic cancer. Quitting smoking can substantially reduce your long-term risk.");

  if (input.diabetesHistory)
    lines.push("A history of diabetes is associated with increased pancreatic cancer risk, particularly when combined with other symptoms.");

  // Confidence
  lines.push(confidenceNote(result.confidence));

  return lines.join(" ");
};

const buildColonNarrative = (
  result: CancerRiskResult,
  input: PredictionInput
): string => {
  const lines: string[] = [];
  const p = pct(result.probability);

  lines.push(
    `Your colorectal (colon) cancer risk score is ${p} — categorised as ${result.riskLabel} risk. ` +
    riskSentence(result.riskLabel)
  );

  // Key symptoms
  const symptoms: string[] = [];
  if (input.bloodInStool) symptoms.push("blood in stool");
  if (input.constipation) symptoms.push("persistent constipation or bowel changes");
  if (input.narrowStool) symptoms.push("narrow stools");
  if (input.bloating) symptoms.push("abdominal bloating");
  if (input.weightLoss) symptoms.push("unexplained weight loss");

  if (symptoms.length > 0) {
    lines.push(
      `Reported symptoms include: ${symptoms.join(", ")}. ` +
      (input.bloodInStool
        ? "Blood in stool is a particularly important symptom that should never be ignored — please seek medical evaluation promptly."
        : "These symptoms may have non-cancerous causes, but a clinical evaluation is recommended.")
    );
  }

  // Tumor marker
  if (input.cea !== undefined) {
    if (input.cea > 10)
      lines.push(`Your CEA level (${input.cea} ng/mL) is markedly elevated. CEA above 10 ng/mL may indicate colorectal pathology and requires medical follow-up.`);
    else if (input.cea > 5)
      lines.push(`Your CEA level (${input.cea} ng/mL) is mildly elevated above the normal threshold of 5 ng/mL. This should be interpreted alongside your clinical findings.`);
    else
      lines.push(`Your CEA level (${input.cea} ng/mL) is within the normal range, which is a positive finding.`);
  }

  // Lifestyle
  if (input.physicalActivity === "sedentary")
    lines.push("A sedentary lifestyle is a known risk factor for colorectal cancer. Even moderate exercise (30 minutes most days) can meaningfully reduce risk.");

  if (input.diet === "non-vegetarian")
    lines.push("Diets high in processed or red meat are associated with increased colorectal cancer risk. Increasing fibre, fruits, and vegetables is protective.");

  if (input.ibdHistory)
    lines.push("A history of inflammatory bowel disease significantly elevates colorectal cancer risk. Regular colonoscopic surveillance is strongly recommended.");

  // Confidence
  lines.push(confidenceNote(result.confidence));

  return lines.join(" ");
};

const buildBloodNarrative = (
  result: CancerRiskResult,
  input: PredictionInput
): string => {
  const lines: string[] = [];
  const p = pct(result.probability);

  lines.push(
    `Your blood cancer risk score is ${p} — categorised as ${result.riskLabel} risk. ` +
    riskSentence(result.riskLabel)
  );

  // Key symptoms
  const symptoms: string[] = [];
  if (input.fatigue) symptoms.push("persistent fatigue");
  if (input.bruising) symptoms.push("easy bruising");
  if (input.nosebleeds) symptoms.push("frequent nosebleeds");
  if (input.infections) symptoms.push("recurrent infections");
  if (input.bonePain) symptoms.push("bone pain");
  if (input.swollenLymphNodes) symptoms.push("swollen lymph nodes");
  if (input.paleSkin) symptoms.push("pale skin");

  if (symptoms.length > 0) {
    lines.push(
      `Reported symptoms include: ${symptoms.join(", ")}. ` +
      (symptoms.length >= 3
        ? "The combination of multiple blood-related symptoms is notable and suggests a full blood count (FBC) evaluation would be valuable."
        : "While these symptoms can have many causes, they are worth discussing with your doctor, especially if they are persistent.")
    );
  }

  // Lab values
  if (input.wbcCount !== undefined) {
    if (input.wbcCount > 11000)
      lines.push(`Your WBC count (${input.wbcCount.toLocaleString()} cells/µL) is above normal range. Elevated WBC can be associated with infection or haematological conditions.`);
    else if (input.wbcCount < 4000)
      lines.push(`Your WBC count (${input.wbcCount.toLocaleString()} cells/µL) is below normal range, which may indicate immune suppression or bone marrow issues.`);
  }

  if (input.hemoglobin !== undefined && input.hemoglobin < 12)
    lines.push(`Your haemoglobin level (${input.hemoglobin} g/dL) is below the normal threshold. Anaemia can be associated with certain blood cancers and should be investigated.`);

  if (input.plateletCount !== undefined && input.plateletCount < 150000)
    lines.push(`Your platelet count (${input.plateletCount.toLocaleString()}) is below normal. Low platelets (thrombocytopenia) can be associated with haematological conditions.`);

  // Tumor marker
  if (input.ldh !== undefined) {
    if (input.ldh > 500)
      lines.push(`Your LDH level (${input.ldh} U/L) is significantly elevated. High LDH is associated with lymphoma and leukaemia and should be evaluated urgently.`);
    else if (input.ldh > 280)
      lines.push(`Your LDH level (${input.ldh} U/L) is mildly elevated above the normal upper limit of 280 U/L. This may warrant follow-up.`);
  }

  // Confidence
  lines.push(confidenceNote(result.confidence));

  return lines.join(" ");
};

// ─── Overall Summary ──────────────────────────────────────────────────────────

const buildOverallSummary = (
  result: PredictionResult,
  input: PredictionInput
): string => {
  const labels = [
    result.pancreatic.riskLabel,
    result.colon.riskLabel,
    result.blood.riskLabel,
  ];

  const highCount  = labels.filter(l => l === "High").length;
  const medCount   = labels.filter(l => l === "Medium").length;
  const highTypes  = ["Pancreatic", "Colon", "Blood"].filter(
    (_, i) => labels[i] === "High"
  );
  const medTypes   = ["Pancreatic", "Colon", "Blood"].filter(
    (_, i) => labels[i] === "Medium"
  );

  const lines: string[] = [];

  // Opening
  lines.push(
    `Hello. Based on your CANary assessment completed on ${new Date().toLocaleDateString()}, ` +
    `here is a summary of your personalised cancer risk profile.`
  );

  // Overall picture
  if (highCount === 0 && medCount === 0) {
    lines.push(
      "Overall, your results are reassuring — all three cancer types show low estimated risk based on the information provided. " +
      "This is a positive outcome, and maintaining your current healthy habits will continue to serve you well."
    );
  } else if (highCount > 0) {
    lines.push(
      `Your assessment has identified elevated risk for ${highTypes.join(" and ")} cancer${highCount > 1 ? "s" : ""}. ` +
      "This does not mean you have cancer — it means your risk profile warrants prompt medical attention and further clinical evaluation."
    );
  } else {
    lines.push(
      `Your assessment shows moderate risk for ${medTypes.join(" and ")} cancer${medCount > 1 ? "s" : ""}. ` +
      "A consultation with your doctor is advisable to discuss these findings and determine if further screening is appropriate."
    );
  }

  // Top protective factors
  const protective = result.rankedFactors
    .filter(f => f.impact === "decreases")
    .slice(0, 2)
    .map(f => f.name.toLowerCase());

  if (protective.length > 0) {
    lines.push(
      `On the positive side, your ${protective.join(" and ")} ${protective.length > 1 ? "are" : "is"} working in your favour.`
    );
  }

  // Top risk factors
  const risks = result.rankedFactors
    .filter(f => f.impact === "increases")
    .slice(0, 3)
    .map(f => f.name.toLowerCase());

  if (risks.length > 0) {
    lines.push(
      `The primary factors contributing to your risk include: ${risks.join(", ")}. ` +
      "Addressing modifiable factors like lifestyle and diet can reduce long-term risk."
    );
  }

  // Age note
  if (input.age >= 50) {
    lines.push(
      "As you are aged 50 or above, regular cancer screening (colonoscopy, blood tests) is particularly important regardless of symptoms."
    );
  }

  // Final note
  lines.push(
    "Remember: CANary is a screening support tool, not a diagnostic system. " +
    "Please share these results with a qualified healthcare provider who can interpret them in the context of your full medical history."
  );

  return lines.join(" ");
};

// ─── Public API ───────────────────────────────────────────────────────────────

export interface AIExplanationResult {
  overall: string;
  pancreatic: string;
  colon: string;
  blood: string;
}

/**
 * Generates detailed AI-style explanations for all three cancer types
 * using only local prediction engine data — no API calls required.
 */
export const generateAIExplanation = async (
  result: PredictionResult,
  input: PredictionInput
): Promise<AIExplanationResult> => {
  // Small artificial delay so UI can show a "generating..." state
  await new Promise(res => setTimeout(res, 600));

  return {
    overall:     buildOverallSummary(result, input),
    pancreatic:  buildPancreaticNarrative(result.pancreatic, input),
    colon:       buildColonNarrative(result.colon, input),
    blood:       buildBloodNarrative(result.blood, input),
  };
};

/**
 * Legacy single-string wrapper for backwards compatibility
 * (used by any component that calls generateAIExplanation without args)
 */
export const generateAIExplanationLegacy = async (): Promise<string> => {
  return "AI explanation not available — please provide prediction result and input data.";
};
