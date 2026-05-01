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

          // ✅ Use real input if available, fallback otherwise
          plasma_CA19_9: input.ca199 ?? 10,
          creatinine: input.creatinine ?? 1.0,
          LYVE1: input.lyve1 ?? 1.0,
          REG1B: input.reg1b ?? 50,
          TFF1: input.tff1 ?? 500,
          REG1A: input.reg1a ?? 50,
        }),
        signal: AbortSignal.timeout(5000),
      })
        .then(res => res.json())
        .then(data => {
          console.log("Pancreatic response:", data);
          return data;
        }),

      fetch(`${API_BASE}/predict/colon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          radius_mean: input.radius_mean ?? 14,
        }),
        signal: AbortSignal.timeout(5000),
      })
        .then(res => res.json())
        .then(data => {
          console.log("Colon response:", data);
          return data;
        }),

      fetch(`${API_BASE}/predict/blood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hemoglobin: input.hemoglobin ?? 14,
          wbc: input.wbcCount ?? 7000,
          rbc: input.rbc ?? 4.5,
          hematocrit: input.hematocrit ?? 42,
          mcv: input.mcv ?? 90,
          mch: input.mch ?? 30,
          mchc: input.mchc ?? 33,
          platelet_count: input.plateletCount ?? 250000,
          rdw: input.rdw ?? 13,
        }),
        signal: AbortSignal.timeout(5000),
      })
        .then(res => res.json())
        .then(data => {
          console.log("Blood response:", data);
          return data;
        }),
    ]);

    return {
      pancreatic:
        pancreatic?.cancer_probability != null
          ? pancreatic.cancer_probability / 100
          : null,

      colon:
        colon?.malignant_probability != null
          ? colon.malignant_probability / 100
          : null,

      blood:
        blood?.probabilities?.Severe != null
          ? blood.probabilities.Severe / 100
          : null,

      mlAvailable: true,
    };
  } catch (err) {
    console.error("ML API error:", err);

    return {
      pancreatic: null,
      colon: null,
      blood: null,
      mlAvailable: false,
    };
  }
};
