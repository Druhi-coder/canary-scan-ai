import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, Cell } from "recharts";
import { Download, TrendingUp, BarChart3 } from "lucide-react";

interface Experiment {
  id: string;
  name: string;
  model_type: string;
  metrics: any;
  confusion_matrix: any;
  roc_data: any;
  feature_importance: any;
  shap_values: any;
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
                    {Object.keys(METRIC_LABELS).map((key) => (
                      <TableCell key={key} className="text-right tabular-nums">
                        {((exp.metrics?.[key] || 0) * 100).toFixed(1)}%
                      </TableCell>
                    ))}
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
