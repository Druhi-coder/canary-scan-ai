# CANary — Early Cancer Risk Screening System

## Overview
CANary is an AI-assisted screening system designed to estimate early-stage cancer risk using explainable, literature-calibrated models.

The system analyzes demographic, behavioral, and clinical inputs to generate risk scores for multiple cancer types.

---

## Key Features
- Multi-cancer risk estimation (Pancreatic, Colon, Blood)
- Explainable risk factors and interpretation
- Confidence scoring based on data completeness
- Interactive visualization (charts + comparative risk)
- Secure report storage using Supabase (RLS)

---

## System Architecture
The system consists of:

1. Input Layer — User health and lifestyle data  
2. Risk Engine — Literature-calibrated scoring (RR, OR models)  
3. Interpretation Layer — Risk categorization + explanations  
4. Visualization Layer — UI with charts and insights  
5. Data Layer — Secure storage via Supabase  

Detailed architecture: see `/docs/ARCHITECTURE.md`

---

## Tech Stack
- React + TypeScript
- Tailwind CSS
- Supabase (Database + Auth)
- Vercel (Deployment)

---

## Disclaimer
CANary is a screening tool and **not a diagnostic system**.  
It is based on literature-derived and synthetic calibration and requires clinical validation.

---

## Live Demo
https://canary-scan-ai.vercel.app

---

## Author
Druhi
