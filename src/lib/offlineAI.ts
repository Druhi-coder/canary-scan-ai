// Offline AI analysis using browser-safe keyword heuristics.
// Operates deterministically without heavy neural transformer dependencies.

export interface OfflineAnalysisContext {
  age?: number;
  gender?: string;
  abdominalPain?: boolean;
  weightLoss?: boolean;
  bloodInStool?: boolean;
  changeInBowelHabits?: boolean;
  unexplainedBruising?: boolean;
  fatigue?: boolean;
}

export const initializeOfflineAI = async (
  _onProgress?: (progress: number) => void
): Promise => {
  // Retained for API compatibility with legacy callers
};

export const analyzeReportOffline = async (
  reportText: string,
  formData: OfflineAnalysisContext
): Promise => {
  return generateMedicalAnalysis(reportText, formData);
};

function generateMedicalAnalysis(
  reportText: string,
  formData: OfflineAnalysisContext
): string {
  const textLower = reportText.toLowerCase();
  const findings: string[] = [];

  const pancreaticMarkers = ["ca 19-9", "ca19-9", "pancreas", "pancreatic", "amylase", "lipase"];
  const colonMarkers = ["cea", "colon", "colorectal", "stool", "hemoccult", "colonoscopy"];
  const bloodMarkers = ["hemoglobin", "wbc", "white blood cell", "platelet", "anemia", "leukemia", "lymphoma"];
  const abnormalIndicators = ["high", "elevated", "low", "decreased", "abnormal", "concerning"];

  const hasPancreaticMarkers = pancreaticMarkers.some((m) => textLower.includes(m));
  const hasColonMarkers = colonMarkers.some((m) => textLower.includes(m));
  const hasBloodMarkers = bloodMarkers.some((m) => textLower.includes(m));
  const hasAbnormalValues = abnormalIndicators.some((m) => textLower.includes(m));

  findings.push("## Offline Analysis Report");
  findings.push(
    "*Note: This is a keyword-based offline analysis. For detailed interpretation, please connect to the internet.*\n"
  );

  if (hasPancreaticMarkers) {
    findings.push("### Pancreatic health indicators detected");
    findings.push(
      "Your report contains pancreatic-related markers. Combined with your questionnaire responses:"
    );
    if (formData.abdominalPain || formData.weightLoss) {
      findings.push("- ⚠️ Assessment shows relevant symptoms (abdominal pain / weight loss)");
      findings.push("- Recommendation: consult a healthcare provider for comprehensive evaluation");
    } else {
      findings.push("- ✓ Assessment shows no immediate concerning symptoms");
    }
    findings.push("");
  }

  if (hasColonMarkers) {
    findings.push("### Colorectal health indicators detected");
    findings.push(
      "Your report contains colon-related markers. Combined with your questionnaire responses:"
    );
    if (formData.bloodInStool || formData.changeInBowelHabits) {
      findings.push("- ⚠️ Assessment shows relevant symptoms (blood in stool / bowel changes)");
      findings.push("- Recommendation: follow up with a gastroenterologist");
    } else {
      findings.push("- ✓ Assessment shows no immediate concerning symptoms");
    }
    findings.push("");
  }

  if (hasBloodMarkers) {
    findings.push("### Blood health indicators detected");
    findings.push(
      "Your report contains blood-related markers. Combined with your questionnaire responses:"
    );
    if (formData.unexplainedBruising || formData.fatigue) {
      findings.push("- ⚠️ Assessment shows relevant symptoms (bruising / fatigue)");
      findings.push("- Recommendation: discuss results with a haematologist");
    } else {
      findings.push("- ✓ Assessment shows no immediate concerning symptoms");
    }
    findings.push("");
  }

  if (hasAbnormalValues) {
    findings.push("### Abnormal values noted");
    findings.push(
      "The report contains language indicating abnormal or concerning values. Review all flagged values with your healthcare provider.\n"
    );
  }

  if (!hasPancreaticMarkers && !hasColonMarkers && !hasBloodMarkers) {
    findings.push("### General health report");
    findings.push(
      "No specific cancer-related markers detected in the uploaded report. Your assessment results are based on the questionnaire data only.\n"
    );
  }

  findings.push("### Important notes");
  findings.push("- This offline analysis uses keyword matching only");
  findings.push("- For AI-powered interpretation, please connect to the internet");
  findings.push("- Always consult qualified healthcare professionals for medical decisions");
  findings.push(
    "- CANary is an investigational prototype. Outputs are probability scores, not diagnoses."
  );

  return findings.join("\n");
}

export const isOnline = (): boolean => navigator.onLine;
