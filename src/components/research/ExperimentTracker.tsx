import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FlaskConical, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Experiment {
  id: string;
  name: string;
  model_type: string;
  hyperparameters: any;
  metrics: any;
  model_version: string;
  status: string;
  training_duration_ms: number;
  created_at: string;
  dataset_id: string;
}

interface Dataset {
  id: string;
  name: string;
}

interface Props {
  experiments: Experiment[];
  datasets: Dataset[];
  onRefresh: () => void;
}

const MODEL_NAMES: Record<string, string> = {
  logistic_regression: "Logistic Regression",
  random_forest: "Random Forest",
  gradient_boosting: "Gradient Boosting",
  xgboost: "XGBoost",
  neural_network: "Neural Network",
};

export default function ExperimentTracker({ experiments, datasets, onRefresh }: Props) {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("experiments").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      onRefresh();
    }
  };

  const exportLog = () => {
    const log = experiments.map((e) => ({
      name: e.name,
      model: MODEL_NAMES[e.model_type] || e.model_type,
      version: e.model_version || "—",
      dataset: datasets.find((d) => d.id === e.dataset_id)?.name || "—",
      hyperparameters: JSON.stringify(e.hyperparameters),
      accuracy: e.metrics?.accuracy?.toFixed(4) || "—",
      precision: e.metrics?.precision?.toFixed(4) || "—",
      recall: e.metrics?.recall?.toFixed(4) || "—",
      f1_score: e.metrics?.f1_score?.toFixed(4) || "—",
      roc_auc: e.metrics?.roc_auc?.toFixed(4) || "—",
      training_time_ms: e.training_duration_ms || "—",
      status: e.status,
      date: e.created_at,
    }));
    const csv = [Object.keys(log[0] || {}).join(","), ...log.map((r) => Object.values(r).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `canary_experiments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" /> Experiment Log
          </CardTitle>
          <CardDescription>Track model versions, datasets, hyperparameters, and results</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={exportLog} disabled={experiments.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Export Log
        </Button>
      </CardHeader>
      <CardContent>
        {experiments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No experiments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Experiment</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Dataset</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                  <TableHead className="text-right">ROC-AUC</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiments.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium text-sm max-w-[150px] truncate">{exp.name}</TableCell>
                    <TableCell className="text-sm">{MODEL_NAMES[exp.model_type] || exp.model_type}</TableCell>
                    <TableCell className="text-xs font-mono">{exp.model_version || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {datasets.find((d) => d.id === exp.dataset_id)?.name || "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {exp.metrics?.accuracy ? `${(exp.metrics.accuracy * 100).toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {exp.metrics?.roc_auc ? `${(exp.metrics.roc_auc * 100).toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={exp.status === "completed" ? "default" : exp.status === "training" ? "secondary" : "destructive"}>
                        {exp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(exp.created_at), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(exp.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
