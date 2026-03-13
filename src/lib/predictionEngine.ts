/**
 * CANary Risk Prediction Engine v3.0
 * ====================================
 * 
 * Enhanced with:
 * 1. Symptom duration weighting
 * 2. Symptom cluster detection (cross-factor interactions)
 * 3. Gender-specific risk modifiers
 * 4. Age-adjusted Bayesian base rates (SEER data)
 * 5. Tumor marker integration (CA 19-9, CEA, LDH)
 * 6. Improved confidence calibration
 * 
 * METHODOLOGY:
 * 1. Input data is normalized into a standardized feature vector
 * 2. Age-specific base rates from SEER data establish Bayesian priors
 * 3. Each cancer type has weighted risk factors calibrated from published meta-analyses
 * 4. Symptom duration multipliers amplify persistent symptoms
 * 5. Symptom cluster detection applies multiplicative boosts for co-occurring patterns
 * 6. Gender-specific modifiers adjust for epidemiological sex differences
 * 7. Tumor markers (CA 19-9, CEA, LDH) contribute to cancer-specific scores
 * 8. Confidence is calibrated from data completeness, symptom coherence, and cluster alignment
 * 
 * VERSION: 3.0.0 — Enhanced accuracy with clusters, duration, gender, Bayesian priors
 */

import { 
  PANCREATIC_WEIGHTS, 
  COLON_WEIGHTS, 
  BLOOD_WEIGHTS,
  SECTION_WEIGHTS,
  DURATION_MULTIPLIERS,
  GENDER_MODIFIERS,
  PANCREATIC_CLUSTERS,
  COLON_CLUSTERS,
  BLOOD_CLUSTERS,
  TUMOR_MARKER_WEIGHTS,
  TUMOR_MARKER_RANGES,
  getBaseRate,
  type SymptomCluster,
} from './riskWeights';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PredictionInput {
  // Demographics
  age: number;
  gender: string;
  bmi: number;
  bloodGroup: string;
  
  // Medical History
  familyCancerHistory: boolean;
  familyCancerType?: string;
  diabetesHistory: boolean;
  ibdHistory: boolean;
  hepatitisHistory: boolean;
  anemiaHistory: boolean;
  noMedicalHistory: boolean;
  
  // Lifestyle
  smoking: string;
  alcohol: string;
  sleep: string;
  physicalActivity: string;
  diet: string;
  stress: string;
  
  // General Symptoms with duration
  fatigue: boolean;
  fatigueDuration?: string;
  weightLoss: boolean;
  weightLossDuration?: string;
  jaundice: boolean;
  jaundiceDuration?: string;
  noGeneralSymptoms: boolean;
  
  // Pancreatic Symptoms
  abdominalPain: boolean;
  backPain: boolean;
  nausea: boolean;
  newDiabetes: boolean;
  floatingStool: boolean;
  noPancreaticSymptoms: boolean;
  
  // Colon Symptoms
  bloodInStool: boolean;
  bloodInStoolDuration?: string;
  constipation: boolean;
  narrowStool: boolean;
  bloating: boolean;
  noColonSymptoms: boolean;
  
  // Blood Cancer Symptoms
  infections: boolean;
  infectionsDuration?: string;
  nosebleeds: boolean;
  bonePain: boolean;
  swollenLymphNodes: boolean;
  paleSkin: boolean;
  bruising: boolean;
  noBloodSymptoms: boolean;
  
  // Lab Data (optional)
  hemoglobin?: number;
  wbcCount?: number;
  plateletCount?: number;
  bilirubin?: number;
  bloodSugar?: number;
  
  // Tumor Markers (optional, v3.0)
  ca199?: number;
  cea?: number;
  ldh?: number;
}

export interface FeatureVector {
  // Normalized values (0-1 scale)
  age_normalized: number;
  bmi_normalized: number;
  
  // Binary flags
  is_male: number;
  is_female: number;
  has_family_cancer: number;
  has_diabetes_history: number;
  has_ibd: number;
  has_hepatitis: number;
  has_anemia: number;
  
  // Lifestyle scores
  smoking_score: number;
  alcohol_score: number;
  sleep_score: number;
  activity_score: number;
  diet_score: number;
  stress_score: number;
  
  // General symptoms
  has_fatigue: number;
  has_weight_loss: number;
  has_jaundice: number;
  
  // Pancreatic symptoms
  has_abdominal_pain: number;
  has_back_pain: number;
  has_nausea: number;
  has_new_diabetes: number;
  has_floating_stool: number;
  
  // Colon symptoms
  has_blood_in_stool: number;
  has_constipation: number;
  has_narrow_stool: number;
  has_bloating: number;
  
  // Blood symptoms
  has_infections: number;
  has_nosebleeds: number;
  has_bone_pain: number;
  has_swollen_lymph: number;
  has_pale_skin: number;
  has_bruising: number;
  
  // Lab normalized
  hemoglobin_normalized: number;
  wbc_normalized: number;
  platelet_normalized: number;
  bilirubin_normalized: number;
  blood_sugar_normalized: number;
  
  // Tumor markers normalized (v3.0)
  ca199_normalized: number;
  cea_normalized: number;
  ldh_normalized: number;
  
  // Data completeness
  lab_data_available: number;
  tumor_markers_available: number;
}

export interface RiskFactor {
  name: string;
  impact: 'increases' | 'decreases';
  weight: number;
  cancerType: 'pancreatic' | 'colon' | 'blood' | 'general';
}

export interface CancerRiskResult {
  probability: number;
  confidence: 'Low' | 'Medium' | 'High';
  riskLabel: 'Low' | 'Medium' | 'High';
  explanation: string;
  rawScore: number;
}

export interface PredictionResult {
  pancreatic: CancerRiskResult;
  colon: CancerRiskResult;
  blood: CancerRiskResult;
  topFeatures: string[];
  rankedFactors: RiskFactor[];
  featureVector: FeatureVector;
  debugData: DebugData;
}

export interface DebugData {
  featureVector: FeatureVector;
  rawScores: {
    pancreatic: number;
    colon: number;
    blood: number;
  };
  clusterBoosts: {
    pancreatic: number;
    colon: number;
    blood: number;
  };
  genderModifiers: {
    pancreatic: number;
    colon: number;
    blood: number;
  };
  baseRates: {
    pancreatic: number;
    colon: number;
    blood: number;
  };
  thresholds: {
    lowRisk: number;
    mediumRisk: number;
    highRisk: number;
    lowConfidence: number;
    mediumConfidence: number;
  };
  dataCompleteness: number;
  timestamp: string;
  version: string;
}

// ============================================================================
// CONSTANTS & THRESHOLDS
// ============================================================================

const THRESHOLDS = {
  LOW_RISK: 0.25,
  MEDIUM_RISK: 0.50,
  LOW_CONFIDENCE: 0.4,
  MEDIUM_CONFIDENCE: 0.7,
};

/**
 * Maximum clinically meaningful risk cap.
 * Even with every risk factor present, a screening tool should not produce
 * near-100% scores — that implies diagnostic certainty this tool cannot provide.
 * Cap at 78% to reflect population-level risk estimation limits.
 */
const RISK_HARD_CAP = 0.78;

/**
 * Sigmoid-like compression to create diminishing returns at higher scores.
 * Maps raw 0-1 scores into a compressed 0-RISK_HARD_CAP range where
 * scores above ~0.5 raw get increasingly compressed.
 * 
 * Formula: cap * (2 / (1 + e^(-k*x)) - 1) where k controls steepness
 */
const compressScore = (rawScore: number): number => {
  const k = 3.5; // Steepness: higher = sharper knee
  const compressed = RISK_HARD_CAP * (2 / (1 + Math.exp(-k * rawScore)) - 1);
  return Math.min(compressed, RISK_HARD_CAP);
};

export const LAB_RANGES = {
  hemoglobin: { min: 12.0, max: 17.5, unit: 'g/dL', label: 'Normal: 12.0-17.5' },
  wbc: { min: 4000, max: 11000, unit: '×10⁹/L', label: 'Normal: 4,000-11,000' },
  platelets: { min: 150000, max: 400000, unit: '×10⁹/L', label: 'Normal: 150,000-400,000' },
  bilirubin: { min: 0.1, max: 1.2, unit: 'mg/dL', label: 'Normal: 0.1-1.2' },
  bloodSugar: { min: 70, max: 100, unit: 'mg/dL', label: 'Normal (fasting): 70-100' },
};

export const BMI_CATEGORIES = {
  UNDERWEIGHT: { max: 18.5, label: 'Underweight' },
  NORMAL: { max: 25, label: 'Normal' },
  OVERWEIGHT: { max: 30, label: 'Overweight' },
  OBESE: { max: Infinity, label: 'Obese' },
};

// ============================================================================
// FEATURE EXTRACTION
// ============================================================================

const normalizeAge = (age: number): number => {
  return Math.min(Math.max(age / 100, 0), 1);
};

const normalizeBMI = (bmi: number): number => {
  const deviationFromNormal = Math.abs(bmi - 22.5) / 15;
  return Math.min(deviationFromNormal, 1);
};

const getLifestyleScore = (value: string, type: string): number => {
  const scores: Record<string, Record<string, number>> = {
    smoking: { never: 0, occasionally: 0.3, regularly: 0.7, chain: 1.0 },
    alcohol: { never: 0, occasionally: 0.2, weekly: 0.5, daily: 0.9 },
    sleep: { '<5': 0.8, '5-7': 0.3, '7-9': 0, '>9': 0.2 },
    physicalActivity: { sedentary: 0.9, light: 0.5, moderate: 0.2, intense: 0 },
    diet: { vegan: 0, vegetarian: 0.1, mixed: 0.3, 'non-vegetarian': 0.5 },
    stress: { low: 0, moderate: 0.3, high: 0.7 },
  };
  return scores[type]?.[value] ?? 0.5;
};

const normalizeLabValue = (
  value: number | undefined,
  min: number,
  max: number
): number => {
  if (value === undefined) return 0;
  if (value < min) return Math.min((min - value) / min, 1);
  if (value > max) return Math.min((value - max) / max, 1);
  return 0;
};

/**
 * Get duration multiplier for a symptom
 */
const getDurationMultiplier = (duration?: string): number => {
  if (!duration) return 1.0; // Default: no adjustment
  return DURATION_MULTIPLIERS[duration] ?? 1.0;
};

/**
 * Evaluate symptom clusters and return the maximum boost
 */
const evaluateClusters = (fv: FeatureVector, clusters: SymptomCluster[]): number => {
  let maxBoost = 1.0;
  
  for (const cluster of clusters) {
    const presentCount = cluster.symptoms.filter(
      (symptom) => (fv as any)[symptom] === 1
    ).length;
    
    if (presentCount >= cluster.symptoms.length) {
      maxBoost = Math.max(maxBoost, cluster.fullBoost);
    } else if (presentCount >= cluster.minForPartial) {
      maxBoost = Math.max(maxBoost, cluster.partialBoost);
    }
  }
  
  return maxBoost;
};

/**
 * Get gender modifier for a cancer type
 */
const getGenderModifier = (gender: string, cancer: 'pancreatic' | 'colon' | 'blood'): number => {
  if (gender === 'male') return GENDER_MODIFIERS[cancer].male.value;
  if (gender === 'female') return GENDER_MODIFIERS[cancer].female.value;
  return 1.0; // No modification for other/unknown
};

export const extractFeatureVector = (input: PredictionInput): FeatureVector => {
  const labDataCount = [
    input.hemoglobin,
    input.wbcCount,
    input.plateletCount,
    input.bilirubin,
    input.bloodSugar,
  ].filter((v) => v !== undefined).length;

  const tumorMarkerCount = [
    input.ca199,
    input.cea,
    input.ldh,
  ].filter((v) => v !== undefined).length;

  return {
    age_normalized: normalizeAge(input.age),
    bmi_normalized: normalizeBMI(input.bmi),
    is_male: input.gender === 'male' ? 1 : 0,
    is_female: input.gender === 'female' ? 1 : 0,

    has_family_cancer: input.familyCancerHistory ? 1 : 0,
    has_diabetes_history: input.diabetesHistory ? 1 : 0,
    has_ibd: input.ibdHistory ? 1 : 0,
    has_hepatitis: input.hepatitisHistory ? 1 : 0,
    has_anemia: input.anemiaHistory ? 1 : 0,

    smoking_score: getLifestyleScore(input.smoking, 'smoking'),
    alcohol_score: getLifestyleScore(input.alcohol, 'alcohol'),
    sleep_score: getLifestyleScore(input.sleep, 'sleep'),
    activity_score: getLifestyleScore(input.physicalActivity, 'physicalActivity'),
    diet_score: getLifestyleScore(input.diet, 'diet'),
    stress_score: getLifestyleScore(input.stress, 'stress'),

    has_fatigue: input.fatigue ? 1 : 0,
    has_weight_loss: input.weightLoss ? 1 : 0,
    has_jaundice: input.jaundice ? 1 : 0,

    has_abdominal_pain: input.abdominalPain ? 1 : 0,
    has_back_pain: input.backPain ? 1 : 0,
    has_nausea: input.nausea ? 1 : 0,
    has_new_diabetes: input.newDiabetes ? 1 : 0,
    has_floating_stool: input.floatingStool ? 1 : 0,

    has_blood_in_stool: input.bloodInStool ? 1 : 0,
    has_constipation: input.constipation ? 1 : 0,
    has_narrow_stool: input.narrowStool ? 1 : 0,
    has_bloating: input.bloating ? 1 : 0,

    has_infections: input.infections ? 1 : 0,
    has_nosebleeds: input.nosebleeds ? 1 : 0,
    has_bone_pain: input.bonePain ? 1 : 0,
    has_swollen_lymph: input.swollenLymphNodes ? 1 : 0,
    has_pale_skin: input.paleSkin ? 1 : 0,
    has_bruising: input.bruising ? 1 : 0,

    hemoglobin_normalized: normalizeLabValue(
      input.hemoglobin, LAB_RANGES.hemoglobin.min, LAB_RANGES.hemoglobin.max
    ),
    wbc_normalized: normalizeLabValue(
      input.wbcCount, LAB_RANGES.wbc.min, LAB_RANGES.wbc.max
    ),
    platelet_normalized: normalizeLabValue(
      input.plateletCount, LAB_RANGES.platelets.min, LAB_RANGES.platelets.max
    ),
    bilirubin_normalized: normalizeLabValue(
      input.bilirubin, LAB_RANGES.bilirubin.min, LAB_RANGES.bilirubin.max
    ),
    blood_sugar_normalized: normalizeLabValue(
      input.bloodSugar, LAB_RANGES.bloodSugar.min, LAB_RANGES.bloodSugar.max
    ),

    // Tumor markers (v3.0)
    ca199_normalized: normalizeLabValue(
      input.ca199, TUMOR_MARKER_RANGES.ca199.min, TUMOR_MARKER_RANGES.ca199.max
    ),
    cea_normalized: normalizeLabValue(
      input.cea, TUMOR_MARKER_RANGES.cea.min, TUMOR_MARKER_RANGES.cea.max
    ),
    ldh_normalized: normalizeLabValue(
      input.ldh, TUMOR_MARKER_RANGES.ldh.min, TUMOR_MARKER_RANGES.ldh.max
    ),

    lab_data_available: labDataCount / 5,
    tumor_markers_available: tumorMarkerCount / 3,
  };
};

// ============================================================================
// RISK CALCULATION (Enhanced v3.0)
// ============================================================================

const calculatePancreaticRisk = (fv: FeatureVector, input: PredictionInput): number => {
  let score = 0;
  let weightSum = 0;
  const W = PANCREATIC_WEIGHTS;
  const S = SECTION_WEIGHTS;

  // Bayesian prior: age-specific base rate
  const baseRate = getBaseRate(input.age, 'pancreatic');
  score += baseRate * 0.10; // 10% weight to prior
  weightSum += 0.10;

  // Demographics
  const ageWeight = input.age > 60 ? W.age_over_60.value : input.age > 45 ? W.age_45_60.value : W.age_under_45.value;
  score += ageWeight * S.demographics;
  weightSum += S.demographics;

  // BMI
  const bmiWeight = input.bmi > 30 ? W.obesity_bmi30.value : input.bmi > 25 ? 0.20 : 0.05;
  score += bmiWeight * S.demographics;
  weightSum += S.demographics;

  // Medical history
  const historyScore = (
    (fv.has_family_cancer ? W.family_history.value : 0) +
    (fv.has_diabetes_history ? W.diabetes_history.value : 0) +
    (fv.has_hepatitis ? W.hepatitis.value : 0)
  );
  const historyMax = W.family_history.value + W.diabetes_history.value + W.hepatitis.value;
  score += (historyScore / historyMax) * S.medicalHistory;
  weightSum += S.medicalHistory;

  // Lifestyle
  const smokingWeight = fv.smoking_score > 0.7 ? W.smoking_current.value : 
                         fv.smoking_score > 0.2 ? W.smoking_occasional.value : 0;
  const lifestyleScore = (smokingWeight + fv.alcohol_score * W.alcohol_heavy.value) / 2;
  score += lifestyleScore * S.lifestyle;
  weightSum += S.lifestyle;

  // Symptoms WITH duration weighting
  const symptomFactors = [
    fv.has_jaundice ? W.jaundice.value * getDurationMultiplier(input.jaundiceDuration) : 0,
    fv.has_abdominal_pain ? W.abdominal_pain.value : 0,
    fv.has_back_pain ? W.back_pain.value : 0,
    fv.has_weight_loss ? W.weight_loss.value * getDurationMultiplier(input.weightLossDuration) : 0,
    fv.has_new_diabetes ? W.new_onset_diabetes.value : 0,
    fv.has_floating_stool ? W.floating_stool.value : 0,
    fv.has_nausea ? W.nausea.value : 0,
  ];
  const symptomMax = W.jaundice.value + W.abdominal_pain.value + W.back_pain.value +
                     W.weight_loss.value + W.new_onset_diabetes.value + W.floating_stool.value + W.nausea.value;
  const symptomScore = symptomFactors.reduce((a, b) => a + b, 0) / Math.max(symptomMax, 1);
  score += symptomScore * S.symptoms;
  weightSum += S.symptoms;

  // Lab values
  const labScore = (
    (fv.bilirubin_normalized > 0.3 ? W.elevated_bilirubin.value : 0) +
    (fv.blood_sugar_normalized > 0.3 ? W.elevated_blood_sugar.value : 0)
  ) / (W.elevated_bilirubin.value + W.elevated_blood_sugar.value);
  score += labScore * S.labValues * fv.lab_data_available;
  weightSum += S.labValues * fv.lab_data_available;

  // Tumor marker: CA 19-9
  if (input.ca199 !== undefined) {
    const TM = TUMOR_MARKER_WEIGHTS.ca199;
    const tmWeight = input.ca199 > 200 ? TM.high.value : input.ca199 > 37 ? TM.elevated.value : 0;
    score += tmWeight * 0.12;
    weightSum += 0.12;
  }

  let finalScore = Math.min(score / Math.max(weightSum, 0.01), 1);

  // Apply cluster boost (multiplicative, pre-compression)
  const clusterBoost = evaluateClusters(fv, PANCREATIC_CLUSTERS);
  finalScore = finalScore * clusterBoost;

  // Apply gender modifier (multiplicative, pre-compression)
  finalScore = finalScore * getGenderModifier(input.gender, 'pancreatic');

  // Compress into clinically meaningful range
  return compressScore(finalScore);
};

const calculateColonRisk = (fv: FeatureVector, input: PredictionInput): number => {
  let score = 0;
  let weightSum = 0;
  const W = COLON_WEIGHTS;
  const S = SECTION_WEIGHTS;

  // Bayesian prior
  const baseRate = getBaseRate(input.age, 'colon');
  score += baseRate * 0.10;
  weightSum += 0.10;

  // Demographics
  const ageWeight = input.age > 50 ? W.age_over_50.value : input.age > 40 ? W.age_40_50.value : W.age_under_40.value;
  score += ageWeight * S.demographics;
  weightSum += S.demographics;

  // BMI
  const bmiWeight = input.bmi > 30 ? W.obesity_bmi30.value : input.bmi > 25 ? 0.20 : 0.05;
  score += bmiWeight * S.demographics;
  weightSum += S.demographics;

  // Medical history
  const historyScore = (
    (fv.has_family_cancer ? W.family_history.value : 0) +
    (fv.has_ibd ? W.ibd_history.value : 0)
  );
  const historyMax = W.family_history.value + W.ibd_history.value;
  score += (historyScore / historyMax) * S.medicalHistory;
  weightSum += S.medicalHistory;

  // Lifestyle
  const lifestyleScore = (
    fv.diet_score * W.diet_processed_meat.value +
    fv.activity_score * W.sedentary.value +
    fv.smoking_score * W.smoking.value
  ) / (W.diet_processed_meat.value + W.sedentary.value + W.smoking.value);
  score += lifestyleScore * S.lifestyle;
  weightSum += S.lifestyle;

  // Symptoms WITH duration weighting
  const symptomFactors = [
    fv.has_blood_in_stool ? W.blood_in_stool.value * getDurationMultiplier(input.bloodInStoolDuration) : 0,
    fv.has_constipation ? W.constipation_change.value : 0,
    fv.has_narrow_stool ? W.narrow_stool.value : 0,
    fv.has_bloating ? W.bloating.value : 0,
    fv.has_weight_loss ? W.weight_loss.value * getDurationMultiplier(input.weightLossDuration) : 0,
    fv.has_abdominal_pain ? W.abdominal_pain.value : 0,
  ];
  const symptomMax = W.blood_in_stool.value + W.constipation_change.value + W.narrow_stool.value +
                     W.bloating.value + W.weight_loss.value + W.abdominal_pain.value;
  const symptomScore = symptomFactors.reduce((a, b) => a + b, 0) / Math.max(symptomMax, 1);
  score += symptomScore * S.symptoms;
  weightSum += S.symptoms;

  // Lab values
  const labScore = fv.hemoglobin_normalized > 0.2 ? W.low_hemoglobin.value : 0;
  score += (labScore / W.low_hemoglobin.value) * S.labValues * fv.lab_data_available;
  weightSum += S.labValues * fv.lab_data_available;

  // Tumor marker: CEA
  if (input.cea !== undefined) {
    const TM = TUMOR_MARKER_WEIGHTS.cea;
    const tmWeight = input.cea > 10 ? TM.high.value : input.cea > 5 ? TM.elevated.value : 0;
    score += tmWeight * 0.10;
    weightSum += 0.10;
  }

  let finalScore = Math.min(score / Math.max(weightSum, 0.01), 1);

  // Cluster boost
  const clusterBoost = evaluateClusters(fv, COLON_CLUSTERS);
  finalScore = finalScore * clusterBoost;

  // Gender modifier
  finalScore = finalScore * getGenderModifier(input.gender, 'colon');

  // Compress into clinically meaningful range
  return compressScore(finalScore);
};

const calculateBloodRisk = (fv: FeatureVector, input: PredictionInput): number => {
  let score = 0;
  let weightSum = 0;
  const W = BLOOD_WEIGHTS;
  const S = SECTION_WEIGHTS;

  // Bayesian prior
  const baseRate = getBaseRate(input.age, 'blood');
  score += baseRate * 0.10;
  weightSum += 0.10;

  // Demographics — Bimodal distribution
  const ageWeight = input.age < 20 ? W.age_under_20.value : 
                    input.age > 60 ? W.age_over_60.value : W.age_20_60.value;
  score += ageWeight * S.demographics;
  weightSum += S.demographics;

  // Medical history
  const historyScore = (
    (fv.has_family_cancer ? W.family_history.value : 0) +
    (fv.has_anemia ? W.anemia_history.value : 0) +
    (fv.has_hepatitis ? W.hepatitis_history.value : 0)
  );
  const historyMax = W.family_history.value + W.anemia_history.value + W.hepatitis_history.value;
  score += (historyScore / historyMax) * S.medicalHistory;
  weightSum += S.medicalHistory;

  // Symptoms WITH duration weighting
  const symptomFactors = [
    fv.has_fatigue ? W.fatigue.value * getDurationMultiplier(input.fatigueDuration) : 0,
    fv.has_bruising ? W.easy_bruising.value : 0,
    fv.has_nosebleeds ? W.nosebleeds.value : 0,
    fv.has_infections ? W.recurrent_infections.value * getDurationMultiplier(input.infectionsDuration) : 0,
    fv.has_bone_pain ? W.bone_pain.value : 0,
    fv.has_swollen_lymph ? W.swollen_lymph_nodes.value : 0,
    fv.has_pale_skin ? W.pale_skin.value : 0,
    fv.has_weight_loss ? W.weight_loss.value * getDurationMultiplier(input.weightLossDuration) : 0,
  ];
  const symptomMax = W.fatigue.value + W.easy_bruising.value + W.nosebleeds.value +
                     W.recurrent_infections.value + W.bone_pain.value + W.swollen_lymph_nodes.value +
                     W.pale_skin.value + W.weight_loss.value;
  const symptomScore = symptomFactors.reduce((a, b) => a + b, 0) / Math.max(symptomMax, 1);
  score += symptomScore * S.symptoms;
  weightSum += S.symptoms;

  // Lab values
  const labFactors = [
    fv.hemoglobin_normalized > 0.3 ? W.abnormal_hemoglobin.value : 0,
    fv.wbc_normalized > 0.3 ? W.abnormal_wbc.value : 0,
    fv.platelet_normalized > 0.3 ? W.abnormal_platelets.value : 0,
  ];
  const labMax = W.abnormal_hemoglobin.value + W.abnormal_wbc.value + W.abnormal_platelets.value;
  const labScore = labFactors.reduce((a, b) => a + b, 0) / Math.max(labMax, 1);
  score += labScore * S.labValues * fv.lab_data_available;
  weightSum += S.labValues * fv.lab_data_available;

  // Tumor marker: LDH
  if (input.ldh !== undefined) {
    const TM = TUMOR_MARKER_WEIGHTS.ldh;
    const tmWeight = input.ldh > 500 ? TM.high.value : input.ldh > 280 ? TM.elevated.value : 0;
    score += tmWeight * 0.10;
    weightSum += 0.10;
  }

  let finalScore = Math.min(score / Math.max(weightSum, 0.01), 1);

  // Cluster boost
  const clusterBoost = evaluateClusters(fv, BLOOD_CLUSTERS);
  finalScore = finalScore * clusterBoost;

  // Gender modifier
  finalScore = finalScore * getGenderModifier(input.gender, 'blood');

  // Compress into clinically meaningful range
  return compressScore(finalScore);
};

// ============================================================================
// ENHANCED CONFIDENCE CALIBRATION (v3.0)
// ============================================================================

/**
 * Improved confidence based on:
 * 1. Data completeness (lab + tumor markers)
 * 2. Symptom count (more symptoms = higher confidence in the score)
 * 3. Symptom-cluster coherence (aligned symptoms boost confidence)
 * 4. Risk factor alignment (lifestyle + symptoms + labs pointing same direction)
 */
const calculateConfidence = (
  fv: FeatureVector, 
  score: number, 
  clusterBoost: number,
  cancer: 'pancreatic' | 'colon' | 'blood'
): 'Low' | 'Medium' | 'High' => {
  let confidenceScore = 0;

  // Data availability (0-0.35)
  confidenceScore += fv.lab_data_available * 0.20;
  confidenceScore += fv.tumor_markers_available * 0.15;

  // Symptom count — more data points = more confidence (0-0.25)
  const symptomKeys = [
    'has_fatigue', 'has_weight_loss', 'has_jaundice', 'has_abdominal_pain',
    'has_back_pain', 'has_nausea', 'has_new_diabetes', 'has_floating_stool',
    'has_blood_in_stool', 'has_constipation', 'has_narrow_stool', 'has_bloating',
    'has_infections', 'has_nosebleeds', 'has_bone_pain', 'has_swollen_lymph',
    'has_pale_skin', 'has_bruising',
  ];
  const symptomCount = symptomKeys.filter(k => (fv as any)[k] === 1).length;
  confidenceScore += Math.min(symptomCount / 6, 1) * 0.25;

  // Cluster coherence — if a cluster was triggered, symptoms are aligned (0-0.20)
  if (clusterBoost > 1.3) {
    confidenceScore += 0.20;
  } else if (clusterBoost > 1.1) {
    confidenceScore += 0.10;
  }

  // Score strength — extreme scores (very low or very high) are more confident (0-0.20)
  if (score > 0.6 || score < 0.1) {
    confidenceScore += 0.20;
  } else if (score > 0.45 || score < 0.15) {
    confidenceScore += 0.10;
  }

  if (confidenceScore < THRESHOLDS.LOW_CONFIDENCE) return 'Low';
  if (confidenceScore < THRESHOLDS.MEDIUM_CONFIDENCE) return 'Medium';
  return 'High';
};

/**
 * Generates explanation text for each cancer type
 */
const generateExplanation = (
  cancerType: string,
  score: number,
  fv: FeatureVector,
  input: PredictionInput,
  clusterBoost: number
): string => {
  const factors: string[] = [];
  const protective: string[] = [];

  if (input.age <= 40) protective.push('young age');
  else if (input.age >= 60) factors.push('age over 60');
  
  if (fv.has_family_cancer) factors.push('family cancer history');
  if (input.bmi >= 18.5 && input.bmi <= 25) protective.push('healthy BMI');
  else if (input.bmi > 30) factors.push('obesity');

  // Gender note
  if (input.gender === 'male') factors.push('male sex (higher incidence)');

  if (cancerType === 'pancreatic') {
    if (fv.has_jaundice) factors.push('jaundice');
    if (fv.has_new_diabetes) factors.push('newly developed diabetes');
    if (fv.has_back_pain) factors.push('back pain');
    if (!fv.smoking_score) protective.push('non-smoker status');
    else if (fv.smoking_score > 0.5) factors.push('smoking');
    if (input.ca199 && input.ca199 > 37) factors.push('elevated CA 19-9');
  }

  if (cancerType === 'colon') {
    if (fv.has_blood_in_stool) factors.push('blood in stool');
    if (fv.has_ibd) factors.push('IBD history');
    if (fv.has_narrow_stool) factors.push('changes in stool');
    if (fv.activity_score < 0.3) protective.push('active lifestyle');
    else if (fv.activity_score > 0.7) factors.push('sedentary lifestyle');
    if (input.cea && input.cea > 5) factors.push('elevated CEA');
  }

  if (cancerType === 'blood') {
    if (fv.has_swollen_lymph) factors.push('swollen lymph nodes');
    if (fv.has_infections) factors.push('recurrent infections');
    if (fv.has_bruising) factors.push('easy bruising');
    if (fv.wbc_normalized > 0.3) factors.push('abnormal WBC count');
    if (fv.hemoglobin_normalized === 0 && input.hemoglobin) protective.push('normal hemoglobin');
    if (input.ldh && input.ldh > 280) factors.push('elevated LDH');
  }

  // Cluster note
  if (clusterBoost > 1.2) {
    factors.push('symptom cluster pattern detected');
  }

  let explanation = '';
  if (protective.length > 0) {
    explanation += `Your ${protective.slice(0, 2).join(' and ')} ${protective.length > 1 ? 'lower' : 'lowers'} your ${cancerType} cancer risk`;
  }
  if (factors.length > 0) {
    if (explanation) explanation += ', but ';
    else explanation = 'Your ';
    explanation += `${factors.slice(0, 3).join(', ')} slightly ${factors.length > 1 ? 'increase' : 'increases'} your baseline risk`;
  }
  if (!explanation) {
    explanation = `Based on your profile, no significant risk factors were identified for ${cancerType} cancer`;
  }
  
  return explanation + '.';
};

/**
 * Identifies and ranks the top contributing factors
 */
const rankFactors = (fv: FeatureVector, input: PredictionInput): RiskFactor[] => {
  const factors: RiskFactor[] = [];

  if (input.age > 60) {
    factors.push({ name: 'Age over 60', impact: 'increases', weight: 0.8, cancerType: 'general' });
  } else if (input.age < 40) {
    factors.push({ name: 'Young age (under 40)', impact: 'decreases', weight: 0.7, cancerType: 'general' });
  }

  if (fv.has_family_cancer) {
    factors.push({ name: 'Family cancer history', impact: 'increases', weight: 0.85, cancerType: 'general' });
  }

  if (input.bmi >= 18.5 && input.bmi <= 25) {
    factors.push({ name: 'Healthy body weight', impact: 'decreases', weight: 0.6, cancerType: 'general' });
  } else if (input.bmi > 30) {
    factors.push({ name: 'Obesity (BMI > 30)', impact: 'increases', weight: 0.65, cancerType: 'general' });
  }

  // Gender
  if (input.gender === 'male') {
    factors.push({ name: 'Male sex (higher cancer incidence)', impact: 'increases', weight: 0.55, cancerType: 'general' });
  }

  if (fv.smoking_score > 0.5) {
    factors.push({ name: 'Regular smoking', impact: 'increases', weight: 0.8, cancerType: 'pancreatic' });
  } else if (fv.smoking_score === 0) {
    factors.push({ name: 'Non-smoker', impact: 'decreases', weight: 0.7, cancerType: 'pancreatic' });
  }

  if (fv.activity_score > 0.7) {
    factors.push({ name: 'Sedentary lifestyle', impact: 'increases', weight: 0.6, cancerType: 'colon' });
  } else if (fv.activity_score < 0.3) {
    factors.push({ name: 'Regular physical activity', impact: 'decreases', weight: 0.65, cancerType: 'colon' });
  }

  if (fv.has_jaundice) factors.push({ name: 'Jaundice symptoms', impact: 'increases', weight: 0.9, cancerType: 'pancreatic' });
  if (fv.has_blood_in_stool) factors.push({ name: 'Blood in stool', impact: 'increases', weight: 0.9, cancerType: 'colon' });
  if (fv.has_swollen_lymph) factors.push({ name: 'Swollen lymph nodes', impact: 'increases', weight: 0.9, cancerType: 'blood' });
  if (fv.has_weight_loss) factors.push({ name: 'Unexplained weight loss', impact: 'increases', weight: 0.75, cancerType: 'general' });
  if (fv.has_fatigue) factors.push({ name: 'Chronic fatigue', impact: 'increases', weight: 0.6, cancerType: 'blood' });
  if (fv.has_new_diabetes) factors.push({ name: 'Newly developed diabetes', impact: 'increases', weight: 0.8, cancerType: 'pancreatic' });
  if (fv.has_bruising) factors.push({ name: 'Easy bruising', impact: 'increases', weight: 0.75, cancerType: 'blood' });
  if (fv.has_ibd) factors.push({ name: 'Inflammatory bowel disease', impact: 'increases', weight: 0.8, cancerType: 'colon' });

  // Lab abnormalities
  if (fv.hemoglobin_normalized > 0.3 && input.hemoglobin) {
    factors.push({ name: 'Abnormal hemoglobin level', impact: 'increases', weight: 0.7, cancerType: 'blood' });
  }
  if (fv.wbc_normalized > 0.3 && input.wbcCount) {
    factors.push({ name: 'Abnormal WBC count', impact: 'increases', weight: 0.75, cancerType: 'blood' });
  }
  if (fv.bilirubin_normalized > 0.3 && input.bilirubin) {
    factors.push({ name: 'Elevated bilirubin', impact: 'increases', weight: 0.7, cancerType: 'pancreatic' });
  }

  // Tumor markers
  if (input.ca199 && input.ca199 > 37) {
    factors.push({ name: 'Elevated CA 19-9', impact: 'increases', weight: 0.85, cancerType: 'pancreatic' });
  }
  if (input.cea && input.cea > 5) {
    factors.push({ name: 'Elevated CEA', impact: 'increases', weight: 0.7, cancerType: 'colon' });
  }
  if (input.ldh && input.ldh > 280) {
    factors.push({ name: 'Elevated LDH', impact: 'increases', weight: 0.65, cancerType: 'blood' });
  }

  return factors.sort((a, b) => b.weight - a.weight);
};

// ============================================================================
// MAIN PREDICTION FUNCTION
// ============================================================================

export const generatePrediction = (input: PredictionInput): PredictionResult => {
  const featureVector = extractFeatureVector(input);

  const pancreaticRaw = calculatePancreaticRisk(featureVector, input);
  const colonRaw = calculateColonRisk(featureVector, input);
  const bloodRaw = calculateBloodRisk(featureVector, input);

  // Calculate cluster boosts for debug/confidence
  const pancreaticCluster = evaluateClusters(featureVector, PANCREATIC_CLUSTERS);
  const colonCluster = evaluateClusters(featureVector, COLON_CLUSTERS);
  const bloodCluster = evaluateClusters(featureVector, BLOOD_CLUSTERS);

  // Gender modifiers for debug
  const pancreaticGender = getGenderModifier(input.gender, 'pancreatic');
  const colonGender = getGenderModifier(input.gender, 'colon');
  const bloodGender = getGenderModifier(input.gender, 'blood');

  const getRiskLabel = (score: number): 'Low' | 'Medium' | 'High' => {
    if (score < THRESHOLDS.LOW_RISK) return 'Low';
    if (score < THRESHOLDS.MEDIUM_RISK) return 'Medium';
    return 'High';
  };

  const result: PredictionResult = {
    pancreatic: {
      probability: Math.round(pancreaticRaw * 100) / 100,
      confidence: calculateConfidence(featureVector, pancreaticRaw, pancreaticCluster, 'pancreatic'),
      riskLabel: getRiskLabel(pancreaticRaw),
      explanation: generateExplanation('pancreatic', pancreaticRaw, featureVector, input, pancreaticCluster),
      rawScore: pancreaticRaw,
    },
    colon: {
      probability: Math.round(colonRaw * 100) / 100,
      confidence: calculateConfidence(featureVector, colonRaw, colonCluster, 'colon'),
      riskLabel: getRiskLabel(colonRaw),
      explanation: generateExplanation('colon', colonRaw, featureVector, input, colonCluster),
      rawScore: colonRaw,
    },
    blood: {
      probability: Math.round(bloodRaw * 100) / 100,
      confidence: calculateConfidence(featureVector, bloodRaw, bloodCluster, 'blood'),
      riskLabel: getRiskLabel(bloodRaw),
      explanation: generateExplanation('blood', bloodRaw, featureVector, input, bloodCluster),
      rawScore: bloodRaw,
    },
    topFeatures: [],
    rankedFactors: rankFactors(featureVector, input),
    featureVector,
    debugData: {
      featureVector,
      rawScores: {
        pancreatic: pancreaticRaw,
        colon: colonRaw,
        blood: bloodRaw,
      },
      clusterBoosts: {
        pancreatic: pancreaticCluster,
        colon: colonCluster,
        blood: bloodCluster,
      },
      genderModifiers: {
        pancreatic: pancreaticGender,
        colon: colonGender,
        blood: bloodGender,
      },
      baseRates: {
        pancreatic: getBaseRate(input.age, 'pancreatic'),
        colon: getBaseRate(input.age, 'colon'),
        blood: getBaseRate(input.age, 'blood'),
      },
      thresholds: {
        lowRisk: THRESHOLDS.LOW_RISK,
        mediumRisk: THRESHOLDS.MEDIUM_RISK,
        highRisk: 1.0,
        lowConfidence: THRESHOLDS.LOW_CONFIDENCE,
        mediumConfidence: THRESHOLDS.MEDIUM_CONFIDENCE,
      },
      dataCompleteness: featureVector.lab_data_available,
      timestamp: new Date().toISOString(),
      version: '3.0.0-enhanced-accuracy',
    },
  };

  result.topFeatures = result.rankedFactors
    .slice(0, 5)
    .map((f) => f.name);

  if (result.topFeatures.length === 0) {
    result.topFeatures = ['No significant risk factors identified'];
  }

  return result;
};

export const calculateBMI = (
  height: number,
  weight: number
): { bmi: number; category: string } => {
  if (!height || !weight || height <= 0 || weight <= 0) {
    return { bmi: 0, category: 'Unknown' };
  }
  
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  
  let category = 'Unknown';
  if (bmi < BMI_CATEGORIES.UNDERWEIGHT.max) category = BMI_CATEGORIES.UNDERWEIGHT.label;
  else if (bmi < BMI_CATEGORIES.NORMAL.max) category = BMI_CATEGORIES.NORMAL.label;
  else if (bmi < BMI_CATEGORIES.OVERWEIGHT.max) category = BMI_CATEGORIES.OVERWEIGHT.label;
  else category = BMI_CATEGORIES.OBESE.label;
  
  return { bmi: Math.round(bmi * 10) / 10, category };
};
