import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Settings, Loader2, Zap, Layers } from "lucide-react";
import { MODEL_TYPES, DEFAULT_HYPERPARAMETERS } from "@/lib/datasetUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Dataset {
  id: string;
  name: string;
  row_count: number;
  column_count: number;
  status: string;
  schema_info: any;
  sample_data: any;
  source: string;
}

interface Props {
  datasets: Dataset[];
  onTrainingComplete: () => void;
}

export default function TrainingPipeline({ datasets, onTrainingComplete }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDataset, setSelectedDataset] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [experimentName, setExperimentName] = useState("");
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hyperparams, setHyperparams] = useState<Record<string, number | string>>({});
  const [cvFolds, setCvFolds] = useState(5);
  const [cvEnabled, setCvEnabled] = useState(true);
  const [lastCvResults, setLastCvResults] = useState<any>(null);

  const readyDatasets = datasets.filter((d) => d.status === "ready");

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    setHyperparams({ ...DEFAULT_HYPERPARAMETERS[modelId] });
  };

  const handleTrain = async () => {
    if (!user || !selectedDataset || !selectedModel) return;

    setTraining(true);
    setProgress(10);

    try {
      const dataset = datasets.find((d) => d.id === selectedDataset);
      const name = experimentName || `${selectedModel}_${new Date().toISOString().slice(0, 16)}`;

      // Create experiment record
      const { data: experiment, error: insertError } = await supabase
        .from("experiments")
        .insert({
          user_id: user.id,
          dataset_id: selectedDataset,
          name,
          model_type: selectedModel,
          hyperparameters: hyperparams,
          status: "training",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setProgress(30);

      // Call training edge function
      const { data, error } = await supabase.functions.invoke("ml-train", {
        body: {
          action: "train",
          experimentId: experiment.id,
          datasetId: selectedDataset,
          modelType: selectedModel,
          hyperparameters: hyperparams,
          datasetData: {
            row_count: dataset?.row_count,
            column_count: dataset?.column_count,
            sample_data: dataset?.sample_data,
            column_mapping: dataset?.schema_info?.column_mapping,
            source: dataset?.source,
          },
          cvFolds: cvEnabled ? cvFolds : 1,
        },
      });

      setProgress(90);

      if (error) throw error;

      setProgress(100);
      setLastCvResults(data.cv_results || null);
      const cvSuffix = data.cv_results ? ` (${data.cv_results.k}-fold CV, σ=${(data.cv_results.std.accuracy * 100).toFixed(1)}%)` : "";
      toast({
        title: "Training complete",
        description: `${MODEL_TYPES.find((m) => m.id === selectedModel)?.name} achieved ${(data.metrics.accuracy * 100).toFixed(1)}% accuracy${cvSuffix}`,
      });
      onTrainingComplete();
    } catch (err: any) {
      toast({ title: "Training failed", description: err.message, variant: "destructive" });
    } finally {
      setTraining(false);
      setProgress(0);
    }
  };

  const handleBenchmarkAll = async () => {
    if (!user || !selectedDataset) return;
    setTraining(true);

    try {
      const dataset = datasets.find((d) => d.id === selectedDataset);

      for (let i = 0; i < MODEL_TYPES.length; i++) {
        const model = MODEL_TYPES[i];
        setProgress(((i + 0.5) / MODEL_TYPES.length) * 100);

        const { data: experiment } = await supabase
          .from("experiments")
          .insert({
            user_id: user.id,
            dataset_id: selectedDataset,
            name: `benchmark_${model.id}_${new Date().toISOString().slice(0, 10)}`,
            model_type: model.id,
            hyperparameters: DEFAULT_HYPERPARAMETERS[model.id],
            status: "training",
          })
          .select()
          .single();

        if (!experiment) continue;

        await supabase.functions.invoke("ml-train", {
          body: {
            action: "train",
            experimentId: experiment.id,
            datasetId: selectedDataset,
            modelType: model.id,
            hyperparameters: DEFAULT_HYPERPARAMETERS[model.id],
            datasetData: {
              row_count: dataset?.row_count,
              column_count: dataset?.column_count,
              sample_data: dataset?.sample_data,
              column_mapping: dataset?.schema_info?.column_mapping,
              source: dataset?.source,
            },
            cvFolds: cvEnabled ? cvFolds : 1,
          },
        });

        setProgress(((i + 1) / MODEL_TYPES.length) * 100);
      }

      toast({ title: "Benchmark complete", description: "All 5 models trained and evaluated" });
      onTrainingComplete();
    } catch (err: any) {
      toast({ title: "Benchmark failed", description: err.message, variant: "destructive" });
    } finally {
      setTraining(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" /> Training Configuration
          </CardTitle>
          <CardDescription>Select dataset and model to begin training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Dataset</Label>
              <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {readyDatasets.map((ds) => (
                    <SelectItem key={ds.id} value={ds.id}>
                      {ds.name} ({ds.row_count?.toLocaleString()} rows)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_TYPES.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Experiment Name (optional)</Label>
            <Input
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
              placeholder="e.g., baseline_rf_v1"
            />
          </div>

          {/* Cross-Validation Toggle */}
          <div className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">K-Fold Cross-Validation</Label>
              </div>
              <Switch checked={cvEnabled} onCheckedChange={setCvEnabled} />
            </div>
            {cvEnabled && (
              <div className="flex items-center gap-3">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Number of folds (k):</Label>
                <Select value={String(cvFolds)} onValueChange={(v) => setCvFolds(Number(v))}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 5, 7, 10].map((k) => (
                      <SelectItem key={k} value={String(k)}>{k}-fold</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  More folds = more robust estimates, longer training
                </span>
              </div>
            )}
          </div>

          {selectedModel && Object.keys(hyperparams).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hyperparameters</Label>
              <div className="grid gap-3 md:grid-cols-3">
                {Object.entries(hyperparams).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{key}</Label>
                    <Input
                      value={String(value)}
                      onChange={(e) => {
                        const v = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                        setHyperparams((prev) => ({ ...prev, [key]: v }));
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {training && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Training in progress... {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleTrain}
              disabled={training || !selectedDataset || !selectedModel}
              className="flex-1"
            >
              {training ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Train Model
            </Button>
            <Button
              onClick={handleBenchmarkAll}
              disabled={training || !selectedDataset}
              variant="outline"
              className="flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              Benchmark All 5 Models
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Supported models:</span>
            {MODEL_TYPES.map((m) => (
              <Badge key={m.id} variant="secondary" className="text-xs">
                {m.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Validation Results */}
      {lastCvResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {lastCvResults.k}-Fold Cross-Validation Results
            </CardTitle>
            <CardDescription>
              Performance metrics across {lastCvResults.k} folds showing mean ± standard deviation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mean ± Std summary */}
            <div className="grid gap-3 sm:grid-cols-5">
              {Object.entries(lastCvResults.mean as Record<string, number>).map(([key, mean]) => {
                const std = (lastCvResults.std as Record<string, number>)[key] || 0;
                return (
                  <div key={key} className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-xs text-muted-foreground capitalize">{key.replace("_", " ")}</p>
                    <p className="text-lg font-bold tabular-nums">{(mean * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground tabular-nums">± {(std * 100).toFixed(2)}%</p>
                  </div>
                );
              })}
            </div>

            {/* Per-fold detail */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Per-fold accuracy</Label>
              <div className="flex gap-2 flex-wrap">
                {lastCvResults.folds.map((f: any) => (
                  <Badge key={f.fold} variant="outline" className="tabular-nums text-xs">
                    Fold {f.fold}: {(f.metrics.accuracy * 100).toFixed(1)}%
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
