/**
 * CANary Risk Prediction Engine
 * =============================
 * 
 * This module implements a rule-based risk scoring system for multi-cancer screening.
 * Designed for IEEE paper documentation with transparent, reproducible logic.
 * 
 * METHODOLOGY:
 * 1. Input data is normalized into a standardized feature vector
 * 2. Each cancer type has weighted risk factors based on medical literature
 * 3. Final scores combine base risk, symptoms, lifestyle, and lab values
 * 4. Confidence is determined by data completeness and consistency
 * 
 * LIMITATIONS:
 * - Uses synthetic weights, not trained on clinical data
 * - For research/educational purposes only
 * - Not validated for clinical diagnosis
 */

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
  
  // Data completeness
  lab_data_available: number;
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

/**
 * Risk thresholds used for categorization
 * These can be adjusted based on desired sensitivity/specificity
 */
const THRESHOLDS = {
  LOW_RISK: 0.3,      // Below this = Low Risk
  MEDIUM_RISK: 0.6,   // Below this = Medium Risk, above = High Risk
  LOW_CONFIDENCE: 0.4,
  MEDIUM_CONFIDENCE: 0.7,
};

/**
 * Lab value normal ranges for reference
 */
export const LAB_RANGES = {
  hemoglobin: { min: 12.0, max: 17.5, unit: 'g/dL', label: 'Normal: 12.0-17.5' },
  wbc: { min: 4000, max: 11000, unit: '×10⁹/L', label: 'Normal: 4,000-11,000' },
  platelets: { min: 150000, max: 400000, unit: '×10⁹/L', label: 'Normal: 150,000-400,000' },
  bilirubin: { min: 0.1, max: 1.2, unit: 'mg/dL', label: 'Normal: 0.1-1.2' },
  bloodSugar: { min: 70, max: 100, unit: 'mg/dL', label: 'Normal (fasting): 70-100' },
};

/**
 * BMI categories
 */
export const BMI_CATEGORIES = {
  UNDERWEIGHT: { max: 18.5, label: 'Underweight' },
  NORMAL: { max: 25, label: 'Normal' },
  OVERWEIGHT: { max: 30, label: 'Overweight' },
  OBESE: { max: Infinity, label: 'Obese' },
};

// ============================================================================
// FEATURE EXTRACTION
// ============================================================================

/**
 * Normalizes age to 0-1 scale
 * Uses min-max normalization with expected range 0-100
 */
const normalizeAge = (age: number): number => {
  return Math.min(Math.max(age / 100, 0), 1);
};

/**
 * Normalizes BMI to 0-1 scale
 * Uses sigmoid-like transformation centered at BMI 25
 */
const normalizeBMI = (bmi: number): number => {
  // Map BMI to 0-1 where 18.5-25 is center
  const deviationFromNormal = Math.abs(bmi - 22.5) / 15;
  return Math.min(deviationFromNormal, 1);
};

/**
 * Converts lifestyle factors to numeric scores
 */
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

/**
 * Normalizes lab values based on normal ranges
 * Returns deviation from normal (0 = normal, 1 = highly abnormal)
 */
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
 * Extracts feature vector from raw input
 */
export const extractFeatureVector = (input: PredictionInput): FeatureVector => {
  const labDataCount = [
    input.hemoglobin,
    input.wbcCount,
    input.plateletCount,
    input.bilirubin,
    input.bloodSugar,
  ].filter((v) => v !== undefined).length;

  return {
    // Demographics normalized
    age_normalized: normalizeAge(input.age),
    bmi_normalized: normalizeBMI(input.bmi),
    is_male: input.gender === 'male' ? 1 : 0,
    is_female: input.gender === 'female' ? 1 : 0,

    // Medical history flags
    has_family_cancer: input.familyCancerHistory ? 1 : 0,
    has_diabetes_history: input.diabetesHistory ? 1 : 0,
    has_ibd: input.ibdHistory ? 1 : 0,
    has_hepatitis: input.hepatitisHistory ? 1 : 0,
    has_anemia: input.anemiaHistory ? 1 : 0,

    // Lifestyle scores
    smoking_score: getLifestyleScore(input.smoking, 'smoking'),
    alcohol_score: getLifestyleScore(input.alcohol, 'alcohol'),
    sleep_score: getLifestyleScore(input.sleep, 'sleep'),
    activity_score: getLifestyleScore(input.physicalActivity, 'physicalActivity'),
    diet_score: getLifestyleScore(input.diet, 'diet'),
    stress_score: getLifestyleScore(input.stress, 'stress'),

    // General symptoms
    has_fatigue: input.fatigue ? 1 : 0,
    has_weight_loss: input.weightLoss ? 1 : 0,
    has_jaundice: input.jaundice ? 1 : 0,

    // Pancreatic symptoms
    has_abdominal_pain: input.abdominalPain ? 1 : 0,
    has_back_pain: input.backPain ? 1 : 0,
    has_nausea: input.nausea ? 1 : 0,
    has_new_diabetes: input.newDiabetes ? 1 : 0,
    has_floating_stool: input.floatingStool ? 1 : 0,

    // Colon symptoms
    has_blood_in_stool: input.bloodInStool ? 1 : 0,
    has_constipation: input.constipation ? 1 : 0,
    has_narrow_stool: input.narrowStool ? 1 : 0,
    has_bloating: input.bloating ? 1 : 0,

    // Blood symptoms
    has_infections: input.infections ? 1 : 0,
    has_nosebleeds: input.nosebleeds ? 1 : 0,
    has_bone_pain: input.bonePain ? 1 : 0,
    has_swollen_lymph: input.swollenLymphNodes ? 1 : 0,
    has_pale_skin: input.paleSkin ? 1 : 0,
    has_bruising: input.bruising ? 1 : 0,

    // Lab values normalized
    hemoglobin_normalized: normalizeLabValue(
      input.hemoglobin,
      LAB_RANGES.hemoglobin.min,
      LAB_RANGES.hemoglobin.max
    ),
    wbc_normalized: normalizeLabValue(
      input.wbcCount,
      LAB_RANGES.wbc.min,
      LAB_RANGES.wbc.max
    ),
    platelet_normalized: normalizeLabValue(
      input.plateletCount,
      LAB_RANGES.platelets.min,
      LAB_RANGES.platelets.max
    ),
    bilirubin_normalized: normalizeLabValue(
      input.bilirubin,
      LAB_RANGES.bilirubin.min,
      LAB_RANGES.bilirubin.max
    ),
    blood_sugar_normalized: normalizeLabValue(
      input.bloodSugar,
      LAB_RANGES.bloodSugar.min,
      LAB_RANGES.bloodSugar.max
    ),

    // Data completeness (0-1)
    lab_data_available: labDataCount / 5,
  };
};

// ============================================================================
// RISK CALCULATION
// ============================================================================

/**
 * Calculates pancreatic cancer risk score
 * 
 * Key risk factors:
 * - Age > 60
 * - Family history
 * - Diabetes
 * - Smoking
 * - Obesity
 * - Jaundice, abdominal/back pain, new diabetes
 */
const calculatePancreaticRisk = (fv: FeatureVector, input: PredictionInput): number => {
  let score = 0;
  let weightSum = 0;

  // Demographics (weight: 0.2)
  const ageRisk = input.age > 60 ? 0.8 : input.age > 45 ? 0.5 : 0.2;
  score += ageRisk * 0.15;
  weightSum += 0.15;

  // BMI (weight: 0.1)
  const bmiRisk = input.bmi > 30 ? 0.6 : input.bmi > 25 ? 0.3 : 0.1;
  score += bmiRisk * 0.1;
  weightSum += 0.1;

  // Medical history (weight: 0.25)
  if (fv.has_family_cancer) { score += 0.2; weightSum += 0.2; }
  if (fv.has_diabetes_history) { score += 0.15; weightSum += 0.15; }
  if (fv.has_hepatitis) { score += 0.1; weightSum += 0.1; }

  // Lifestyle (weight: 0.2)
  score += fv.smoking_score * 0.15;
  weightSum += 0.15;
  score += fv.alcohol_score * 0.05;
  weightSum += 0.05;

  // Symptoms (weight: 0.4)
  if (fv.has_jaundice) { score += 0.25; weightSum += 0.25; }
  if (fv.has_abdominal_pain) { score += 0.15; weightSum += 0.15; }
  if (fv.has_back_pain) { score += 0.2; weightSum += 0.2; }
  if (fv.has_weight_loss) { score += 0.15; weightSum += 0.15; }
  if (fv.has_new_diabetes) { score += 0.2; weightSum += 0.2; }
  if (fv.has_floating_stool) { score += 0.1; weightSum += 0.1; }
  if (fv.has_nausea) { score += 0.05; weightSum += 0.05; }

  // Lab values (weight: 0.15)
  if (fv.bilirubin_normalized > 0.3) { score += 0.15; weightSum += 0.15; }
  if (fv.blood_sugar_normalized > 0.3) { score += 0.1; weightSum += 0.1; }

  return Math.min(score / Math.max(weightSum, 1), 1);
};

/**
 * Calculates colon cancer risk score
 * 
 * Key risk factors:
 * - Age > 50
 * - Family history
 * - IBD
 * - Non-vegetarian diet
 * - Sedentary lifestyle
 * - Blood in stool, constipation changes
 */
const calculateColonRisk = (fv: FeatureVector, input: PredictionInput): number => {
  let score = 0;
  let weightSum = 0;

  // Demographics
  const ageRisk = input.age > 50 ? 0.7 : input.age > 40 ? 0.4 : 0.2;
  score += ageRisk * 0.15;
  weightSum += 0.15;

  // BMI
  const bmiRisk = input.bmi > 30 ? 0.5 : input.bmi > 25 ? 0.25 : 0.1;
  score += bmiRisk * 0.1;
  weightSum += 0.1;

  // Medical history
  if (fv.has_family_cancer) { score += 0.18; weightSum += 0.18; }
  if (fv.has_ibd) { score += 0.25; weightSum += 0.25; }

  // Lifestyle
  score += fv.diet_score * 0.1;
  weightSum += 0.1;
  score += fv.activity_score * 0.1;
  weightSum += 0.1;

  // Symptoms
  if (fv.has_blood_in_stool) { score += 0.3; weightSum += 0.3; }
  if (fv.has_constipation) { score += 0.12; weightSum += 0.12; }
  if (fv.has_narrow_stool) { score += 0.18; weightSum += 0.18; }
  if (fv.has_bloating) { score += 0.08; weightSum += 0.08; }
  if (fv.has_weight_loss) { score += 0.12; weightSum += 0.12; }
  if (fv.has_abdominal_pain) { score += 0.08; weightSum += 0.08; }

  // Lab values
  if (fv.hemoglobin_normalized > 0.2) { score += 0.12; weightSum += 0.12; }

  return Math.min(score / Math.max(weightSum, 1), 1);
};

/**
 * Calculates blood cancer risk score
 * 
 * Key risk factors:
 * - Age (bimodal: young or old)
 * - Family history
 * - Anemia history
 * - Recurrent infections, bruising, bone pain
 * - Abnormal blood counts
 */
const calculateBloodRisk = (fv: FeatureVector, input: PredictionInput): number => {
  let score = 0;
  let weightSum = 0;

  // Demographics (bimodal age risk)
  const ageRisk = input.age < 20 || input.age > 60 ? 0.6 : 0.2;
  score += ageRisk * 0.12;
  weightSum += 0.12;

  // Medical history
  if (fv.has_family_cancer) { score += 0.15; weightSum += 0.15; }
  if (fv.has_anemia) { score += 0.15; weightSum += 0.15; }
  if (fv.has_hepatitis) { score += 0.1; weightSum += 0.1; }

  // Symptoms
  if (fv.has_fatigue) { score += 0.15; weightSum += 0.15; }
  if (fv.has_bruising) { score += 0.2; weightSum += 0.2; }
  if (fv.has_nosebleeds) { score += 0.15; weightSum += 0.15; }
  if (fv.has_infections) { score += 0.2; weightSum += 0.2; }
  if (fv.has_bone_pain) { score += 0.2; weightSum += 0.2; }
  if (fv.has_swollen_lymph) { score += 0.25; weightSum += 0.25; }
  if (fv.has_pale_skin) { score += 0.12; weightSum += 0.12; }
  if (fv.has_weight_loss) { score += 0.1; weightSum += 0.1; }

  // Lab values (most important for blood cancer)
  if (fv.hemoglobin_normalized > 0.3) { score += 0.2; weightSum += 0.2; }
  if (fv.wbc_normalized > 0.3) { score += 0.2; weightSum += 0.2; }
  if (fv.platelet_normalized > 0.3) { score += 0.2; weightSum += 0.2; }

  return Math.min(score / Math.max(weightSum, 1), 1);
};

/**
 * Determines confidence level based on data completeness and symptom clarity
 */
const calculateConfidence = (fv: FeatureVector, score: number): 'Low' | 'Medium' | 'High' => {
  // Base confidence from data availability
  let confidenceScore = 0.3 + (fv.lab_data_available * 0.4);
  
  // Higher scores with supporting evidence increase confidence
  if (score > 0.5) {
    confidenceScore += 0.2;
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
  input: PredictionInput
): string => {
  const factors: string[] = [];
  const protective: string[] = [];

  if (input.age <= 40) protective.push('young age');
  else if (input.age >= 60) factors.push('age over 60');
  
  if (fv.has_family_cancer) factors.push('family cancer history');
  if (input.bmi >= 18.5 && input.bmi <= 25) protective.push('healthy BMI');
  else if (input.bmi > 30) factors.push('obesity');

  if (cancerType === 'pancreatic') {
    if (fv.has_jaundice) factors.push('jaundice');
    if (fv.has_new_diabetes) factors.push('newly developed diabetes');
    if (fv.has_back_pain) factors.push('back pain');
    if (!fv.smoking_score) protective.push('non-smoker status');
    else if (fv.smoking_score > 0.5) factors.push('smoking');
  }

  if (cancerType === 'colon') {
    if (fv.has_blood_in_stool) factors.push('blood in stool');
    if (fv.has_ibd) factors.push('IBD history');
    if (fv.has_narrow_stool) factors.push('changes in stool');
    if (fv.activity_score < 0.3) protective.push('active lifestyle');
    else if (fv.activity_score > 0.7) factors.push('sedentary lifestyle');
  }

  if (cancerType === 'blood') {
    if (fv.has_swollen_lymph) factors.push('swollen lymph nodes');
    if (fv.has_infections) factors.push('recurrent infections');
    if (fv.has_bruising) factors.push('easy bruising');
    if (fv.wbc_normalized > 0.3) factors.push('abnormal WBC count');
    if (fv.hemoglobin_normalized === 0 && input.hemoglobin) protective.push('normal hemoglobin');
  }

  let explanation = '';
  if (protective.length > 0) {
    explanation += `Your ${protective.slice(0, 2).join(' and ')} ${protective.length > 1 ? 'lower' : 'lowers'} your ${cancerType} cancer risk`;
  }
  if (factors.length > 0) {
    if (explanation) explanation += ', but ';
    else explanation = 'Your ';
    explanation += `${factors.slice(0, 2).join(' and ')} slightly ${factors.length > 1 ? 'increase' : 'increases'} your baseline risk`;
  }
  if (!explanation) {
    explanation = `Based on your profile, no significant risk factors were identified for ${cancerType} cancer`;
  }
  
  return explanation + '.';
};

/**
 * Identifies and ranks the top contributing factors across all cancer types
 */
const rankFactors = (fv: FeatureVector, input: PredictionInput): RiskFactor[] => {
  const factors: RiskFactor[] = [];

  // Age factor
  if (input.age > 60) {
    factors.push({ name: 'Age over 60', impact: 'increases', weight: 0.8, cancerType: 'general' });
  } else if (input.age < 40) {
    factors.push({ name: 'Young age (under 40)', impact: 'decreases', weight: 0.7, cancerType: 'general' });
  }

  // Family history
  if (fv.has_family_cancer) {
    factors.push({ name: 'Family cancer history', impact: 'increases', weight: 0.85, cancerType: 'general' });
  }

  // BMI
  if (input.bmi >= 18.5 && input.bmi <= 25) {
    factors.push({ name: 'Healthy body weight', impact: 'decreases', weight: 0.6, cancerType: 'general' });
  } else if (input.bmi > 30) {
    factors.push({ name: 'Obesity (BMI > 30)', impact: 'increases', weight: 0.65, cancerType: 'general' });
  }

  // Lifestyle factors
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

  // Symptoms
  if (fv.has_jaundice) {
    factors.push({ name: 'Jaundice symptoms', impact: 'increases', weight: 0.9, cancerType: 'pancreatic' });
  }
  if (fv.has_blood_in_stool) {
    factors.push({ name: 'Blood in stool', impact: 'increases', weight: 0.9, cancerType: 'colon' });
  }
  if (fv.has_swollen_lymph) {
    factors.push({ name: 'Swollen lymph nodes', impact: 'increases', weight: 0.9, cancerType: 'blood' });
  }
  if (fv.has_weight_loss) {
    factors.push({ name: 'Unexplained weight loss', impact: 'increases', weight: 0.75, cancerType: 'general' });
  }
  if (fv.has_fatigue) {
    factors.push({ name: 'Chronic fatigue', impact: 'increases', weight: 0.6, cancerType: 'blood' });
  }
  if (fv.has_new_diabetes) {
    factors.push({ name: 'Newly developed diabetes', impact: 'increases', weight: 0.8, cancerType: 'pancreatic' });
  }
  if (fv.has_bruising) {
    factors.push({ name: 'Easy bruising', impact: 'increases', weight: 0.75, cancerType: 'blood' });
  }
  if (fv.has_ibd) {
    factors.push({ name: 'Inflammatory bowel disease', impact: 'increases', weight: 0.8, cancerType: 'colon' });
  }

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

  // Sort by weight
  return factors.sort((a, b) => b.weight - a.weight);
};

// ============================================================================
// MAIN PREDICTION FUNCTION
// ============================================================================

/**
 * Generates comprehensive cancer risk predictions
 * 
 * @param input - Raw form data from user
 * @returns PredictionResult with scores, explanations, and debug data
 */
export const generatePrediction = (input: PredictionInput): PredictionResult => {
  // Step 1: Extract feature vector
  const featureVector = extractFeatureVector(input);

  // Step 2: Calculate raw risk scores
  const pancreaticRaw = calculatePancreaticRisk(featureVector, input);
  const colonRaw = calculateColonRisk(featureVector, input);
  const bloodRaw = calculateBloodRisk(featureVector, input);

  // Step 3: Determine risk labels
  const getRiskLabel = (score: number): 'Low' | 'Medium' | 'High' => {
    if (score < THRESHOLDS.LOW_RISK) return 'Low';
    if (score < THRESHOLDS.MEDIUM_RISK) return 'Medium';
    return 'High';
  };

  // Step 4: Build result object
  const result: PredictionResult = {
    pancreatic: {
      probability: Math.round(pancreaticRaw * 100) / 100,
      confidence: calculateConfidence(featureVector, pancreaticRaw),
      riskLabel: getRiskLabel(pancreaticRaw),
      explanation: generateExplanation('pancreatic', pancreaticRaw, featureVector, input),
      rawScore: pancreaticRaw,
    },
    colon: {
      probability: Math.round(colonRaw * 100) / 100,
      confidence: calculateConfidence(featureVector, colonRaw),
      riskLabel: getRiskLabel(colonRaw),
      explanation: generateExplanation('colon', colonRaw, featureVector, input),
      rawScore: colonRaw,
    },
    blood: {
      probability: Math.round(bloodRaw * 100) / 100,
      confidence: calculateConfidence(featureVector, bloodRaw),
      riskLabel: getRiskLabel(bloodRaw),
      explanation: generateExplanation('blood', bloodRaw, featureVector, input),
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
      thresholds: {
        lowRisk: THRESHOLDS.LOW_RISK,
        mediumRisk: THRESHOLDS.MEDIUM_RISK,
        highRisk: 1.0,
        lowConfidence: THRESHOLDS.LOW_CONFIDENCE,
        mediumConfidence: THRESHOLDS.MEDIUM_CONFIDENCE,
      },
      dataCompleteness: featureVector.lab_data_available,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  // Extract top feature names for backward compatibility
  result.topFeatures = result.rankedFactors
    .slice(0, 5)
    .map((f) => f.name);

  if (result.topFeatures.length === 0) {
    result.topFeatures = ['No significant risk factors identified'];
  }

  return result;
};

/**
 * Calculates BMI and returns category
 */
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
