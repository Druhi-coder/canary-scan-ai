const API_BASE = 'https://canary-api-jieu.onrender.com';

export interface MLPrediction {
  pancreatic: number | null;
  colon: number | null;
  blood: number | null;
  mlAvailable: boolean;
}

export const fetchMLPredictions = async (input: any): Promise<MLPrediction> => {
  try {
    const [pancreatic, colon, blood] = await Promise.all([
      fetch(`${API_BASE}/predict/pancreatic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: input.age,
          sex: input.gender,
          plasma_CA19_9: input.ca199 ?? 10,
          creatinine: 1.0,
          LYVE1: 1.0,
          REG1B: 50,
          TFF1: 500,
          REG1A: 50,
        }),
        signal: AbortSignal.timeout(5000),
      }).then(r => r.json()),

      fetch(`${API_BASE}/predict/colon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ radius_mean: 14 }),
        signal: AbortSignal.timeout(5000),
      }).then(r => r.json()),

      fetch(`${API_BASE}/predict/blood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hemoglobin: input.hemoglobin ?? 14,
          wbc: input.wbcCount ?? 7000,
          rbc: 4.5,
          hematocrit: 42,
          mcv: 90,
          mch: 30,
          mchc: 33,
          platelet_count: input.plateletCount ?? 250000,
          rdw: 13,
        }),
        signal: AbortSignal.timeout(5000),
      }).then(r => r.json()),
    ]);

    return {
      pancreatic: pancreatic.cancer_probability / 100,
      colon: colon.malignant_probability / 100,
      blood: blood.probabilities ? 
        (blood.probabilities['Severe'] ?? 0) / 100 : null,
      mlAvailable: true,
    };
  } catch {
    return { pancreatic: null, colon: null, blood: null, mlAvailable: false };
  }
};
