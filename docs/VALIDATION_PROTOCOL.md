# CANary System Validation Protocol (v1.0)

## Purpose
This document defines the validation workflow for the CANary AI screening system, including security verification, risk calibration checks, and data persistence testing.

---

## System Status

### Security Verification
- Row Level Security (RLS) is enabled on the `assessments` table  
- Policies implemented: SELECT, INSERT, UPDATE, DELETE  
- All operations are scoped to `auth.uid() = user_id`  
- Security scan warning regarding "No RLS Policies" is a false positive  
- Database linter reports one minor issue (leaked password protection disabled), which is non-blocking  

---

## Prerequisites
Authentication is required to test the full system workflow.  
Ensure a valid user session is active before executing the test plan.

---

## Test Procedure

### Step 1: Access Assessment Interface
- Navigate to: **Start CANary Scan**
- Confirm that the assessment form loads correctly

---

### Step 2: Input Test Data
Use a high-risk synthetic profile:

- **Demographics**: Age 62, Male, BMI ≈ 28  
- **Risk Factors**: Current smoker, family history of cancer, diabetes  
- **Symptoms**: Jaundice, blood in stool, unexplained weight loss  
- **Lab Values** (if available): Elevated CA 19-9, low hemoglobin  

---

### Step 3: Validate Risk Output
- Confirm model outputs align with v2.0 literature-calibrated weights  

Expected ranges:

- **Pancreatic Cancer**: 40–55% (Medium–High)  
  - Influenced by smoking (OR 1.74), diabetes (RR 1.82)  

- **Colon Cancer**: 45–60% (Medium–High)  
  - Influenced by smoking and family history (RR 2.24)  

- **Blood Cancer**: 20–35% (Low–Medium)  
  - Lower due to fewer direct contributing factors  

---

### Step 4: UI & Explainability Checks
- Verify confidence levels are displayed with tooltip explanations  
- Confirm "Evidence Base & References" renders all citations with DOI links  
- Validate interpretability outputs (risk factors, protective factors)  

---

### Step 5: Data Persistence
- Confirm assessment is stored in the database  
- Navigate to **My Reports** and verify retrieval  
- Ensure report consistency across sessions  

---

## Notes
- Outputs represent screening-level risk estimates, not diagnostic conclusions  
- Model performance is calibrated using synthetic and literature-derived distributions  
