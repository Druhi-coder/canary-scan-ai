// Offline AI analysis using browser-based transformers (CPU compatible)
import { pipeline, env } from '@huggingface/transformers';

// Configure to use CPU and download models
env.allowLocalModels = false;
env.useBrowserCache = true;

let featureExtractor: any = null;

export const initializeOfflineAI = async (onProgress?: (progress: number) => void) => {
  if (featureExtractor) return featureExtractor;
  
  try {
    console.log('Initializing offline AI model...');
    featureExtractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        progress_callback: (progress: any) => {
          if (progress.status === 'progress' && onProgress) {
            onProgress(progress.progress || 0);
          }
        }
      }
    );
    console.log('Offline AI model initialized');
    return featureExtractor;
  } catch (error) {
    console.error('Failed to initialize offline AI:', error);
    throw error;
  }
};

export const analyzeReportOffline = async (reportText: string, formData: any): Promise<string> => {
  try {
    // Simple keyword-based analysis for medical reports (CPU-friendly)
    const analysis = generateMedicalAnalysis(reportText, formData);
    return analysis;
  } catch (error) {
    console.error('Offline analysis error:', error);
    throw error;
  }
};

function generateMedicalAnalysis(reportText: string, formData: any): string {
  const textLower = reportText.toLowerCase();
  
  // Detect medical keywords and markers
  const findings: string[] = [];
  
  // Pancreatic markers
  const pancreaticMarkers = ['ca 19-9', 'ca19-9', 'pancreas', 'pancreatic', 'amylase', 'lipase'];
  const hasPancreaticMarkers = pancreaticMarkers.some(marker => textLower.includes(marker));
  
  // Colon markers
  const colonMarkers = ['cea', 'colon', 'colorectal', 'stool', 'hemoccult', 'colonoscopy'];
  const hasColonMarkers = colonMarkers.some(marker => textLower.includes(marker));
  
  // Blood markers
  const bloodMarkers = ['hemoglobin', 'wbc', 'white blood cell', 'platelet', 'anemia', 'leukemia', 'lymphoma'];
  const hasBloodMarkers = bloodMarkers.some(marker => textLower.includes(marker));
  
  // Abnormal value indicators
  const abnormalIndicators = ['high', 'elevated', 'low', 'decreased', 'abnormal', 'concerning'];
  const hasAbnormalValues = abnormalIndicators.some(indicator => textLower.includes(indicator));
  
  findings.push('## Offline Analysis Report');
  findings.push('*Note: This is a basic offline analysis. For detailed insights, please connect to the internet.*\n');
  
  if (hasPancreaticMarkers) {
    findings.push('### Pancreatic Health Indicators Detected');
    findings.push('Your report contains pancreatic-related markers. Combined with your assessment:');
    if (formData.abdominalPain || formData.weightLoss) {
      findings.push('- ⚠️ Assessment shows relevant symptoms (abdominal pain/weight loss)');
      findings.push('- Recommendation: Consult with healthcare provider for comprehensive evaluation');
    } else {
      findings.push('- ✓ Assessment shows no immediate concerning symptoms');
    }
    findings.push('');
  }
  
  if (hasColonMarkers) {
    findings.push('### Colorectal Health Indicators Detected');
    findings.push('Your report contains colon-related markers. Combined with your assessment:');
    if (formData.bloodInStool || formData.changeInBowelHabits) {
      findings.push('- ⚠️ Assessment shows relevant symptoms (blood in stool/bowel changes)');
      findings.push('- Recommendation: Follow up with gastroenterologist');
    } else {
      findings.push('- ✓ Assessment shows no immediate concerning symptoms');
    }
    findings.push('');
  }
  
  if (hasBloodMarkers) {
    findings.push('### Blood Health Indicators Detected');
    findings.push('Your report contains blood-related markers. Combined with your assessment:');
    if (formData.unexplainedBruising || formData.fatigue) {
      findings.push('- ⚠️ Assessment shows relevant symptoms (bruising/fatigue)');
      findings.push('- Recommendation: Discuss results with hematologist');
    } else {
      findings.push('- ✓ Assessment shows no immediate concerning symptoms');
    }
    findings.push('');
  }
  
  if (hasAbnormalValues) {
    findings.push('### Abnormal Values Noted');
    findings.push('The report contains language indicating abnormal or concerning values.');
    findings.push('Recommendation: Review all flagged values with your healthcare provider.\n');
  }
  
  if (!hasPancreaticMarkers && !hasColonMarkers && !hasBloodMarkers) {
    findings.push('### General Health Report');
    findings.push('No specific cancer-related markers detected in the uploaded report.');
    findings.push('Your assessment results are based on the questionnaire data.\n');
  }
  
  findings.push('### Important Notes');
  findings.push('- This offline analysis uses basic keyword matching');
  findings.push('- For AI-powered detailed analysis, please connect to the internet');
  findings.push('- Always consult healthcare professionals for medical decisions');
  findings.push('- This tool is for informational purposes only');
  
  return findings.join('\n');
}

export const isOnline = (): boolean => {
  return navigator.onLine;
};
