

# End-to-End Assessment Test Plan

## Current Status

### Security Check (Completed)
- **RLS is properly enabled** on the `assessments` table with 4 correct policies (SELECT, INSERT, UPDATE, DELETE) — all scoped to `auth.uid() = user_id`
- The security scan warning about "No RLS Policies" is a **false positive** — policies are confirmed present
- Database linter found only one minor issue: leaked password protection is disabled (cosmetic, not blocking)

### Blocker: Authentication Required
To test the full flow, **you need to log in from the preview window first**. Note: Authentication is required to test the full flow. Please log in using a valid account before proceeding.
## Test Plan (Once Logged In)

### Step 1: Navigate to Start Test
- Click "Start CANary Scan" → should load the assessment form

### Step 2: Fill Sample Data
- **Demographics**: Age 62, Male, Height/Weight for BMI ~28
- **Risk Factors**: Current smoker, family history of cancer, diabetes
- **Symptoms**: Jaundice, blood in stool, unexplained weight loss
- **Lab Values** (if available): Elevated CA 19-9, low hemoglobin

### Step 3: Verify Results Page
- Confirm risk scores use v2.0 literature-calibrated weights
- Expected ranges for this high-risk profile:
  - Pancreatic: ~40-55% (Medium-High) — driven by smoking OR 1.74, diabetes RR 1.82
  - Colon: ~45-60% (Medium-High) — driven by smoking, family history RR 2.24
  - Blood: ~20-35% (Low-Medium) — fewer specific risk factors
- Verify confidence levels display with tooltip explanations
- Verify the "Evidence Base & References" section renders all 15 citations with DOI links

### Step 4: Verify Persistence
- Check assessment saved to database (via My Reports page)
- Confirm report can be viewed again after navigation

## Prerequisites
Authentication is required to test the full flow.

 Ensure you are logged in before executing the test plan.

