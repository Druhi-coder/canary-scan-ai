import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Brain, ArrowUp, ArrowDown } from "lucide-react";

interface Experiment {
  id: string;
  model_type: string;
  shap_values: any;
  feature_importance: any;
}

interface Props {
  experiments: Experiment[];
}

const MODEL_NAMES: Record<string, string> = {
  logistic_regression: "Logistic Regression",
  random_forest: "Random Forest",
  gradient_boosting: "Gradient Boosting",
  xgboost: "XGBoost",
  neural_network: "Neural Network",
};

export default function ExplainableAI({ experiments }: Props) {
  const withShap = experiments.filter((e) => e.shap_values && e.shap_values.length > 0);

  if (withShap.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Train a model to see SHAP-based explainability analysis showing which health features influence predictions most.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selected = withShap[0];
  const shapData = selected.shap_values
    .map((s: any) => ({
      ...s,
      abs_shap: Math.abs(s.mean_abs_shap),
    }))
    .sort((a: any, b: any) => b.abs_shap - a.abs_shap);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            SHAP Feature Attribution — {MODEL_NAMES[selected.model_type]}
          </CardTitle>
          <CardDescription>
            Shows which health features have the greatest influence on cancer risk predictions.
            Positive values increase risk; negative values decrease risk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ abs_shap: { label: "Mean |SHAP|", color: "hsl(var(--primary))" } }}
            className="h-[350px]"
          >
            <BarChart data={shapData} layout="vertical" margin={{ left: 130 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={120} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="abs_shap" radius={[0, 4, 4, 0]}>
                {shapData.map((entry: any, i: number) => (
                  <Cell
                    key={i}
                    fill={entry.direction === "positive" ? "hsl(var(--destructive))" : "hsl(var(--success-green))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          <div className="flex gap-6 justify-center mt-4 text-sm">
            <span className="flex items-center gap-1.5">
              <ArrowUp className="h-3.5 w-3.5 text-destructive" />
              <span className="text-muted-foreground">Increases risk</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ArrowDown className="h-3.5 w-3.5 text-green-600" />
              <span className="text-muted-foreground">Decreases risk</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Feature-by-feature explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature Attribution Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shapData.slice(0, 8).map((s: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                  <span className="font-medium text-sm">{s.feature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.max(20, s.abs_shap * 200)}px`,
                      backgroundColor: s.direction === "positive" ? "hsl(var(--destructive))" : "hsl(var(--success-green))",
                    }}
                  />
                  <span className="text-xs tabular-nums text-muted-foreground w-12 text-right">
                    {s.abs_shap.toFixed(3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
