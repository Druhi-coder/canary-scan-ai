

# Plan: Maximize CANary Accuracy as an AI-Powered Early Cancer Detector

## Current State

The system uses a **v2.0 literature-calibrated weighted scoring engine** with ~15 peer-reviewed citations, an optional AI refinement layer (`ml-predict` edge function), and medical report analysis via Gemini AI. It's solid for a research prototype but has clear accuracy gaps.

## Key Accuracy Improvements

### 1. Add Symptom Duration Weighting
**Problem**: Duration fields exist in the form (`fatigueDuration`, `bloodInStoolDuration`, etc.) but are **completely ignored** by the prediction engine.  
**Fix**: Weight symptoms higher when they persist longer (e.g., blood in stool for >4 weeks is far more concerning than 2 days). Add duration multipliers in `predictionEngine.ts`.

### 2. Add Symptom Cluster Detection (Cross-Factor Interactions)
**Problem**: Each symptom is scored independently. In clinical practice, **combinations** are far more predictive (e.g., jaundice + weight loss + back pain together is highly specific for pancreatic cancer).  
**Fix**: Add cluster bonus scoring — when 2-3 co-occurring symptoms match a known clinical presentation pattern, apply a multiplicative boost (1.2-1.5x) to that cancer's score.

```text
Cluster examples:
  Pancreatic: jaundice + weight_loss + back_pain → 1.4x boost
  Colon:      blood_in_stool + narrow_stool + weight_loss → 1.3x boost  
  Blood:      bruising + infections + swollen_lymph → 1.4x boost
```

### 3. Integrate the ML-Predict Edge Function into the Assessment Flow
**Problem**: The `ml-predict` edge function exists but is **never called** from `StartTest.tsx`. The AI refinement layer is completely unused.  
**Fix**: After generating the client-side prediction, call `ml-predict` to get AI-powered adjustments (cross-factor interaction analysis via Gemini). Merge the AI adjustments into the final scores.

### 4. Add Gender-Specific Risk Modifiers
**Problem**: Gender (`is_male`/`is_female`) is extracted into the feature vector but **never used** in any risk calculation.  
**Fix**: Apply gender-specific modifiers based on epidemiological data (e.g., pancreatic cancer ~1.3x more common in males, CRC ~1.2x more in males).

### 5. Add More Biomarkers to Lab Input
**Problem**: Only 5 lab values are collected. Key cancer markers are missing.  
**Fix**: Add CA 19-9 (pancreatic), CEA (colon), and LDH (blood cancer) as optional lab inputs. These are the most clinically relevant tumor markers for these three cancers.

### 6. Improve Confidence Calibration
**Problem**: Confidence is calculated simplistically (data completeness + score threshold). It doesn't account for how many symptoms are checked or whether the symptom pattern is consistent.  
**Fix**: Factor in symptom count, symptom-cluster coherence, and whether risk factors align with each other (e.g., high symptom score but no lifestyle risk factors = lower confidence).

### 7. Add Age-Adjusted Base Rates (Bayesian Prior)
**Problem**: The engine has no population base rate. A 25-year-old and a 70-year-old with zero symptoms both score similarly low, but their actual baseline risks differ by 10-50x.  
**Fix**: Incorporate SEER age-specific incidence rates as Bayesian priors, so the starting point reflects actual population risk before symptom/lifestyle factors are layered on.

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/predictionEngine.ts` | Duration weighting, cluster detection, gender modifiers, Bayesian priors, improved confidence |
| `src/lib/riskWeights.ts` | Add cluster definitions, gender modifiers, base rate constants, tumor marker weights |
| `src/lib/citations.ts` | Add citations for SEER base rates, tumor marker studies, cluster validation studies |
| `src/pages/StartTest.tsx` | Call `ml-predict` after local prediction, add CA 19-9/CEA/LDH lab inputs |
| `src/components/LabValueInput.tsx` | Add pre-configured inputs for new tumor markers |
| `supabase/functions/ml-predict/index.ts` | Improve prompt with cluster data and duration context |

## Implementation Order
1. Symptom duration weighting + gender modifiers (quick wins)
2. Symptom cluster detection (biggest accuracy impact)
3. Add tumor marker lab inputs (CA 19-9, CEA, LDH)
4. Age-adjusted Bayesian priors
5. Integrate ml-predict into assessment flow
6. Improve confidence calibration
7. Update citations

