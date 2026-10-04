/**
 * CANary ML API Connector
 * =======================
 * Communicates strictly with the validated pancreatic Gradient Boosting endpoint.
 * Colon and hematologic risk assessments are deferred to the local SEER Bayesian engine.
 */

const API_BASE = "https://canary-api-jieu.onrender.com";
const REQUEST_TIMEOUT_MS = 5000;

export interface MLPrediction {
  pancreatic: number | null;
  colon: number | null;
  blood: number | null;
  mlAvailable: boolean;
}

export interface PancreaticMLFeatures {
  age: number;
  sex: string;
  plasma_CA19_9?: number;
  creatinine?: number;
  LYVE1?: number;
  REG1B?: number;
  TFF1?: number;
  REG1A?: number;
}

export interface MLApiInput {
  age: number;
  gender?: string;
  sex?: string;
  ca199?: number;
  creatinine?: number;
  lyve1?: number;
  reg1b?: number;
  tff1?: number;
  reg1a?: number;
}

const timeoutSignal = (ms: number): AbortSignal => {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
};

const finiteNum = (v: number | undefined): number | undefined =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

const buildPancreaticPayload = (input: MLApiInput): PancreaticMLFeatures => {
  const payload: PancreaticMLFeatures = {
    age: input.age,
    sex: input.sex ?? input.gender ?? "unknown",
  };

  const ca199 = finiteNum(input.ca199);
  const creatinine = finiteNum(input.creatinine);
  const lyve1 = finiteNum(input.lyve1);
  const reg1b = finiteNum(input.reg1b);
  const tff1 = finiteNum(input.tff1);
  const reg1a = finiteNum(input.reg1a);

  if (ca199 !== undefined) payload.plasma_CA19_9 = ca199;
  if (creatinine !== undefined) payload.creatinine = creatinine;
  if (lyve1 !== undefined) payload.LYVE1 = lyve1;
  if (reg1b !== undefined) payload.REG1B = reg1b;
  if (tff1 !== undefined) payload.TFF1 = tff1;
  if (reg1a !== undefined) payload.REG1A = reg1a;

  return payload;
};

const parseProbability = (data: unknown): number | null => {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const raw = record.cancer_probability ?? record.probability ?? record.prediction;
  if (typeof raw !== "number" || Number.isNaN(raw)) return null;
  const prob = raw > 1 ? raw / 100 : raw;
  return prob >= 0 && prob <= 1 ? prob : null;
};

const offlineFallback = (): MLPrediction => ({
  pancreatic: null,
  colon: null,
  blood: null,
  mlAvailable: false,
});

export const fetchMLPredictions = async (input: MLApiInput): Promise<MLPrediction> => {
  if (!Number.isFinite(input.age)) return offlineFallback();

  try {
    const res = await fetch(`${API_BASE}/predict/pancreatic`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPancreaticPayload(input)),
      signal: timeoutSignal(REQUEST_TIMEOUT_MS),
    });

    if (!res.ok) return offlineFallback();

    const pancreatic = parseProbability(await res.json());
    return {
      pancreatic,
      colon: null,
      blood: null,
      mlAvailable: pancreatic !== null,
    };
  } catch {
    return offlineFallback();
  }
};
