# Experiments

## Objective

To evaluate the effectiveness of machine learning models in detecting pancreatic cancer using biomarker data.

## Model Used

- Gradient Boosting Classifier

## Features

- CA19-9
- LYVE1
- REG1B
- TFF1
- Creatinine

## Validation Strategy

- Train-test split
- 5-fold cross-validation

## Metrics

- AUC-ROC
- Recall (Sensitivity)

## Results

- Test AUC: ~0.98
- CV AUC: ~0.94 ± 0.01
- Recall: ~0.90

## Observations

- CA19-9 is the strongest predictor
- Model performs well on high-risk samples
