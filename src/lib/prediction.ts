import { fetchMLPredictions } from './mlApi';

export interface PredictionInput {
  age: number;
  gender: string;
  bmi: number;
  bloodGroup: string;
  familyCancerHistory: boolean;
  diabetesHistory: boolean;
  ibdHistory: boolean;
  hepatitisHistory: boolean;
  anemiaHistory: boolean;
  smoking: string;
  alcohol: string;
  sleep: string;
  physicalActivity: string;
  diet: string;
  stress: string;
  fatigue: boolean;
  weightLoss: boolean;
  jaundice: boolean;
  abdominalPain: boolean;
  bloodInStool: boolean;
  nausea: boolean;
  paleSkin: boolean;
  bruising: boolean;
  backPain: boolean;
  newDiabetes: boolean;
  floatingStool: boolean;
  constipation: boolean;
  narrowStool: boolean;
  bloating: boolean;
  infections: boolean;
  nosebleeds: boolean;
  bonePain: boolean;
  swollenLymphNodes: boolean;
  hemoglobin?: number;
  wbcCount?: number;
  plateletCount?: number;
  bilirubin?: number;
  bloodSugar?: number;
  ca199?: number;
}

export interface PredictionResult {
  pancreatic: { probability: number; confidence: string };
  colon: { probability: number; confidence: string };
  blood: { probability: number; confidence: string };
  topFeatures: string[];
  mlPowered?: boolean;
}

const calculateRiskScore = (baseFactors: number[], symptoms: number[], labAdjustment: number): number => {
  const baseScore = baseFactors.reduce((sum, val) => sum + val, 0) / baseFactors.length;
  const symptomScore = symptoms.reduce((sum, val) => sum + val, 0) / symptoms.length;
  return Math.min(Math.max(baseScore * 0.4 + symptomScore * 0.5 + labAdjustment * 0.1, 0), 1);
};

const getConfidenceLevel = (probability: number): string => {
  if (probability < 0.3) return "Low";
  if (probability < 0.6) return "Medium";
  return "High";
};

const getRuleBasedScores = (input: PredictionInput) => {
  const pancreaticScore = calculateRiskScore(
    [
      input.age > 60 ? 0.7 : input.age > 45 ? 0.5 : 0.2,
      input.familyCancerHistory ? 0.8 : 0.1,
      input.diabetesHistory ? 0.6 : 0.1,
      input.smoking === "regularly" || input.smoking === "chain" ? 0.7 : 0.2,
      input.bmi > 30 ? 0.5 : 0.2,
    ],
    [
      input.jaundice ? 0.9 : 0,
      input.abdominalPain ? 0.7 : 0,
      input.backPain ? 0.8 : 0,
      input.weightLoss ? 0.7 : 0,
      input.newDiabetes ? 0.8 : 0,
      input.floatingStool ? 0.6 : 0,
    ],
    ((input.bilirubin && input.bilirubin > 1.2 ? 0.7 : 0) + (input.bloodSugar && input.bloodSugar > 126 ? 0.6 : 0)) / 2
  );

  const colonScore = calculateRiskScore(
    [
      input.age > 50 ? 0.7 : input.age > 40 ? 0.4 : 0.2,
      input.familyCancerHistory ? 0.7 : 0.1,
      input.ibdHistory ? 0.8 : 0.1,
      input.diet === "non-vegetarian" ? 0.4 : 0.2,
      input.physicalActivity === "sedentary" ? 0.5 : 0.2,
    ],
    [
      input.bloodInStool ? 0.9 : 0,
      input.constipation ? 0.6 : 0,
      input.narrowStool ? 0.7 : 0,
      input.bloating ? 0.5 : 0,
      input.weightLoss ? 0.6 : 0,
      input.abdominalPain ? 0.5 : 0,
    ],
    input.hemoglobin && input.hemoglobin < 12 ? 0.6 : 0
  );

  const bloodLabAdj = ((input.hemoglobin && input.hemoglobin < 10 ? 0.8 : 0) + (input.wbcCount && (input.wbcCount < 4000 || input.wbcCount > 11000) ? 0.7 : 0) + (input.plateletCount && input.plateletCount < 150000 ? 0.8 : 0)) / 3;
  const bloodScore = calculateRiskScore(
    [
      input.age < 20 || input.age > 60 ? 0.6 : 0.2,
      input.familyCancerHistory ? 0.7 : 0.1,
      input.anemiaHistory ? 0.6 : 0.1,
      input.hepatitisHistory ? 0.5 : 0.1,
    ],
    [
      input.fatigue ? 0.7 : 0,
      input.bruising ? 0.8 : 0,
      input.nosebleeds ? 0.7 : 0,
      input.infections ? 0.8 : 0,
      input.bonePain ? 0.8 : 0,
      input.swollenLymphNodes ? 0.9 : 0,
      input.paleSkin ? 0.6 : 0,
    ],
    bloodLabAdj
  );

  return { pancreaticScore, colonScore, bloodScore };
};

export const generatePrediction = async (input: PredictionInput): Promise<PredictionResult> => {
  const { pancreaticScore, colonScore, bloodScore } = getRuleBasedScores(input);

  const mlResult = await fetchMLPredictions(input);

  const finalPancreatic = mlResult.mlAvailable && mlResult.pancreatic !== null
    ? (mlResult.pancreatic * 0.6 + pancreaticScore * 0.4)
    : pancreaticScore;

  const finalColon = mlResult.mlAvailable && mlResult.colon !== null
    ? (mlResult.colon * 0.6 + colonScore * 0.4)
    : colonScore;

  const finalBlood = mlResult.mlAvailable && mlResult.blood !== null
    ? (mlResult.blood * 0.6 + bloodScore * 0.4)
    : bloodScore;

  const featureScores = [
    { name: "Age-related risk factors", score: input.age > 60 ? 0.9 : 0.5 },
    { name: "Family cancer history", score: input.familyCancerHistory ? 0.9 : 0 },
    { name: "Jaundice symptoms", score: input.jaundice ? 0.9 : 0 },
    { name: "Blood in stool", score: input.bloodInStool ? 0.9 : 0 },
    { name: "Unexplained weight loss", score: input.weightLoss ? 0.8 : 0 },
    { name: "Chronic fatigue", score: input.fatigue ? 0.7 : 0 },
    { name: "Swollen lymph nodes", score: input.swollenLymphNodes ? 0.9 : 0 },
  ];

  return {
    pancreatic: { probability: Math.round(finalPancreatic * 100) / 100, confidence: getConfidenceLevel(finalPancreatic) },
    colon: { probability: Math.round(finalColon * 100) / 100, confidence: getConfidenceLevel(finalColon) },
    blood: { probability: Math.round(finalBlood * 100) / 100, confidence: getConfidenceLevel(finalBlood) },
    topFeatures: featureScores.filter(f => f.score > 0.5).sort((a, b) => b.score - a.score).slice(0, 5).map(f => f.name),
    mlPowered: mlResult.mlAvailable,
  };
};
