# Reproducibility Guide

## Dataset

Primary dataset:
Debernardi et al. (2020), PLOS Medicine

Features used:
- CA19-9
- LYVE1
- REG1B
- TFF1
- Creatinine

## Setup

Install dependencies:

pip install numpy pandas scikit-learn shap matplotlib

## Running the Model

1. Open notebook:
   notebooks/canary_cancer_model.ipynb

2. Run all cells sequentially

## Expected Results

- AUC ≈ 0.98
- High importance of CA19-9
- SHAP plots explaining predictions
