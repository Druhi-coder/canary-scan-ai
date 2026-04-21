import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
  ResponsiveContainer, Cell, ComposedChart, Scatter, ErrorBar,
  Rectangle, ReferenceArea,
} from "recharts";
import { Download, TrendingUp, BarChart3, BoxSelect } from "lucide-react";

interface Experiment {
  id: string;
  name: string;
  model_type: string;
  metrics: any;
  confusion_matrix: any;
  roc_data: any;
  feature_importance: any;
  shap_values: any;
  hyperparameters: any;
  training_duration_ms: number;
  status: string;
  created_at: string;
  model_version: string;
}

interface Props {
  experiments: Experiment[];
}

const METRIC_LABELS: Record<string, string> = {
  accuracy: "Accuracy",
  precision: "Precision",
  recall: "Recall",
  f1_score: "F1 Score",
  roc_auc: "ROC-AUC",
};

const MODEL_NAMES: Record<string, string> = {
  logistic_regression: "Logistic Regression",
  random_forest: "Random Forest",
  gradient_boosting: "Gradient Boosting",
  xgboost: "XGBoost",
  neural_network: "Neural Network",
};

const chartConfig = {
  accuracy: { label: "Accuracy", color: "hsl(var(--primary))" },
  precision: { label: "Precision", color: "hsl(var(--success-green))" },
  recall: { label: "Recall", color: "hsl(var(--warning-yellow))" },
  f1_score: { label: "F1", color: "hsl(var(--destructive))" },
  roc_auc: { label: "ROC-AUC", color: "hsl(var(--medical-blue-dark))" },
};

export default function ModelEvaluation({ experiments }: Props) {
  const completed = experiments.filter((e) => e.status === "completed" && e.metrics);

  const benchmarkData = useMemo(() => {
    return completed.map((exp) => ({
      model: MODEL_NAMES[exp.model_type] || exp.model_type,
      accuracy: exp.metrics?.accuracy || 0,
      precision: exp.metrics?.precision || 0,
      recall: exp.metrics?.recall || 0,
      f1_score: exp.metrics?.f1_score || 0,
      roc_auc: exp.metrics?.roc_auc || 0,
    }));
  }, [completed]);

  // Build per-fold box plot data for CV experiments
  const cvBoxPlotData = useMemo(() => {
    const withCv = completed.filter((e) => e.hyperparameters?.cv_results?.folds);
    if (withCv.length === 0) return null;

    const metricKeys = Object.keys(METRIC_LABELS) as string[];
    // For each metric, build one entry per model with min/q1/median/q3/max
    return metricKeys.map((metric) => {
      const models = withCv.map((exp) => {
        const folds: { metrics: Record<string, number> }[] = exp.hyperparameters.cv_results.folds;
        const values = folds.map((f) => (f.metrics as any)[metric] as number).sort((a, b) => a - b);
        const q = (p: number) => {
          const idx = p * (values.length - 1);
          const lo = Math.floor(idx);
          const hi = Math.ceil(idx);
          return lo === hi ? values[lo] : values[lo] * (hi - idx) + values[hi] * (idx - lo);
        };
        return {
          model: MODEL_NAMES[exp.model_type] || exp.model_type,
          min: values[0],
          q1: q(0.25),
          median: q(0.5),
          q3: q(0.75),
          max: values[values.length - 1],
          mean: exp.hyperparameters.cv_results.mean[metric],
          std: exp.hyperparameters.cv_results.std[metric],
          foldValues: values,
        };
      });
      return { metric, label: METRIC_LABELS[metric], models };
    });
  }, [completed]);

  // Selected experiment for detailed view (most recent)
  const selectedExp = completed[0];

  const exportCSV = () => {
    if (completed.length === 0) return;
    const headers = ["Model", "Accuracy", "Precision", "Recall", "F1 Score", "ROC-AUC", "Training Time (ms)", "Version"];
    const rows = completed.map((e) => [
      MODEL_NAMES[e.model_type] || e.model_type,
      e.metrics?.accuracy?.toFixed(4),
      e.metrics?.precision?.toFixed(4),
      e.metrics?.recall?.toFixed(4),
      e.metrics?.f1_score?.toFixed(4),
      e.metrics?.roc_auc?.toFixed(4),
      e.training_duration_ms,
      e.model_version || "—",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `canary_benchmark_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (completed.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No completed experiments yet. Train a model to see evaluation results.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Benchmark comparison table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Model Comparison</CardTitle>
            <CardDescription>Side-by-side performance metrics across all trained models</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                {Object.values(METRIC_LABELS).map((label) => (
                  <TableHead key={label} className="text-right">{label}</TableHead>
                ))}
                <TableHead className="text-right">Time (ms)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completed.map((exp) => {
                const bestAccuracy = Math.max(...completed.map((e) => e.metrics?.accuracy || 0));
                const isBest = exp.metrics?.accuracy === bestAccuracy;
                return (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">
                      {MODEL_NAMES[exp.model_type] || exp.model_type}
                      {isBest && <Badge className="ml-2 text-xs" variant="default">Best</Badge>}
                    </TableCell>
                    {Object.keys(METRIC_LABELS).map((key) => {
                      const cvResults = exp.hyperparameters?.cv_results;
                      const std = cvResults?.std?.[key];
                      return (
                        <TableCell key={key} className="text-right tabular-nums">
                          {((exp.metrics?.[key] || 0) * 100).toFixed(1)}%
                          {std != null && (
                            <span className="text-xs text-muted-foreground ml-1">±{(std * 100).toFixed(1)}</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right tabular-nums">
                      {exp.training_duration_ms?.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bar chart comparison */}
      {benchmarkData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={benchmarkData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis domain={[0.6, 1]} tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="accuracy" fill="hsl(var(--primary))" name="Accuracy" radius={[4, 4, 0, 0]} />
                <Bar dataKey="roc_auc" fill="hsl(var(--medical-blue-dark))" name="ROC-AUC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* CV Variance Box Plot */}
      {cvBoxPlotData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BoxSelect className="h-5 w-5 text-primary" />
              Cross-Validation Variance
            </CardTitle>
            <CardDescription>
              Per-fold metric distributions across models (box plot: min → Q1 → median → Q3 → max)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {cvBoxPlotData.map(({ metric, label, models }) => (
              <div key={metric}>
                <h4 className="text-sm font-semibold mb-3 text-foreground">{label}</h4>
                <div className="space-y-2">
                  {models.map((m) => {
                    const rangeMin = Math.max(0, m.min - 0.02);
                    const rangeMax = Math.min(1, m.max + 0.02);
                    const scale = (v: number) => ((v - rangeMin) / (rangeMax - rangeMin)) * 100;

                    return (
                      <div key={m.model} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-32 text-right shrink-0 truncate">
                          {m.model}
                        </span>
                        <div className="relative flex-1 h-8">
                          {/* Whisker line (min to max) */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-px bg-muted-foreground/50"
                            style={{ left: `${scale(m.min)}%`, width: `${scale(m.max) - scale(m.min)}%` }}
                          />
                          {/* Min whisker cap */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground/50"
                            style={{ left: `${scale(m.min)}%` }}
                          />
                          {/* Max whisker cap */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-muted-foreground/50"
                            style={{ left: `${scale(m.max)}%` }}
                          />
                          {/* IQR box (Q1 to Q3) */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 h-5 rounded-sm bg-primary/20 border border-primary/40"
                            style={{
                              left: `${scale(m.q1)}%`,
                              width: `${Math.max(1, scale(m.q3) - scale(m.q1))}%`,
                            }}
                          />
                          {/* Median line */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary"
                            style={{ left: `${scale(m.median)}%` }}
                          />
                          {/* Mean dot */}
                          <div
                            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-destructive border border-background"
                            style={{ left: `${scale(m.mean)}%`, transform: "translate(-50%, -50%)" }}
                          />
                          {/* Individual fold points */}
                          {m.foldValues.map((v, i) => (
                            <div
                              key={i}
                              className="absolute top-1/2 w-1.5 h-1.5 rounded-full bg-foreground/30"
                              style={{ left: `${scale(v)}%`, transform: "translate(-50%, -50%)" }}
                            />
                          ))}
                        </div>
                        <span className="text-xs tabular-nums text-muted-foreground w-28 shrink-0">
                          {(m.mean * 100).toFixed(1)}% ±{(m.std * 100).toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40 inline-block" /> IQR
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-0.5 h-3 bg-primary inline-block" /> Median
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-destructive inline-block" /> Mean
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/30 inline-block" /> Fold values
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ROC Curve */}
      {selectedExp?.roc_data && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              ROC Curve — {MODEL_NAMES[selectedExp.model_type]}
            </CardTitle>
            <CardDescription>
              AUC = {(selectedExp.metrics?.roc_auc || 0).toFixed(3)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ tpr: { label: "TPR", color: "hsl(var(--primary))" } }} className="h-[300px]">
              <LineChart data={selectedExp.roc_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fpr" label={{ value: "False Positive Rate", position: "bottom" }} tick={{ fontSize: 11 }} />
                <YAxis label={{ value: "True Positive Rate", angle: -90, position: "insideLeft" }} tick={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="tpr" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                {/* Diagonal reference line */}
                <Line type="linear" dataKey="fpr" stroke="hsl(var(--muted-foreground))" strokeDasharray="5 5" strokeWidth={1} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Confusion Matrix */}
      {selectedExp?.confusion_matrix && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Confusion Matrix — {MODEL_NAMES[selectedExp.model_type]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-1 max-w-sm mx-auto">
              <div />
              <div className="text-center text-xs font-medium text-muted-foreground p-2">Pred. Negative</div>
              <div className="text-center text-xs font-medium text-muted-foreground p-2">Pred. Positive</div>
              <div className="text-xs font-medium text-muted-foreground p-2 flex items-center">Actual Negative</div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-md p-4 text-center">
                <span className="text-xl font-bold tabular-nums text-green-700 dark:text-green-300">
                  {selectedExp.confusion_matrix.tn}
                </span>
                <p className="text-xs text-muted-foreground">TN</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/30 rounded-md p-4 text-center">
                <span className="text-xl font-bold tabular-nums text-red-700 dark:text-red-300">
                  {selectedExp.confusion_matrix.fp}
                </span>
                <p className="text-xs text-muted-foreground">FP</p>
              </div>
              <div className="text-xs font-medium text-muted-foreground p-2 flex items-center">Actual Positive</div>
              <div className="bg-red-100 dark:bg-red-900/30 rounded-md p-4 text-center">
                <span className="text-xl font-bold tabular-nums text-red-700 dark:text-red-300">
                  {selectedExp.confusion_matrix.fn}
                </span>
                <p className="text-xs text-muted-foreground">FN</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 rounded-md p-4 text-center">
                <span className="text-xl font-bold tabular-nums text-green-700 dark:text-green-300">
                  {selectedExp.confusion_matrix.tp}
                </span>
                <p className="text-xs text-muted-foreground">TP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Importance */}
      {selectedExp?.feature_importance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feature Importance — {MODEL_NAMES[selectedExp.model_type]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ importance: { label: "Importance", color: "hsl(var(--primary))" } }} className="h-[400px]">
              <BarChart
                data={selectedExp.feature_importance.slice(0, 12)}
                layout="vertical"
                margin={{ left: 120 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="feature"
                  tick={{ fontSize: 11 }}
                  width={110}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {selectedExp.feature_importance.slice(0, 12).map((_: any, i: number) => (
                    <Cell key={i} fill={i < 3 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} fillOpacity={1 - i * 0.06} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
