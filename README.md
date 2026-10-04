# CANary: Investigational Risk Stratification & Explainable ML Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Druhi-coder/canary-scan-ai/blob/main/LICENSE)
[![Vercel Deployment](https://img.shields.io/badge/Deployment-Live%20App-success?logo=vercel)](https://canary-scan-ai.vercel.app)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Druhi-coder/canary-scan-ai/blob/main/notebooks/canary_cancer_model.ipynb)

CANary is an investigational computational oncology prototype designed for early-stage pancreatic ductal adenocarcinoma (PDAC) risk stratification using non-invasive urinary biomarkers, paired with a SEER-calibrated Bayesian prior engine for exploratory multi-cancer risk assessment[cite: 1].

> **Investigational Research Disclaimer:**  
> CANary is an academic research prototype developed for educational and experimental risk stratification[cite: 1]. It is not an FDA- or CE-cleared diagnostic device and is not intended for clinical diagnosis or decision-making[cite: 1]. Outputs represent statistical risk estimates, not definitive diagnostic classifications[cite: 1].

___

## 1. Clinical Context & Motivation

Pancreatic ductal adenocarcinoma (**PDAC**) carries a 5-year relative survival rate under 12%, largely because over 80% of cases are diagnosed at late or metastatic stages (Stages **III**/IV). Current gold-standard diagnostic protocols rely on high-resolution imaging (triphasic CT/**MRI**) and invasive histopathology, which are clinically inaccessible for routine population screening.

Serum CA 19-9 remains the sole **FDA**-cleared biomarker for monitoring treatment response, but it demonstrates significant limitations for initial screening:

- Approximately 7–10% of the population are Lewis antigen-negative (Le a-b-), lacking the 1,3/1,4-fucosyltransferase enzyme required to synthesize CA 19-9, yielding false negatives.
- CA 19-9 frequently exhibits non-specific elevations in benign biliary obstructions, gallstones, and pancreatitis.

CANary investigates whether integrating multi-analyte non-invasive urinary protein panels (**LYVE1**, **REG1B**, **TFF1**, **REG1A**, and creatinine) alongside plasma CA 19-9 into an interpretable Gradient Boosting framework provides discriminative performance sufficient for primary-care triage and early risk stratification.

---

## 2. Model Architecture & Validation Performance

### Primary Model: Pancreatic GBC

- **Architecture:** Gradient Boosting Classifier (n_estimators=**100**, learning_rate=0.1, max_depth=3, random_state=42)

- **Interpretability:** TreeExplainer via **SHAP** (SHapley Additive exPlanations)

- **Dataset:** Debernardi et al. (**2020**) urinary biomarker cohort (**PLOS** Medicine, **DOI**: 10.**1371**/journal.pmed.**1003489**)

- **Cohort Composition:** N = **590** patient records (**199** **PDAC**, **391** benign hepatobiliary disease or healthy controls)

- **Validation Split:** 80/20 stratified train/test split with 5-fold cross-validation

### Held-Out Test Set Metrics

| Metric | Value | 95% Confidence Interval |
| --- | --- | --- |
| **ROC-AUC** | **0.9814** | 0.9556 – 0.9970 (1,000 bootstrap resamples)

 |
| **PR-AUC** | **0.9707** | —

 |
| **Sensitivity (Recall)** | **90.00%** | —

 |
| **Specificity** | **94.87%** | —

 |
| **Precision** | **90.00%** | —

 |
| **F1 Score** | **0.9000** | —

 |
| **Balanced Accuracy** | **92.44%** | —

 |
| **Matthews Correlation (MCC)** | **0.8487** | —

 |
| **Brier Score (Calibration)** | **0.0499** | —

 |
| **5-Fold Cross-Validation AUC** | **0.9467 ± 0.0142** | —

 |

### Biomarker Feature Weights (GBC Relative Importance)

1. **plasma_CA19_9** (0.**5345**): Primary tumor antigen burden indicator

2. **LYVE1** (0.**2486**): Lymphatic vessel endothelial hyaluronan receptor-1; reflects extracellular matrix remodeling

3. **creatinine** (0.**0643**): Normalization baseline for renal excretion rate

4. **REG1B** (0.**0477**): Regenerating islet-derived protein 1-beta

5. **TFF1** (0.**0424**): Trefoil factor 1

6. **age** (0.**0381**): Demographic baseline risk factor

7. **REG1A** (0.**0196**): Regenerating islet-derived protein 1-alpha

8. **sex** (0.**0049**): Gender incidence adjustment

---

## 3. Exploratory Bayesian Multi-Cancer Engine

For colon and hematologic modules, where no validated single-analyte ML cohort was incorporated, the system executes an epidemiological Bayesian scoring pipeline (`src/lib/predictionEngine.ts`):

- **Bayesian Priors:** Age-stratified baseline priors derived from National Cancer Institute **SEER** (Surveillance, Epidemiology, and End Results) incidence tables.

- **Evidence-Based Odds Ratios:** Additive and multiplicative weights derived from PubMed meta-analyses (e.g., smoking OR 1.74 [Iodice et al.], new-onset diabetes OR 5.38 [Sharma et al.], **IBD** **SIR** 2.4 [Jess et al.]).

- **Syndromic Clusters:** Compound interaction boosts for classic clinical presentation triads (e.g., Courvoisier triad: painless jaundice + weight loss + epigastric pain).

- **Risk Ceiling Compression:** Sigmoid compression hard-capped at 78% (`RISK_HARD_CAP = 0.78`) to prevent artificial certainty.

---

## 4. Research Reproducibility & Colab

The complete data preprocessing, cross-validation, hyperparameter tuning, **ROC**/PR curves, calibration plots, and **SHAP** analyses can be executed directly in Google Colab:

- **Jupyter Notebook:** `notebooks/canary_cancer_model.ipynb`

- **Colab Link:** [Open in Google Colab](https://colab.research.google.com/github/Druhi-coder/canary-scan-ai/blob/main/notebooks/canary_cancer_model.ipynb)

---

## 5. Repository Structure

- `assets/`: **ROC**, confusion matrix, and **SHAP** visual outputs

- `docs/`: Model specs, architecture, and validation protocol

- `**MODEL**.md`: Canonical model parameters & feature weights

- `VALIDATION_PROTOCOL.md`: Complete verification checklist

- `outreach/`: Community health literacy context

- `notebooks/`: Scikit-Learn training and evaluation pipeline

- `src/components/`: React UI and interactive research widgets

- `src/lib/predictionEngine.ts`: Bayesian prior & heuristic engine

- `src/lib/mlApi.ts`: Validated pancreatic **GBC** **API** client

- `src/lib/validationMetrics.ts`: Benchmark ground-truth constants

- `src/lib/riskWeights.ts`: Meta-analysis odds ratios & **SEER** base rates

- `supabase/`: Backend edge functions and database schema

---

## 6. Citation & References

1. **Debernardi, S., et al. (**2020**).** A combination of urinary biomarkers improves early detection of pancreatic cancer. ***PLOS** Medicine*, 17(12), e1003489. **DOI**: 10.**1371**/journal.pmed.**1003489**

2. **Lundberg, S. M., & Lee, S. I. (**2017**).** A unified approach to interpreting model predictions. *Advances in Neural Information Processing Systems (NeurIPS)*, 30.
3. **National Cancer Institute.** **SEER** Cancer Statistics Review **1975**–**2020**. Bethesda, MD.
4. **Sharma, A., et al. (**2018**).** Model to Determine Risk of Pancreatic Cancer in Patients With New-Onset Diabetes. *Gastroenterology*, **155**(3), **730**-**739**.

```

```
