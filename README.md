CANary: Investigational Risk Stratification & Explainable ML Framework
CANary is an investigational computational oncology prototype designed for early-stage pancreatic ductal adenocarcinoma (PDAC) risk stratification using non-invasive urinary biomarkers, paired with a SEER-calibrated Bayesian prior engine for exploratory multi-cancer risk assessment.   
XML
Investigational Research Disclaimer:

CANary is an academic research prototype developed for educational and experimental risk stratification. It is not an FDA- or CE-cleared diagnostic device and is not intended for clinical diagnosis or decision-making. Outputs represent statistical risk estimates, not definitive diagnostic classifications.   
XML
+ 2

1. Clinical Context & Motivation
Pancreatic ductal adenocarcinoma (PDAC) carries a 5-year relative survival rate under 12%, largely because over 80% of cases are diagnosed at late or metastatic stages (Stages III/IV). Current gold-standard diagnostic protocols rely on high-resolution imaging (triphasic CT/MRI) and invasive histopathology, which are clinically inaccessible for routine population screening.
Serum CA 19-9 remains the sole FDA-cleared biomarker for monitoring treatment response, but it demonstrates significant limitations for initial screening:
Approximately 7–10% of the population are Lewis antigen-negative (Le a-b-), lacking the 1,3/1,4-fucosyltransferase enzyme required to synthesize CA 19-9, yielding false negatives.
CA 19-9 frequently exhibits non-specific elevations in benign biliary obstructions, gallstones, and pancreatitis.
CANary investigates whether integrating multi-analyte non-invasive urinary protein panels (LYVE1, REG1B, TFF1, REG1A, and creatinine) alongside plasma CA 19-9 into an interpretable Gradient Boosting framework provides discriminative performance sufficient for primary-care triage and early risk stratification.   
XML
2. Model Architecture & Validation Performance
Primary Model: Pancreatic GBC
Architecture: Gradient Boosting Classifier (n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)   
XML
Interpretability: TreeExplainer via SHAP (SHapley Additive exPlanations)   
XML
Dataset: Debernardi et al. (2020) urinary biomarker cohort (PLOS Medicine, DOI: 10.1371/journal.pmed.1003489)   
XML
Cohort Composition: N = 590 patient records (199 PDAC, 391 benign hepatobiliary disease or healthy controls)   
XML
Validation Split: 80/20 stratified train/test split with 5-fold cross-validation   
XML
Held-Out Test Set Metrics
Metric	Value	95% Confidence Interval
ROC-AUC	0.9814	
0.9556 – 0.9970 (1,000 bootstrap resamples)  
XML

PR-AUC	0.9707	
—  
XML

Sensitivity (Recall)	90.00%	
—  
XML

Specificity	94.87%	
—  
XML

Precision	90.00%	
—  
XML

F1 Score	0.9000	
—  
XML

Balanced Accuracy	92.44%	
—  
XML

Matthews Correlation (MCC)	0.8487	
—  
XML

Brier Score (Calibration)	0.0499	
—  
XML

5-Fold Cross-Validation AUC	0.9467 ± 0.0142	
—  
XML

Biomarker Feature Weights (GBC Relative Importance)
plasma_CA19_9 (0.5345): Primary tumor antigen burden indicator   
XML
LYVE1 (0.2486): Lymphatic vessel endothelial hyaluronan receptor-1; reflects extracellular matrix remodeling   
XML
creatinine (0.0643): Normalization baseline for renal excretion rate   
XML
REG1B (0.0477): Regenerating islet-derived protein 1-beta   
XML
TFF1 (0.0424): Trefoil factor 1   
XML
age (0.0381): Demographic baseline risk factor   
XML
REG1A (0.0196): Regenerating islet-derived protein 1-alpha   
XML
sex (0.0049): Gender incidence adjustment   
XML
3. Exploratory Bayesian Multi-Cancer Engine
For colon and hematologic modules, where no validated single-analyte ML cohort was incorporated, the system executes an epidemiological Bayesian scoring pipeline (src/lib/predictionEngine.ts):   
XML
Bayesian Priors: Age-stratified baseline priors derived from National Cancer Institute SEER (Surveillance, Epidemiology, and End Results) incidence tables.   
XML
Evidence-Based Odds Ratios: Additive and multiplicative weights derived from PubMed meta-analyses (e.g., smoking OR 1.74 [Iodice et al.], new-onset diabetes OR 5.38 [Sharma et al.], IBD SIR 2.4 [Jess et al.]).   
XML
Syndromic Clusters: Compound interaction boosts for classic clinical presentation triads (e.g., Courvoisier triad: painless jaundice + weight loss + epigastric pain).   
XML
Risk Ceiling Compression: Sigmoid compression hard-capped at 78% (RISK_HARD_CAP = 0.78) to prevent artificial certainty.   
XML
4. Research Reproducibility & Colab
The complete data preprocessing, cross-validation, hyperparameter tuning, ROC/PR curves, calibration plots, and SHAP analyses can be executed directly in Google Colab:   
XML
Jupyter Notebook: notebooks/canary_cancer_model.ipynb
   
XML
Colab Link: Open in Google Colab
5. Repository Structure
assets/: ROC, confusion matrix, and SHAP visual outputs   
XML
docs/: Model specs, architecture, and validation protocol   
XML
MODEL.md: Canonical model parameters & feature weights   
XML
VALIDATION_PROTOCOL.md: Complete verification checklist   
XML
outreach/: Community health literacy context   
XML
notebooks/: Scikit-Learn training and evaluation pipeline   
XML
src/components/: React UI and interactive research widgets   
XML
src/lib/predictionEngine.ts: Bayesian prior & heuristic engine   
XML
src/lib/mlApi.ts: Validated pancreatic GBC API client   
XML
src/lib/validationMetrics.ts: Benchmark ground-truth constants   
XML
src/lib/riskWeights.ts: Meta-analysis odds ratios & SEER base rates   
XML
supabase/: Backend edge functions and database schema   
XML
6. Citation & References
Debernardi, S., et al. (2020). A combination of urinary biomarkers improves early detection of pancreatic cancer. PLOS Medicine, 17(12), e1003489. DOI: 10.1371/journal.pmed.1003489   
XML
Lundberg, S. M., & Lee, S. I. (2017). A unified approach to interpreting model predictions. Advances in Neural Information Processing Systems (NeurIPS), 30.
National Cancer Institute. SEER Cancer Statistics Review 1975–2020. Bethesda, MD.
Sharma, A., et al. (2018). Model to Determine Risk of Pancreatic Cancer in Patients With New-Onset Diabetes. Gastroenterology, 155(3), 730-739.
