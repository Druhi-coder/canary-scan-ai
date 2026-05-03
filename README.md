# CANary — Cancer Anticipation Network for Risk Yield
 
> Early detection improves clinical outcomes. CANary is a hybrid AI system combining machine learning models with contextual reasoning to estimate cancer risk across pancreatic, malignancy, and haematological domains, with explainability via SHAP.
 
**Live App:** https://canary-scan-ai.vercel.app  
**Paper:** See [`notebooks/canary_cancer_model.ipynb`](notebooks/canary_cancer_model.ipynb)
 
[![Live Demo](https://img.shields.io/badge/Live%20Demo-canary--scan--ai.vercel.app-green)](https://canary-scan-ai.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](requirements.txt)
 
---
 
## ⚠️ Disclaimer
 
CANary is a **research prototype and screening tool — not a diagnostic system**. All outputs require clinical validation by a qualified medical professional. This system has not undergone external clinical validation and is intended for research and educational purposes only.
 
---
 
## ⚙️ System Architecture
 
CANary employs a **hybrid inference architecture** combining machine learning models with rule-based and LLM-enhanced reasoning.
 
### Components
 
- **ML Backend (Render API)**  
  Gradient Boosting models for pancreatic, colon, and blood cancer risk prediction.
 
- **Inference Layer (Supabase Edge Functions)**  
  Performs rule-based scoring and integrates LLM-based reasoning (Gemini) to capture contextual interactions.
 
- **Frontend Application**  
  Collects user inputs and orchestrates prediction pipeline.
 
---
 
### 🔄 Hybrid Pipeline
 
1. User inputs symptoms and biomarkers  
2. Data is processed via:
   - ML API → returns baseline probabilities  
   - Supabase → applies contextual reasoning and adjustments  
3. Outputs are combined into a final risk estimate
 
---
 
### 🧠 Design Rationale
 
- Robust to incomplete inputs  
- Improves interpretability  
- Captures real-world symptom interactions  
- Provides fallback when ML outputs are unavailable
 
---
 
## 🧬 ML Models
 
| Cancer Domain | Dataset | Test AUC | 5-Fold CV AUC | n |
|---|---|---|---|---|
| **Pancreatic (PDAC)** | Debernardi et al. 2020 | **0.9817** | 0.9467 ± 0.0142 | 590 |
| **Malignancy** | UCI Breast Cancer Wisconsin | **0.9951** | 0.9927 ± 0.0041 | 569 |
| **Blood Severity** | Synthetic CBC* | ~1.00 | 0.9998 ± 0.0002 | 1000 |
 
> *Blood severity results reflect synthetic dataset behaviour and are not clinically generalisable.*
 
**Algorithm:** Gradient Boosting (scikit-learn)  
**Explainability:** SHAP TreeExplainer  
 
📓 [View full research notebook →](notebooks/canary_cancer_model.ipynb)
 
---
 
## 🌍 Real-World Outreach — DRiSe Initiative
 
CANary was informed by facilitator-led outreach through the **DRiSe initiative** in Udaipur, Rajasthan.
 
| Metric | Value |
|---|---|
| Structured participants | 5,382 |
| Total assessments | 10,836 |
| Setting | Community-based, non-clinical |
| Medical follow-ups | ~12–13 participants |
 
Participants completed pre- and post-session assessments. Additional informal community participation contributed to total assessments.
 
> Outreach data was retained in aggregated form only and was not used for model training.
 
---
 
## 📊 Model Comparison
 
| Model | Pancreatic AUC | Malignancy AUC | Blood Severity AUC |
|---|---|---|---|
| Logistic Regression | 0.9641 | ~0.97 | 0.8534 |
| Random Forest | 0.9761 | ~0.99 | 1.0000 |
| **Gradient Boosting (CANary)** | **0.9817** | **0.9927** | **~0.999** |
 
---
 
## 📈 Results
 
### ROC Curve — Pancreatic Cancer Detection
 
![ROC Curve](notebooks/roc_curve.png)
 
---
 
### SHAP Summary — Biomarker Attribution
 
![SHAP Summary](notebooks/shap_summary.png)
 
---
 
### Feature Importance — Blood Severity
 
![CBC Importance](notebooks/cbc_importance.png)
 
---
 
## ⚙️ Experimental Setup
 
- Train-test split: 80/20 (stratified, seed=42)  
- Cross-validation: 5-fold stratified  
- Metrics: AUC-ROC, sensitivity, specificity  
- Explainability: SHAP TreeExplainer  
 
---
 
## ⚠️ Deployment Note
 
- ML models are deployed via external API (Render)  
- Supabase Edge Functions provide reasoning and fallback logic  
- Notebook models represent the research pipeline, not direct frontend execution  
 
---
 
## ⚠️ Limitations
 
- No external clinical validation  
- Limited dataset size  
- Synthetic dataset for blood model  
- Population generalisability unknown  
- Not a diagnostic tool  
 
---
 
## 📚 References
 
1. Debernardi et al. (2020) — PLOS Medicine  
2. Lundberg & Lee (2017) — SHAP  
3. Pedregosa et al. (2011) — scikit-learn  
4. UCI ML Repository  
 
---
 
## 👩‍💻 Author
 
**Druhi Sarupria** — Independent Researcher (17)  
Udaipur, Rajasthan, India  
