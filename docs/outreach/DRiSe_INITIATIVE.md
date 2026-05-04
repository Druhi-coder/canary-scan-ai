# DRiSe Initiative — Real-World Outreach Context
 
## Overview
 
Prior to the development of the CANary system, large-scale facilitator-led outreach was conducted through the **DRiSe initiative** — a student-led cancer awareness and early screening education program founded by Druhi Sarupria in Udaipur, Rajasthan, India.
 
This outreach phase directly informed the design of CANary: the symptom patterns observed, user comprehension challenges encountered, and the consistent need for plain-language explainability all shaped the system's architecture.
 
---
 
## Scale of Engagement
 
| Metric | Value |
|---|---|
| Total individuals engaged | 5,382 |
| Total risk assessments completed | 10,800+ |
| Assessment format | Pre- and post-session questionnaire |
| Setting | Community-based, non-clinical |
| Mode | Facilitator-led structured sessions |
| Medical follow-ups initiated | ~12–13 participants |
 
---
 
## How Assessments Were Conducted
 
Each session followed a structured format:
 
1. **Pre-session assessment** — participants completed a standardised questionnaire covering symptoms, lifestyle factors, and family history before any education was provided
2. **Awareness session** — facilitator-led explanation of cancer warning signs, risk factors, and early detection importance
3. **Post-session assessment** — the same questionnaire was repeated, enabling comparison of risk awareness before and after education
Sessions were conducted in community settings across Udaipur and surrounding areas. Participants included rural and underprivileged individuals, many of whom had no prior access to cancer screening information. Assessments were completed on mobile devices, often with facilitator assistance.
 
---
 
## Data Handling
 
Due to the community nature of this deployment, data from this phase was retained in **aggregated form only** — individual-level structured records were not collected. This means the outreach data:
 
- Was **not used for model training**
- Was **not used for statistical validation**
- Is presented as evidence of **real-world applicability and engagement**
This limitation is stated explicitly in the accompanying paper.
 
---
 
## Impact Observations
 
- The pre/post assessment format enabled repeated exposure to risk evaluation language, improving participant understanding of symptom relevance
- A small subset of participants (n ≈ 12–13) pursued medical consultation following elevated risk indications — representing early evidence of behavioral impact from accessible risk communication
- The scale of engagement demonstrates feasibility of deploying risk estimation frameworks in non-clinical, community-based environments
---
 
## Relationship to CANary System
 
The DRiSe outreach phase is **Phase 1** of CANary's two-phase development:
 
| Phase | Description | Data |
|---|---|---|
| Phase 1 — DRiSe Outreach | Facilitator-led community sessions, questionnaire assessments | Aggregated only, not used for model training |
| Phase 2 — System Deployment | Web application with ML models, SHAP explainability, Supabase backend | Structured, individual-level, forms basis of model evaluation |
 
---
 
## Ethical Note
 
All participants engaged voluntarily in awareness sessions. No personally identifiable information was retained. Photographic documentation was obtained only with explicit consent from participants. The outreach was conducted as an educational initiative, not a clinical study, and no diagnostic claims were made to participants.
