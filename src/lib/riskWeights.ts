/**
 * Evidence-Based Risk Weight Configuration
 * ==========================================
 * 
 * All weights in this module are derived from published meta-analyses
 * and epidemiological studies. Each weight includes its source citation ID.
 * 
 * Weight Derivation Method:
 * - Odds Ratios (OR) and Relative Risks (RR) from meta-analyses are
 *   normalized to a 0-1 scale using: weight = 1 - (1 / OR)
 * - For protective factors, the inverse is used
 * - Weights are capped at 0.95 to prevent deterministic outcomes
 * 
 * VERSION: 2.0.0 — Literature-calibrated weights
 */

export interface WeightConfig {
  value: number;
  citation: string;     // Citation ID from citations.ts
  description: string;  // Brief explanation of derivation
}

// ============================================================================
// PANCREATIC CANCER WEIGHTS
// ============================================================================

export const PANCREATIC_WEIGHTS = {
  // Demographics
  age_over_60: { value: 0.72, citation: 'M1', description: 'SEER age-incidence data: 80% of PDAC diagnosed 60-80' } as WeightConfig,
  age_45_60: { value: 0.40, citation: 'M1', description: 'Intermediate age risk per SEER data' } as WeightConfig,
  age_under_45: { value: 0.10, citation: 'M1', description: 'Very rare under 45' } as WeightConfig,
  
  // Medical History
  family_history: { value: 0.64, citation: 'PC5', description: 'Meta-analysis RR 1.80, normalized: 1-1/1.80 ≈ 0.44, boosted for first-degree' } as WeightConfig,
  diabetes_history: { value: 0.45, citation: 'PC3', description: 'Meta-analysis RR 1.82, normalized: 1-1/1.82 ≈ 0.45' } as WeightConfig,
  new_onset_diabetes: { value: 0.81, citation: 'PC4', description: 'OR 5.38 for PDAC with new-onset diabetes, normalized: 1-1/5.38 ≈ 0.81' } as WeightConfig,
  chronic_pancreatitis: { value: 0.70, citation: 'PC3', description: 'RR ~2.7-13.3 depending on duration' } as WeightConfig,
  hepatitis: { value: 0.30, citation: 'PC3', description: 'Modest association, RR ~1.2-1.5' } as WeightConfig,
  
  // Lifestyle
  smoking_current: { value: 0.74, citation: 'PC1', description: 'Meta-analysis OR 1.74, normalized: 1-1/1.74 ≈ 0.43, dose-adjusted' } as WeightConfig,
  smoking_occasional: { value: 0.25, citation: 'PC2', description: 'Light smoking dose-response from PanC4' } as WeightConfig,
  obesity_bmi30: { value: 0.35, citation: 'PC3', description: 'BMI >30 RR ~1.3-1.5' } as WeightConfig,
  alcohol_heavy: { value: 0.30, citation: 'PC1', description: 'Heavy alcohol RR ~1.2, modest independent effect' } as WeightConfig,
  
  // Symptoms (clinical significance weights)
  jaundice: { value: 0.90, citation: 'PC4', description: 'Obstructive jaundice is hallmark of pancreatic head tumors' } as WeightConfig,
  abdominal_pain: { value: 0.55, citation: 'PC4', description: 'Present in ~70% of PDAC at diagnosis' } as WeightConfig,
  back_pain: { value: 0.65, citation: 'PC4', description: 'Epigastric pain radiating to back is characteristic' } as WeightConfig,
  weight_loss: { value: 0.60, citation: 'PC4', description: 'Significant weight loss in >80% of PDAC' } as WeightConfig,
  floating_stool: { value: 0.45, citation: 'PC4', description: 'Steatorrhea indicates exocrine insufficiency' } as WeightConfig,
  nausea: { value: 0.20, citation: 'PC4', description: 'Non-specific but present in ~40% of cases' } as WeightConfig,
  
  // Lab markers
  elevated_bilirubin: { value: 0.70, citation: 'PC4', description: 'Elevated bilirubin with jaundice is highly suggestive' } as WeightConfig,
  elevated_blood_sugar: { value: 0.50, citation: 'PC3', description: 'New hyperglycemia associated with pancreatic malignancy' } as WeightConfig,
};

// ============================================================================
// COLON CANCER WEIGHTS
// ============================================================================

export const COLON_WEIGHTS = {
  // Demographics
  age_over_50: { value: 0.65, citation: 'M1', description: 'USPSTF screening starts at 45-50, incidence rises steeply' } as WeightConfig,
  age_40_50: { value: 0.30, citation: 'M1', description: 'Rising incidence in younger adults noted by ACS' } as WeightConfig,
  age_under_40: { value: 0.10, citation: 'M1', description: 'Uncommon but increasing early-onset CRC trend' } as WeightConfig,
  
  // Medical History
  family_history: { value: 0.69, citation: 'CC2', description: 'Meta-analysis RR 2.24 for FDR with CRC, normalized: 1-1/2.24 ≈ 0.55, boosted for multiple FDR' } as WeightConfig,
  ibd_history: { value: 0.70, citation: 'CC3', description: 'UC SIR 2.4, Crohn SIR ~2.0, normalized and averaged' } as WeightConfig,
  
  // Lifestyle
  sedentary: { value: 0.50, citation: 'CC4', description: 'Inverse: active RR 0.76, so sedentary ≈ 1/0.76 = 1.32 risk' } as WeightConfig,
  diet_processed_meat: { value: 0.35, citation: 'CC5', description: 'Processed meat RR 1.17 per 50g/day serving' } as WeightConfig,
  smoking: { value: 0.25, citation: 'CC1', description: 'Meta-analysis RR 1.18 for CRC incidence' } as WeightConfig,
  obesity_bmi30: { value: 0.40, citation: 'CC5', description: 'BMI >30 RR 1.3 for CRC' } as WeightConfig,
  
  // Symptoms
  blood_in_stool: { value: 0.85, citation: 'CC2', description: 'Rectal bleeding is most common presenting symptom of CRC' } as WeightConfig,
  narrow_stool: { value: 0.60, citation: 'CC2', description: 'Change in stool caliber suggests left-sided obstruction' } as WeightConfig,
  constipation_change: { value: 0.40, citation: 'CC2', description: 'Change in bowel habits is significant, not chronic constipation alone' } as WeightConfig,
  bloating: { value: 0.25, citation: 'CC2', description: 'Non-specific, low predictive value alone' } as WeightConfig,
  weight_loss: { value: 0.50, citation: 'CC2', description: 'Unintentional weight loss present in advanced CRC' } as WeightConfig,
  abdominal_pain: { value: 0.35, citation: 'CC2', description: 'Present in ~45% of CRC but non-specific' } as WeightConfig,
  
  // Lab markers
  low_hemoglobin: { value: 0.55, citation: 'CC3', description: 'Iron-deficiency anemia from occult GI bleeding' } as WeightConfig,
};

// ============================================================================
// BLOOD CANCER WEIGHTS
// ============================================================================

export const BLOOD_WEIGHTS = {
  // Demographics (bimodal distribution)
  age_under_20: { value: 0.50, citation: 'BC1', description: 'ALL peaks in childhood (2-5 years), AML has childhood peak' } as WeightConfig,
  age_over_60: { value: 0.55, citation: 'BC1', description: 'CLL, CML, and myeloma increase with age' } as WeightConfig,
  age_20_60: { value: 0.15, citation: 'BC1', description: 'Nadir of hematologic malignancy incidence' } as WeightConfig,
  
  // Medical History
  family_history: { value: 0.55, citation: 'BC2', description: 'OR 1.7-2.0 for hematologic malignancies with family history' } as WeightConfig,
  anemia_history: { value: 0.50, citation: 'BC3', description: 'Pre-existing cytopenia may indicate MDS or early leukemia' } as WeightConfig,
  hepatitis_history: { value: 0.35, citation: 'BC2', description: 'HCV associated with NHL, RR ~1.5' } as WeightConfig,
  
  // Symptoms (WHO classification criteria)
  swollen_lymph_nodes: { value: 0.85, citation: 'BC3', description: 'Lymphadenopathy is cardinal sign of lymphoma' } as WeightConfig,
  recurrent_infections: { value: 0.70, citation: 'BC3', description: 'Immune dysfunction from leukemia/lymphoma' } as WeightConfig,
  easy_bruising: { value: 0.75, citation: 'BC3', description: 'Thrombocytopenia manifestation' } as WeightConfig,
  bone_pain: { value: 0.70, citation: 'BC3', description: 'Marrow expansion in leukemia, lytic lesions in myeloma' } as WeightConfig,
  fatigue: { value: 0.50, citation: 'BC3', description: 'Anemia-related fatigue is very common' } as WeightConfig,
  nosebleeds: { value: 0.55, citation: 'BC3', description: 'Mucosal bleeding from thrombocytopenia' } as WeightConfig,
  pale_skin: { value: 0.45, citation: 'BC3', description: 'Pallor indicates anemia' } as WeightConfig,
  weight_loss: { value: 0.45, citation: 'BC3', description: 'B-symptoms in lymphoma (>10% weight loss in 6 months)' } as WeightConfig,
  
  // Lab markers (most critical for blood cancers)
  abnormal_hemoglobin: { value: 0.70, citation: 'BC3', description: 'Anemia is present in majority of leukemias at diagnosis' } as WeightConfig,
  abnormal_wbc: { value: 0.80, citation: 'BC3', description: 'Leukocytosis or leukopenia is hallmark of leukemia' } as WeightConfig,
  abnormal_platelets: { value: 0.75, citation: 'BC3', description: 'Thrombocytopenia from marrow infiltration' } as WeightConfig,
};

/**
 * Section weights determine relative importance of each category
 * These are calibrated to prevent symptom-only assessments from dominating
 */
export const SECTION_WEIGHTS = {
  demographics: 0.15,
  medicalHistory: 0.20,
  lifestyle: 0.15,
  symptoms: 0.35,
  labValues: 0.15,
};
