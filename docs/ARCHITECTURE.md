# CANary System Architecture

## Overview
CANary is an AI-assisted screening system designed to estimate early-stage cancer risk using demographic, clinical, and behavioral inputs.

## System Components

### 1. Input Layer
- User-provided health and lifestyle data
- Optional laboratory values

### 2. Risk Engine
- Rule-based scoring system
- Calibrated using epidemiological data (Odds Ratios, Relative Risks)

### 3. Interpretation Layer
- Converts numerical outputs into:
  - Risk categories (Low, Medium, High)
  - Confidence scores
  - Explainable contributing factors

### 4. Visualization Layer
- Interactive UI with charts and explanations
- Comparative risk display across cancer types

### 5. Data Storage
- Supabase backend
- Secure user-specific storage using Row Level Security (RLS)

## Limitations
- Not a diagnostic system
- Based on synthetic and literature-derived calibration
- Requires clinical validation with real-world datasets

## Future Improvements
- Integration with real clinical datasets
- Model validation against hospital data
- AI-assisted prediction models (ML-based)
- Deployment as a clinical decision support tool
