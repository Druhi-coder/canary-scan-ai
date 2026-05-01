# CANary System Architecture

## Overview

CANary is a hybrid AI system combining machine learning with rule-based fallback.

## Flow

User Input → Frontend → ML API → Model → Explanation → Output

## Components

Frontend:
- React + TypeScript
- Collects biomarker inputs

ML API:
- Flask (Render)
- Runs trained model

Model:
- Gradient Boosting
- Trained on clinical dataset

Fallback:
- Rule-based scoring if API fails

Database:
- Supabase (secure storage)
