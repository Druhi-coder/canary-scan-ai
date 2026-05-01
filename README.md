# CANary — AI-Powered Early Cancer Detection System

> Early detection improves clinical outcomes. CANary uses machine learning models trained on clinical datasets to estimate risk across pancreatic, colon, and blood-related conditions.

**Live App:** https://canary-scan-ai.vercel.app

---

## 🧬 ML Models

| Cancer Type        | Dataset                               | Test AUC | CV AUC (5-fold) |
| ------------------ | ------------------------------------- | -------- | --------------- |
| **Pancreatic**     | Debernardi et al. 2020, PLOS Medicine | 0.9817   | 0.9467 ± 0.0142 |
| **Malignancy**     | UCI Cancer Dataset (569 patients)     | 0.9927   | 0.9927 ± 0.0041 |
| **Blood Severity** | CBC Health Dataset (1000 patients)    | ~0.999*  | 0.9998 ± 0.0002 |

> *Near-perfect performance likely reflects dataset characteristics and high feature separability rather than real-world generalization.*

**Algorithm:** Gradient Boosting with SHAP explainability
**Architecture:** 60% ML model + 40% rule engine, with automatic fallback

📓 [View full research notebook →](notebooks/canary_cancer_model.ipynb)

---

## 📊 Model Comparison

| Model                      | Pancreatic AUC | Malignancy AUC | Blood Severity AUC |
| -------------------------- | -------------- | -------------- | ------------------ |
| Logistic Regression        | 0.9641         | ~0.97          | 0.8534             |
| Random Forest              | 0.9761         | ~0.99          | 1.0000             |
| Gradient Boosting (CANary) | **0.9817**     | **0.9927**     | **~0.999**         |

Gradient Boosting was selected as the final model due to consistently strong performance across datasets.

---

## 🔬 Key Findings

**Pancreatic Cancer:** CA19-9 is the strongest predictor, followed by LYVE1. The model achieves high recall (~0.90), successfully identifying most cancer cases.

**Malignancy Classification:** Radius and texture-based features are dominant indicators in classification.

**Blood Severity Prediction:** Hemoglobin and WBC count are the most influential features.

---

## ⚙️ Experimental Setup

* Models trained using scikit-learn
* Train-test split: 80/20 with stratification
* Cross-validation: 5-fold stratified
* Evaluation metrics: ROC-AUC, accuracy, precision, recall, F1-score
* Feature importance analyzed using SHAP

---

## 🖥️ How It Works

User Input → React Frontend → ML API (Render) → Gradient Boosting → Risk Score

* If ML API is available: predictions are ML-powered (AUC ~0.98–1.0)
* If unavailable: system falls back to rule-based logic

---

## 🏗️ Architecture

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Frontend       | React + TypeScript + Tailwind CSS       |
| ML API         | Python Flask + scikit-learn (Render)    |
| Explainability | SHAP                                    |
| Database       | Supabase (Row-Level Security)           |
| Deployment     | Vercel (frontend) + Render (ML backend) |

---

## 📊 Results

### ROC Curve (Pancreatic Cancer Model)

![ROC Curve](assets/roc_curve.png)

### Feature Importance (SHAP - Pancreatic Model)

![SHAP](assets/shap_summary.png)

### Blood Severity Model Insights

![CBC](assets/cbc_importance.png)

---

## 🧠 Research Positioning

This project presents an early-stage AI-based screening support system built using clinical biomarker datasets. While the models demonstrate strong performance on available datasets (AUC ~0.98 for pancreatic cancer), the system is not clinically validated and relies partially on approximated inputs in real-world usage.

This work is intended as a proof-of-concept for AI-assisted screening and not as a clinical diagnostic system.

Future work includes:

* Validation on larger and more diverse clinical datasets
* Integration of complete biomarker inputs
* External benchmarking against established diagnostic models

---

## ⚠️ Disclaimer

CANary is a **screening tool only** — not a diagnostic system. All results require clinical validation by a qualified medical professional.
This system is intended for research and educational purposes and has not been clinically validated.

---

## ⚠️ Limitations

* Not clinically validated
* Limited dataset size and diversity
* Potential dataset bias
* Near-perfect performance in some models may indicate dataset simplicity or overfitting
* Blood severity model requires validation on diverse real-world clinical data

---

## 📚 References

1. Debernardi, S. et al. (2020). A combination of urinary biomarkers improves diagnosis of pancreatic cancer. *PLOS Medicine*, 17(4).
2. Lundberg, S. & Lee, S.I. (2017). A unified approach to interpreting model predictions. *NeurIPS*.
3. Pedregosa, F. et al. (2011). Scikit-learn: Machine learning in Python. *JMLR*, 12.

---

## 👩‍💻 Author

Druhi — https://canary-scan-ai.vercel.app
