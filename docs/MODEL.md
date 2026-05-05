{
  "model_type": "GradientBoostingClassifier",
  "auc_test": 0.9817,
  "cv_auc_mean": 0.9467,
  "cv_auc_std": 0.0142,
  "ci_95": [0.9556, 0.9970],
  "features": ["age", "sex", "plasma_CA19_9", "creatinine", "LYVE1", "REG1B", "TFF1", "REG1A"],
  "feature_importances": {
    "age": 0.0381,
    "sex": 0.0049,
    "plasma_CA19_9": 0.5345,
    "creatinine": 0.0643,
    "LYVE1": 0.2486,
    "REG1B": 0.0477,
    "TFF1": 0.0424,
    "REG1A": 0.0196
  },
  "n_estimators": 100,
  "learning_rate": 0.1,
  "max_depth": 3,
  "dataset": "Debernardi et al. 2020, PLOS Medicine",
  "n_samples": 590,
  "train_test_split": "80/20 stratified",
  "random_state": 42
}
