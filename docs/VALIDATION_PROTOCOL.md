# CANary System Validation Protocol (v1.0)

## Purpose

This document defines the validation workflow for the CANary pancreatic cancer risk estimation system.  
It includes model performance verification, explainability checks, and system-level testing.

---

## Scope

This protocol applies **only to the pancreatic cancer detection module**.  
Other components of the broader CANary system are not included in this validation.

---

## Model Validation Summary

- Dataset: Debernardi et al. (2020)
- Task: Binary classification (Cancer vs No Cancer)
- Model: Gradient Boosting Classifier

### Performance Metrics
- Test AUC-ROC: 0.9817  
- 5-Fold CV AUC: 0.9467 ± 0.0142  
- 95% Confidence Interval: 0.9556 – 0.9970 (bootstrap, 1,000 resamples)

---

## Prerequisites

- Valid user session (for full system testing)
- Backend API accessible
- Model deployed and reachable

---

## Test Procedure

### Step 1: Access Assessment Interface
- Navigate to: **Start CANary Scan**
- Confirm the form loads correctly

---

### Step 2: Input Test Data

Use a representative high-risk profile:

- Age: ~60+
- Sex: Male
- Biomarkers:
  - Elevated CA19-9
  - Abnormal LYVE1 / REG1B / TFF1 values

---

### Step 3: Validate Model Output

- Confirm output is a probability score between 0 and 1  
- High-risk inputs should yield higher predicted probabilities  

Expected behavior:
- Elevated CA19-9 → strong positive influence  
- Biomarker combinations → nonlinear risk increase  

---

### Step 4: Explainability Checks

- SHAP explanations should:
  - Highlight CA19-9 as primary contributor  
  - Show LYVE1 and REG1B as secondary contributors  
- Feature contributions should be directionally consistent with clinical understanding  

---

### Step 5: Calibration Check (Optional)

- Compare predicted probabilities against actual outcomes (if test data available)
- Ensure predictions are not systematically over- or under-confident

---

### Step 6: Data Persistence

- Submit assessment
- Confirm:
  - Data is stored in Supabase
  - Report is retrievable via "My Reports"
  - No cross-user data leakage (RLS enforced)

---

## System-Level Validation

### API Reliability
- Ensure model API responds within acceptable latency
- Validate fallback activation when API fails

---

### Fallback Behavior
- When ML API is unavailable:
  - System should switch to rule-based scoring
  - Output should still provide interpretable risk indication

---

## Notes

- Outputs represent **screening-level risk estimates**, not diagnoses  
- The model has **not been externally validated**  
- Results should not be used for clinical decision-making  

---

## Limitations

- Validation performed on a single dataset  
- No independent cohort testing  
- Real-world deployment data is not used for model evaluation  

---

## Summary

This protocol ensures that the pancreatic cancer detection module operates correctly at both the model and system levels, while maintaining transparency, reliability, and appropriate scope of use.
