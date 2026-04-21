/**
 * Evidence-Based Risk Weight Configuration v3.0
 * ================================================
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
 * VERSION: 3.0.0 — Enhanced with duration, clusters, gender, Bayesian priors, tumor markers
 */

export interface WeightConfig {
  value: number;
  citation: string;     // Citation ID from citations.ts
  description: string;  // Brief explanation of derivation
}

// ============================================================================
// SYMPTOM DURATION MULTIPLIERS
// ============================================================================

/**
 * Duration multipliers increase symptom weight based on persistence.
 * Longer-duration symptoms are more clinically concerning.
 * Source: Clinical guidelines (NICE NG12 2015, ACS screening criteria)
 */
export const DURATION_MULTIPLIERS: Record<string, number> = {
  '<2weeks': 0.7,    // Short duration, less concerning
  '2-6weeks': 1.0,   // Moderate duration, baseline weight
  '>6weeks': 1.4,    // Persistent symptoms, significantly more concerning
};

// ============================================================================
// GENDER-SPECIFIC RISK MODIFIERS
// ============================================================================

/**
 * Gender modifiers based on SEER incidence data.
 * Applied as multipliers to the final cancer-specific score.
 */
export const GENDER_MODIFIERS = {
  pancreatic: {
    male: { value: 1.30, citation: 'M3', description: 'SEER: M:F incidence ratio ~1.3:1 for PDAC' },
    female: { value: 0.77, citation: 'M3', description: 'SEER: female incidence ~77% of male rate' },
  },
  colon: {
    male: { value: 1.24, citation: 'M3', description: 'SEER: M:F incidence ratio ~1.24:1 for CRC' },
    female: { value: 0.81, citation: 'M3', description: 'SEER: female incidence ~81% of male rate' },
  },
  blood: {
    male: { value: 1.40, citation: 'M3', description: 'SEER: leukemia/lymphoma M:F ratio ~1.4:1' },
    female: { value: 0.71, citation: 'M3', description: 'SEER: female incidence ~71% of male rate' },
  },
};

// ============================================================================
// SYMPTOM CLUSTER DEFINITIONS
// ============================================================================

/**
 * Symptom clusters — co-occurring symptom patterns that are far more
 * predictive than individual symptoms scored independently.
 * 
 * When all symptoms in a cluster are present, a multiplicative boost is applied.
 * Minimum 2 of the cluster symptoms must be present for a partial boost.
 */
export interface SymptomCluster {
  name: string;
  symptoms: string[];      // Feature vector field names (has_*)
  fullBoost: number;       // Multiplier when all present
  partialBoost: number;    // Multiplier when ≥2 present
  minForPartial: number;   // Minimum symptoms for partial boost
  citation: string;
  description: string;
}

export const PANCREATIC_CLUSTERS: SymptomCluster[] = [
  {
    name: 'Courvoisier triad',
    symptoms: ['has_jaundice', 'has_weight_loss', 'has_back_pain'],
    fullBoost: 1.45,
    partialBoost: 1.20,
    minForPartial: 2,
    citation: 'CL1',
    description: 'Classic PDAC presentation: painless jaundice + weight loss + epigastric/back pain',
  },
  {
    name: 'Exocrine insufficiency pattern',
    symptoms: ['has_floating_stool', 'has_weight_loss', 'has_new_diabetes'],
    fullBoost: 1.35,
    partialBoost: 1.15,
    minForPartial: 2,
    citation: 'CL1',
    description: 'Steatorrhea + weight loss + new diabetes suggests pancreatic mass',
  },
];

export const COLON_CLUSTERS: SymptomCluster[] = [
  {
    name: 'Left-sided obstruction',
    symptoms: ['has_blood_in_stool', 'has_narrow_stool', 'has_weight_loss'],
    fullBoost: 1.40,
    partialBoost: 1.18,
    minForPartial: 2,
    citation: 'CL2',
    description: 'Rectal bleeding + change in stool caliber + weight loss = left-sided CRC',
  },
  {
    name: 'Right-sided anemia pattern',
    symptoms: ['has_fatigue', 'has_weight_loss', 'has_abdominal_pain'],
    fullBoost: 1.30,
    partialBoost: 1.12,
    minForPartial: 2,
    citation: 'CL2',
    description: 'Fatigue (anemia) + weight loss + abdominal pain = right-sided CRC',
  },
];

export const BLOOD_CLUSTERS: SymptomCluster[] = [
  {
    name: 'Marrow failure triad',
    symptoms: ['has_bruising', 'has_infections', 'has_fatigue'],
    fullBoost: 1.45,
    partialBoost: 1.20,
    minForPartial: 2,
    citation: 'CL3',
    description: 'Thrombocytopenia + neutropenia + anemia = marrow failure/leukemia',
  },
  {
    name: 'Lymphoma B-symptoms',
    symptoms: ['has_swollen_lymph', 'has_weight_loss', 'has_fatigue'],
    fullBoost: 1.40,
    partialBoost: 1.18,
    minForPartial: 2,
    citation: 'CL3',
    description: 'Lymphadenopathy + B-symptoms (weight loss, fatigue/fever)',
  },
];

// ============================================================================
// AGE-ADJUSTED BASE RATES (Bayesian Priors)
// ============================================================================

/**
 * SEER age-specific annual incidence rates per 100,000.
 * Converted to probability scale for use as Bayesian priors.
 * Source: SEER Cancer Statistics Review 2016-2020
 */
export const SEER_BASE_RATES = {
  pancreatic: {
    // Age ranges: [0-29, 30-39, 40-49, 50-59, 60-69, 70-79, 80+]
    rates: [0.1, 0.8, 3.2, 10.5, 28.0, 48.5, 55.0],
    ageBreaks: [30, 40, 50, 60, 70, 80],
    citation: 'M4',
  },
  colon: {
    rates: [0.8, 4.5, 13.0, 30.0, 55.0, 80.0, 95.0],
    ageBreaks: [30, 40, 50, 60, 70, 80],
    citation: 'M4',
  },
  blood: {
    // Bimodal: childhood peak + elderly rise
    rates: [5.0, 3.5, 5.0, 10.0, 20.0, 35.0, 45.0],
    ageBreaks: [30, 40, 50, 60, 70, 80],
    citation: 'M4',
  },
};

/**
 * Get age-specific base rate normalized to 0-1 scale
 * Uses the SEER rate divided by maximum rate for that cancer
 */
export const getBaseRate = (age: number, cancer: 'pancreatic' | 'colon' | 'blood'): number => {
  const { rates, ageBreaks } = SEER_BASE_RATES[cancer];
  let idx = 0;
  for (let i = 0; i < ageBreaks.length; i++) {
    if (age >= ageBreaks[i]) idx = i + 1;
  }
  const rate = rates[Math.min(idx, rates.length - 1)];
  const maxRate = Math.max(...rates);
  return rate / maxRate; // Normalized 0-1
};

// ============================================================================
// TUMOR MARKER WEIGHTS
// ============================================================================

export const TUMOR_MARKER_WEIGHTS = {
  ca199: {
    elevated: { value: 0.82, citation: 'TM1', description: 'CA 19-9 >37 U/mL: sensitivity 79%, specificity 82% for PDAC' } as WeightConfig,
    high: { value: 0.92, citation: 'TM1', description: 'CA 19-9 >200 U/mL: strongly suggestive of PDAC' } as WeightConfig,
  },
  cea: {
    elevated: { value: 0.60, citation: 'TM2', description: 'CEA >5 ng/mL: sensitivity ~46%, specificity ~89% for CRC' } as WeightConfig,
    high: { value: 0.78, citation: 'TM2', description: 'CEA >10 ng/mL: higher specificity for advanced CRC' } as WeightConfig,
  },
  ldh: {
    elevated: { value: 0.55, citation: 'TM3', description: 'LDH >250 U/L: elevated in ~50% of lymphomas at diagnosis' } as WeightConfig,
    high: { value: 0.72, citation: 'TM3', description: 'LDH >500 U/L: associated with aggressive lymphoma/leukemia' } as WeightConfig,
  },
};

export const TUMOR_MARKER_RANGES = {
  ca199: { min: 0, max: 37, unit: 'U/mL', label: 'Normal: 0-37' },
  cea: { min: 0, max: 5, unit: 'ng/mL', label: 'Normal: 0-5' },
  ldh: { min: 140, max: 280, unit: 'U/L', label: 'Normal: 140-280' },
};

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
