# CANary — AI-Powered Early Cancer Detection System

> Early detection saves lives. CANary uses machine learning on clinical 
> biomarker data to detect pancreatic cancer with 98% AUC-ROC.

---

## 🧬 ML Model — Pancreatic Cancer Detection

| Model | Test AUC | CV AUC (5-fold) |
|---|---|---|
| Logistic Regression | 0.9641 | — |
| Random Forest | 0.9761 | — |
| **Gradient Boosting** | **0.9817** | **0.9467 ± 0.0142** |

### Dataset
- **Source:** Debernardi et al. (2020), PLOS Medicine
- **Patients:** 590 real clinical samples
- **Task:** Binary classification — Cancer vs No Cancer
- **Biomarkers used:** CA19_9, LYVE1, Creatinine, REG1B, TFF1, REG1A

### Key Findings
- CA19_9 is the strongest predictor of pancreatic cancer
- LYVE1 is the second most important biomarker
- Model catches 9 out of 10 cancer cases (recall: 0.90)

📓 **[View full notebook →](notebooks/canary_cancer_model.ipynb)**

---

## 🖥️ Web Application

Built with React + TypeScript, the CANary app provides:
- Multi-cancer risk estimation (Pancreatic, Colon, Blood)
- Explainable risk factors per prediction
- Secure report storage via Supabase

**Live Demo:** https://canary-scan-ai.vercel.app

---

## 🏗️ Architecture

User Input → Risk Engine → ML Model → SHAP Explanation → Report

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| ML Pipeline | Python, scikit-learn, SHAP |
| Database | Supabase (RLS) |
| Deployment | Vercel |

---

## ⚠️ Disclaimer

CANary is a screening tool and **not a diagnostic system**.
Requires clinical validation before any medical use.

---

## 📚 References

Debernardi, S. et al. (2020). A combination of urinary biomarkers 
improves diagnosis of pancreatic cancer. PLOS Medicine, 17(4).

---

## 👩‍💻 Author
Druhi — [canary-scan-ai.vercel.app](https://canary-scan-ai.vercel.app)
