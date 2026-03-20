export interface DatasetSchema {
  columns: { name: string; type: "numeric" | "categorical" | "boolean"; nullable: boolean }[];
}

export interface DatasetValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  columnCount: number;
  schema: DatasetSchema;
  missingValueCounts: Record<string, number>;
}

const EXPECTED_COLUMNS = [
  "age", "gender", "bmi", "smoking", "alcohol", "family_history",
  "ca_19_9", "cea", "ldh", "hemoglobin", "platelets", "wbc",
  "weight_loss", "fatigue", "abdominal_pain", "jaundice",
  "blood_in_stool", "frequent_infections", "cancer_risk_label",
];

const VALID_RANGES: Record<string, [number, number]> = {
  age: [0, 120],
  bmi: [10, 80],
  ca_19_9: [0, 10000],
  cea: [0, 500],
  ldh: [50, 2000],
  hemoglobin: [3, 25],
  platelets: [10, 1500],
  wbc: [0.5, 100],
};

export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] || ""));
    return row;
  });
}

export function validateDataset(rows: Record<string, string>[]): DatasetValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingValueCounts: Record<string, number> = {};

  if (rows.length === 0) {
    return { valid: false, errors: ["Dataset is empty"], warnings: [], rowCount: 0, columnCount: 0, schema: { columns: [] }, missingValueCounts: {} };
  }

  const columns = Object.keys(rows[0]);
  const matchedColumns = EXPECTED_COLUMNS.filter((c) => columns.includes(c));
  const missingColumns = EXPECTED_COLUMNS.filter((c) => !columns.includes(c));

  if (matchedColumns.length < 5) {
    errors.push(`Dataset must contain at least 5 recognized columns. Found: ${matchedColumns.join(", ")}`);
  }
  if (missingColumns.length > 0) {
    warnings.push(`Missing optional columns: ${missingColumns.join(", ")}`);
  }

  // Validate ranges and count missing values
  columns.forEach((col) => {
    missingValueCounts[col] = 0;
    rows.forEach((row, rowIdx) => {
      if (!row[col] || row[col] === "" || row[col] === "null" || row[col] === "NA") {
        missingValueCounts[col]++;
        return;
      }
      if (VALID_RANGES[col]) {
        const val = parseFloat(row[col]);
        if (!isNaN(val)) {
          const [min, max] = VALID_RANGES[col];
          if (val < min || val > max) {
            if (errors.length < 20) {
              errors.push(`Row ${rowIdx + 1}: ${col} value ${val} out of range [${min}, ${max}]`);
            }
          }
        }
      }
    });
  });

  const highMissing = Object.entries(missingValueCounts).filter(([_, count]) => count / rows.length > 0.3);
  highMissing.forEach(([col, count]) => {
    warnings.push(`Column "${col}" has ${Math.round((count / rows.length) * 100)}% missing values`);
  });

  const schema: DatasetSchema = {
    columns: columns.map((name) => {
      const sampleValues = rows.slice(0, 50).map((r) => r[name]).filter((v) => v && v !== "");
      const isNumeric = sampleValues.every((v) => !isNaN(parseFloat(v)));
      const isBool = sampleValues.every((v) => ["true", "false", "0", "1", "yes", "no"].includes(v.toLowerCase()));
      return {
        name,
        type: isBool ? "boolean" : isNumeric ? "numeric" : "categorical",
        nullable: missingValueCounts[name] > 0,
      };
    }),
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    rowCount: rows.length,
    columnCount: columns.length,
    schema,
    missingValueCounts,
  };
}

export function normalizeDataset(rows: Record<string, string>[]): Record<string, number | string | null>[] {
  const columns = Object.keys(rows[0]);
  const numericCols = columns.filter((col) => {
    const vals = rows.slice(0, 50).map((r) => r[col]).filter(Boolean);
    return vals.every((v) => !isNaN(parseFloat(v)));
  });

  // Calculate min/max for normalization
  const stats: Record<string, { min: number; max: number; mean: number }> = {};
  numericCols.forEach((col) => {
    const values = rows.map((r) => parseFloat(r[col])).filter((v) => !isNaN(v));
    if (values.length === 0) return;
    stats[col] = {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((a, b) => a + b, 0) / values.length,
    };
  });

  return rows.map((row) => {
    const normalized: Record<string, number | string | null> = {};
    columns.forEach((col) => {
      const val = row[col];
      if (!val || val === "" || val === "null" || val === "NA") {
        // Impute with mean for numeric, null for others
        normalized[col] = stats[col] ? stats[col].mean : null;
        return;
      }
      if (stats[col]) {
        const num = parseFloat(val);
        const { min, max } = stats[col];
        normalized[col] = max === min ? 0 : (num - min) / (max - min);
      } else if (["true", "yes", "1"].includes(val.toLowerCase())) {
        normalized[col] = 1;
      } else if (["false", "no", "0"].includes(val.toLowerCase())) {
        normalized[col] = 0;
      } else {
        normalized[col] = val;
      }
    });
    return normalized;
  });
}

export const MODEL_TYPES = [
  { id: "logistic_regression", name: "Logistic Regression", description: "Linear model for binary classification" },
  { id: "random_forest", name: "Random Forest", description: "Ensemble of decision trees" },
  { id: "gradient_boosting", name: "Gradient Boosting", description: "Sequential ensemble learning" },
  { id: "xgboost", name: "XGBoost", description: "Optimized gradient boosting framework" },
  { id: "neural_network", name: "Neural Network", description: "Multi-layer perceptron classifier" },
] as const;

export const DEFAULT_HYPERPARAMETERS: Record<string, Record<string, number | string>> = {
  logistic_regression: { C: 1.0, max_iter: 1000, solver: "lbfgs" },
  random_forest: { n_estimators: 100, max_depth: 10, min_samples_split: 2 },
  gradient_boosting: { n_estimators: 100, learning_rate: 0.1, max_depth: 5 },
  xgboost: { n_estimators: 200, learning_rate: 0.1, max_depth: 6, subsample: 0.8 },
  neural_network: { hidden_layers: 3, neurons_per_layer: 64, learning_rate: 0.001, epochs: 50 },
};
