/**
 * PDF Export Utilities for CANary
 * Handles client-side PDF generation with embedded research disclaimers.
 */

import { jsPDF } from 'jspdf';
import { TestResult } from './storage';

const COLORS = {
  primary: [59, 130, 246] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  dark: [31, 41, 55] as [number, number, number],
};

const getRiskColor = (prob: number): [number, number, number] => {
  if (prob >= 60) return COLORS.danger;
  if (prob >= 30) return COLORS.warning;
  return COLORS.success;
};

const formatDate = (d: string) => 
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const convertToExportable = (report: TestResult) => {
  const p = report.predictions;
  const f = (report.formData ?? {}) as Record<string, unknown>;

  const bmi =
    typeof f.height !== "undefined" && typeof f.weight !== "undefined"
      ? Number(f.weight) / Math.pow(Number(f.height) / 100, 2)
      : undefined;

  const bmiCategory =
    bmi === undefined
      ? "Unknown"
      : bmi < 18.5
      ? "Underweight"
      : bmi < 25
      ? "Normal"
      : bmi < 30
      ? "Overweight"
      : "Obese";

  const recommendations: string[] = [
    "CANary is an investigational prototype. Outputs are relative risk scores, not a diagnosis.",
    "Share this report with a qualified healthcare provider for clinical evaluation and follow-up."
  ];

  return {
    metadata: {
      id: report.id,
      date: report.date,
      disclaimer: "Investigational research prototype. Not an FDA/CE cleared medical device. Not for clinical decision making.",
    },
    riskAssessment: {
      pancreatic: p?.pancreatic ?? { probability: 0, riskLabel: "Low" as const, confidence: "Low" as const },
      colon: p?.colon ?? { probability: 0, riskLabel: "Low" as const, confidence: "Low" as const },
      blood: p?.blood ?? { probability: 0, riskLabel: "Low" as const, confidence: "Low" as const },
    },
    keyFactors: report.rankedFactors ?? [],
    demographics: {
      age: f.age ? String(f.age) : 'N/A',
      gender: typeof f.gender === "string" ? f.gender : 'N/A',
      bmi: bmi !== undefined ? `${Math.round(bmi * 10) / 10} (${bmiCategory})` : 'N/A',
      bloodGroup: typeof f.bloodGroup === "string" ? f.bloodGroup : 'N/A',
    },
    recommendations,
  };
};

export const generateReportPDF = (report: TestResult): void => {
  const doc = new jsPDF();
  const exportable = convertToExportable(report);
  let yPos = 20;

  doc.setFontSize(22);
  doc.setTextColor(...COLORS.primary);
  doc.text('CANary Research Assessment', 20, yPos);
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Report ID: ${report.id} | Generated: ${formatDate(report.date)}`, 20, yPos + 8);
  
  yPos += 20;

  doc.setFillColor(254, 243, 199);
  doc.roundedRect(15, yPos, 180, 16, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.dark);
  doc.text(exportable.metadata.disclaimer, 20, yPos + 10);
  yPos += 24;

  doc.setFontSize(13);
  doc.setTextColor(...COLORS.dark);
  doc.text('Risk Stratification Overview', 20, yPos);
  yPos += 8;

  const cancerTypes = ['pancreatic', 'colon', 'blood'] as const;
  const cancerLabels = { pancreatic: 'Pancreatic Risk Index', colon: 'Colon Risk Index', blood: 'Hematologic Risk Index' };

  cancerTypes.forEach((type) => {
    const risk = exportable.riskAssessment[type];
    const prob = Math.round(risk.probability * 100);
    const color = getRiskColor(prob);
    
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(15, yPos, 180, 20, 2, 2, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.dark);
    doc.text(cancerLabels[type], 20, yPos + 8);
    
    doc.setFontSize(13);
    doc.setTextColor(...color);
    doc.text(`${prob}%`, 160, yPos + 10);
    
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(`Classification: ${risk.riskLabel} | Confidence: ${risk.confidence}`, 20, yPos + 15);
    
    yPos += 24;
  });

  doc.save(`CANary-Assessment-${formatDate(report.date)}.pdf`);
};

export const generateFilteredReportsPDF = (
  reports: TestResult[],
  dateRange?: { from?: Date; to?: Date }
): void => {
  const doc = new jsPDF();
  let yPos = 20;

  doc.setFontSize(22);
  doc.setTextColor(...COLORS.primary);
  doc.text('CANary Longitudinal Trend Report', 20, yPos);
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Total Records: ${reports.length} | Generated: ${formatDate(new Date().toISOString())}`, 20, yPos + 8);
  yPos += 25;

  reports.slice(0, 15).forEach((report) => {
    const p = report.predictions;
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.dark);
    doc.text(`${formatDate(report.date)} — Pancreatic: ${Math.round((p?.pancreatic?.probability ?? 0) * 100)}% | Colon: ${Math.round((p?.colon?.probability ?? 0) * 100)}% | Blood: ${Math.round((p?.blood?.probability ?? 0) * 100)}%`, 20, yPos);
    yPos += 8;
  });

  doc.save(`CANary-Trends-${formatDate(new Date().toISOString())}.pdf`);
};

export const generateComparisonPDF = (reportA: TestResult, reportB: TestResult): void => {
  generateReportPDF(reportB);
};
