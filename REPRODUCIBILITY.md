# 🔬 Reproducibility Guide

## Datasets

- Pancreatic Cancer: Debernardi et al. (2020), PLOS Medicine  
- Breast Cancer: UCI Wisconsin Dataset  
- Blood Severity: Synthetic CBC dataset (for experimental purposes)

---

## Preprocessing

- Missing values: Median imputation  
- Feature scaling: StandardScaler  
- Feature selection: Literature-based biomarker selection  

---

## Models

### Gradient Boosting (Primary Model)
- n_estimators = 100  
- learning_rate = 0.1  
- max_depth = 3  

### Baselines
- Logistic Regression  
- Random Forest  

---

## Training Protocol

- Train-test split: 80/20 stratified  
- Random seed: 42  
- Cross-validation: 5-fold stratified  
- Evaluation metric: AUC-ROC  

---

## Explainability

- SHAP TreeExplainer  
- Global feature importance  
- Local explanations per prediction  

---

## Reproducing Results

1. Install dependencies:
   pip install -r requirements.txt

2. Run notebook:
   notebooks/canary_cancer_model.ipynb

3. Outputs:
   - ROC curve  
   - SHAP plots  
   - Model comparison results  

---

## Deployment Notes

- ML models are served via external API (Render backend)  
- Web application does not execute models directly  
- Supabase layer provides rule-based + LLM-enhanced inference  

---

## Notes

- Results may vary slightly due to randomness in training  
- Blood dataset results are not clinically representative  
