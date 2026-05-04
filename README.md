# CANary — Cancer Anticipation Network for Risk Yield

> CANary is a hybrid AI system for cancer risk estimation.  
> This repository presents the **validated pancreatic cancer detection module**, achieving high performance using non-invasive urinary biomarkers.

**Live App:** https://canary-scan-ai.vercel.app  
**Research Notebook:** [`notebooks/canary_cancer_model.ipynb`](notebooks/canary_cancer_model.ipynb)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-canary--scan--ai.vercel.app-green)](https://canary-scan-ai.vercel.app)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue)](requirements.txt)

---

## ⚠️ Disclaimer

CANary is a **research prototype and screening tool — not a diagnostic system**.  
All outputs require validation by qualified medical professionals.  
The model has **not undergone external clinical validation** and is intended for research and educational use only.

---

## 🧠 Overview

Early detection of pancreatic cancer is difficult due to late symptom onset and poor prognosis at advanced stages.  
CANary addresses this by applying machine learning to biomarker data to estimate cancer risk in a non-invasive and interpretable manner.

While CANary is designed as a broader hybrid AI system,  
**only the pancreatic cancer detection model is validated and evaluated in this repository**.

---

## 🧬 Pancreatic Cancer Model

- **Dataset:** Debernardi et al. (2020), *PLOS Medicine*  
- **Samples:** 590 patients  
- **Task:** Binary classification (Cancer vs No Cancer)  
- **Model:** Gradient Boosting (scikit-learn)  

### Performance

| Metric | Value |
|---|---|
| Test AUC-ROC | **0.9817** |
| 5-Fold CV AUC | 0.9467 ± 0.0142 |
| 95% CI (Bootstrap, n=1000) | **0.9556 – 0.9970** |

---

## 🔬 Explainability

Model predictions are interpreted using **SHAP (TreeExplainer)**:

- **CA19-9** → strongest predictor  
- **LYVE1** → second most important  
- Other biomarkers contribute contextually  

---

## 📊 Results

### ROC Curve — Pancreatic Cancer Detection

![ROC Curve](assets/roc_curve.png)

---

### SHAP Summary — Biomarker Attribution

![SHAP Summary](assets/shap_summary.png)

---

## ⚙️ System Architecture

CANary uses a **hybrid inference pipeline**:

1. User inputs biomarker data via frontend  
2. Data is processed by ML API (Gradient Boosting model)  
3. SHAP explanations provide interpretability  
4. Fallback logic ensures system reliability  

### Components

- **Frontend:** React + TypeScript  
- **ML Backend:** Flask API (Render)  
- **Database:** Supabase (RLS-enabled)  
- **Explainability:** SHAP  

📄 Full architecture → [`docs/research/ARCHITECTURE.md`](docs/research/ARCHITECTURE.md)

---

## 🌍 Real-World Context — DRiSe Initiative

The system design was informed by facilitator-led outreach through the **DRiSe initiative** in Udaipur, Rajasthan.

| Metric | Value |
|---|---|
| Participants engaged | 5,382 |
| Total assessments | 10,836 |
| Setting | Community-based, non-clinical |
| Medical follow-ups | ~12–13 |

> Outreach data was retained in aggregated form only and **was not used for model training or statistical validation**.

---

## 🔁 Reproducibility

To reproduce results:

```
pip install -r requirements.txt
```

Then run:

```
notebooks/canary_cancer_model.ipynb
```

📄 Full details → [`REPRODUCIBILITY.md`](REPRODUCIBILITY.md)

---

## ⚠️ Limitations

- Dataset size is limited (n = 590)  
- No external validation on independent cohorts  
- Potential dataset-specific bias  
- Not suitable for clinical decision-making  

---

## 📚 References

1. Debernardi, S. et al. (2020). *A combination of urinary biomarkers improves diagnosis of pancreatic cancer*. PLOS Medicine.  
2. Lundberg, S. & Lee, S.I. (2017). *A unified approach to interpreting model predictions*. NeurIPS.  
3. Pedregosa, F. et al. (2011). *Scikit-learn: Machine learning in Python*. JMLR.  

---

## 👩‍💻 Author

**Druhi Sarupria**  
Independent Researcher  
Udaipur, Rajasthan, India
