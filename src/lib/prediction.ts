// Mock AI prediction engine for CANary
// This simulates ML inference with weighted risk calculations

export interface PredictionInput {
  // Demographics
  age: number;
  gender: string;
  bmi: number;
  bloodGroup: string;
  
  // Medical History
  familyCancerHistory: boolean;
  diabetesHistory: boolean;
  ibdHistory: boolean;
  hepatitisHistory: boolean;
  anemiaHistory: boolean;
  
  // Lifestyle
  smoking: string;
  alcohol: string;
  sleep: string;
  physicalActivity: string;
  diet: string;
  stress: string;
  
  // Symptoms
  fatigue: boolean;
  weightLoss: boolean;
  jaundice: boolean;
  abdominalPain: boolean;
  bloodInStool: boolean;
  nausea: boolean;
  paleSkin: boolean;
  bruising: boolean;
  
  // Pancreatic specific
  backPain: boolean;
  newDiabetes: boolean;
  floatingStool: boolean;
  
  // Colon specific
  constipation: boolean;
  narrowStool: boolean;
  bloating: boolean;
  
  // Blood cancer specific
  infections: boolean;
  nosebleeds: boolean;
  bonePain: boolean;
  swollenLymphNodes: boolean;
  
  // Lab data (optional)
  hemoglobin?: number;
  wbcCount?: number;
  plateletCount?: number;
  bilirubin?: number;
  bloodSugar?: number;
}

export interface PredictionResult {
  pancreatic: { probability: number; confidence: string };
  colon: { probability: number; confidence: string };
  blood: { probability: number; confidence: string };
  topFeatures: string[];
}

const calculateRiskScore = (
  baseFactors: number[],
  symptoms: number[],
  labAdjustment: number
): number => {
  const baseScore = baseFactors.reduce((sum, val) => sum + val, 0) / baseFactors.length;
  const symptomScore = symptoms.reduce((sum, val) => sum + val, 0) / symptoms.length;
  const finalScore = (baseScore * 0.4 + symptomScore * 0.5 + labAdjustment * 0.1);
  return Math.min(Math.max(finalScore, 0), 1);
};

const getConfidenceLevel = (probability: number): string => {
  if (probability < 0.3) return "Low";
  if (probability < 0.6) return "Medium";
  return "High";
};

export const generatePrediction = (input: PredictionInput): PredictionResult => {
  // Pancreatic Cancer Risk
  const pancreaticBaseFactors = [
    input.age > 60 ? 0.7 : input.age > 45 ? 0.5 : 0.2,
    input.familyCancerHistory ? 0.8 : 0.1,
    input.diabetesHistory ? 0.6 : 0.1,
    input.smoking === "regularly" || input.smoking === "chain" ? 0.7 : 0.2,
    input.bmi > 30 ? 0.5 : 0.2,
  ];
  
  const pancreaticSymptoms = [
    input.jaundice ? 0.9 : 0,
    input.abdominalPain ? 0.7 : 0,
    input.backPain ? 0.8 : 0,
    input.weightLoss ? 0.7 : 0,
    input.newDiabetes ? 0.8 : 0,
    input.floatingStool ? 0.6 : 0,
  ];
  
  const pancreaticLabAdjustment = (
    (input.bilirubin && input.bilirubin > 1.2 ? 0.7 : 0) +
    (input.bloodSugar && input.bloodSugar > 126 ? 0.6 : 0)
  ) / 2;
  
  const pancreaticScore = calculateRiskScore(
    pancreaticBaseFactors,
    pancreaticSymptoms,
    pancreaticLabAdjustment
  );

  // Colon Cancer Risk
  const colonBaseFactors = [
    input.age > 50 ? 0.7 : input.age > 40 ? 0.4 : 0.2,
    input.familyCancerHistory ? 0.7 : 0.1,
    input.ibdHistory ? 0.8 : 0.1,
    input.diet === "non-vegetarian" ? 0.4 : 0.2,
    input.physicalActivity === "sedentary" ? 0.5 : 0.2,
  ];
  
  const colonSymptoms = [
    input.bloodInStool ? 0.9 : 0,
    input.constipation ? 0.6 : 0,
    input.narrowStool ? 0.7 : 0,
    input.bloating ? 0.5 : 0,
    input.weightLoss ? 0.6 : 0,
    input.abdominalPain ? 0.5 : 0,
  ];
  
  const colonLabAdjustment = (
    (input.hemoglobin && input.hemoglobin < 12 ? 0.6 : 0)
  );
  
  const colonScore = calculateRiskScore(
    colonBaseFactors,
    colonSymptoms,
    colonLabAdjustment
  );

  // Blood Cancer Risk
  const bloodBaseFactors = [
    input.age < 20 || input.age > 60 ? 0.6 : 0.2,
    input.familyCancerHistory ? 0.7 : 0.1,
    input.anemiaHistory ? 0.6 : 0.1,
    input.hepatitisHistory ? 0.5 : 0.1,
  ];
  
  const bloodSymptoms = [
    input.fatigue ? 0.7 : 0,
    input.bruising ? 0.8 : 0,
    input.nosebleeds ? 0.7 : 0,
    input.infections ? 0.8 : 0,
    input.bonePain ? 0.8 : 0,
    input.swollenLymphNodes ? 0.9 : 0,
    input.paleSkin ? 0.6 : 0,
  ];
  
  const bloodLabAdjustment = (
    (input.hemoglobin && input.hemoglobin < 10 ? 0.8 : 0) +
    (input.wbcCount && (input.wbcCount < 4000 || input.wbcCount > 11000) ? 0.7 : 0) +
    (input.plateletCount && input.plateletCount < 150000 ? 0.8 : 0)
  ) / 3;
  
  const bloodScore = calculateRiskScore(
    bloodBaseFactors,
    bloodSymptoms,
    bloodLabAdjustment
  );

  // Identify top contributing features
  const featureScores = [
    { name: "Age-related risk factors", score: input.age > 60 ? 0.9 : 0.5 },
    { name: "Family cancer history", score: input.familyCancerHistory ? 0.9 : 0 },
    { name: "Jaundice symptoms", score: input.jaundice ? 0.9 : 0 },
    { name: "Blood in stool", score: input.bloodInStool ? 0.9 : 0 },
    { name: "Unexplained weight loss", score: input.weightLoss ? 0.8 : 0 },
    { name: "Chronic fatigue", score: input.fatigue ? 0.7 : 0 },
    { name: "Smoking habits", score: input.smoking === "regularly" ? 0.8 : 0 },
    { name: "Swollen lymph nodes", score: input.swollenLymphNodes ? 0.9 : 0 },
    { name: "Abnormal blood counts", score: bloodLabAdjustment * 0.9 },
    { name: "Diabetes indicators", score: input.newDiabetes || input.diabetesHistory ? 0.8 : 0 },
  ];
  
  const topFeatures = featureScores
    .sort((a, b) => b.score - a.score)
    .filter(f => f.score > 0.5)
    .slice(0, 5)
    .map(f => f.name);

  return {
    pancreatic: {
      probability: Math.round(pancreaticScore * 100) / 100,
      confidence: getConfidenceLevel(pancreaticScore),
    },
    colon: {
      probability: Math.round(colonScore * 100) / 100,
      confidence: getConfidenceLevel(colonScore),
    },
    blood: {
      probability: Math.round(bloodScore * 100) / 100,
      confidence: getConfidenceLevel(bloodScore),
    },
    topFeatures: topFeatures.length > 0 ? topFeatures : ["No significant risk factors identified"],
  };
};
