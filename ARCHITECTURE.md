# CANary System Architecture

## Overview

CANary is a hybrid AI system designed for accessible cancer risk estimation.  
It combines a machine learning model with rule-based fallback logic and an explainable interface.

This repository presents the **validated pancreatic cancer detection module**, while the broader system is designed to support additional risk estimation workflows.

---

## System Flow

User Input → Frontend → ML API → Model Inference → Explainability → Output

---

## Core Components

### 1. Frontend
- Built with React + TypeScript
- Collects user inputs:
  - Demographics (age, sex)
  - Biomarker values (CA19-9, LYVE1, etc.)
- Displays:
  - Risk score
  - Confidence level
  - Explanation of contributing factors

---

### 2. Machine Learning API
- Hosted backend (Render / Flask-based service)
- Receives structured input from frontend
- Loads trained pancreatic cancer model
- Returns:
  - Predicted probability
  - Supporting explanation data

---

### 3. Model (Pancreatic Module)
- Algorithm: Gradient Boosting Classifier
- Dataset: Debernardi et al. (2020)
- Input features:
  - age, sex
  - plasma_CA19_9, creatinine
  - LYVE1, REG1B, TFF1, REG1A

- Output:
  - Probability of pancreatic cancer (binary classification)

---

### 4. Explainability Layer
- SHAP (SHapley Additive Explanations)
- Provides:
  - Feature importance ranking
  - Contribution of each biomarker to prediction

---

### 5. Fallback Logic (Rule-Based)
- Activated when:
  - API is unavailable
  - Model inference fails
- Uses simplified scoring rules derived from known risk factors
- Ensures system continuity in low-connectivity environments

---

### 6. Database Layer (Supabase)
- Stores:
  - User assessments
  - Risk outputs
- Features:
  - Row Level Security (RLS)
  - User-scoped access (auth.uid())

---

## Scope Clarification

While CANary is designed as a multi-module system,  
**only the pancreatic cancer detection model is validated in this repository**.

Other potential modules (e.g., additional cancer types) are considered exploratory and are not included in the evaluation or reported results.

---

## Design Principles

- Accessibility: usable in non-clinical, low-resource settings  
- Explainability: transparent model outputs via SHAP  
- Modularity: supports extension to additional risk models  
- Reliability: fallback logic ensures continuous operation  

---

## Summary

CANary integrates machine learning, explainability, and system design into a unified framework for cancer risk estimation.  
This repository focuses on the validated pancreatic module, forming the core of the broader system.
