import { CancerRiskResult, RiskFactor, DebugData } from './predictionEngine';

export interface TestResult {
  id: string;
  date: string;
  predictions: {
    pancreatic: CancerRiskResult;
    colon: CancerRiskResult;
    blood: CancerRiskResult;
  };
  rankedFactors?: RiskFactor[];
  debugData?: DebugData;
  inputSummary?: {
    age: number;
    gender: string;
    bmi: number;
    bloodGroup: string;
    keySymptoms: string[];
    labValues: Record<string, number | undefined>;
    lifestyle: Record<string, string>;
  };
  // Form data for research mode and export
  formData?: Record<string, any>;
  // Legacy fields for backwards compatibility
  topFeatures?: string[];
  aiAnalysis?: string;
  medicalReport?: {
    fileName: string;
    fileType?: string;
    uploadedAt?: string;
    text?: string;
  };
}

const STORAGE_KEY = 'canary_reports';

export const generateId = (): string => {
  return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getReports = (): TestResult[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const getReportById = (id: string): TestResult | null => {
  return getReports().find(r => r.id === id) || null;
};

export const saveReport = (report: TestResult): void => {
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const deleteReport = (id: string): void => {
  const reports = getReports().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const clearAllReports = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getLatestReport = (): TestResult | null => {
  const reports = getReports();
  if (reports.length === 0) return null;
  reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return reports[0];
};

export const getReportCount = (): number => getReports().length;
