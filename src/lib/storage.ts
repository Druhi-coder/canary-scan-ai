// Local storage utilities for CANary reports

export interface TestResult {
  id: string;
  date: string;
  predictions: {
    pancreatic: { probability: number; confidence: string };
    colon: { probability: number; confidence: string };
    blood: { probability: number; confidence: string };
  };
  formData: any;
  topFeatures: string[];
  medicalReport?: { text: string; fileName: string };
  aiAnalysis?: string;
}

const STORAGE_KEY = 'canary_reports';

export const saveReport = (report: TestResult): void => {
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const getReports = (): TestResult[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getReportById = (id: string): TestResult | undefined => {
  const reports = getReports();
  return reports.find(r => r.id === id);
};

export const deleteReport = (id: string): void => {
  const reports = getReports().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
};

export const clearAllReports = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
