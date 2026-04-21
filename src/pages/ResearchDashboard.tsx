import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Database, Play, BarChart3, Brain, FlaskConical, AlertTriangle, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DatasetManager from "@/components/research/DatasetManager";
import TrainingPipeline from "@/components/research/TrainingPipeline";
import ModelEvaluation from "@/components/research/ModelEvaluation";
import ExplainableAI from "@/components/research/ExplainableAI";
import ExperimentTracker from "@/components/research/ExperimentTracker";
import ValidationStudy from "@/components/research/ValidationStudy";

export default function ResearchDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [datasets, setDatasets] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [dsRes, expRes] = await Promise.all([
      supabase.from("datasets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("experiments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setDatasets(dsRes.data || []);
    setExperiments(expRes.data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Research Dashboard</h1>
              <p className="text-xs text-muted-foreground">ML Training, Evaluation & Explainability</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="tabular-nums">{datasets.length} datasets</span>
            <span>·</span>
            <span className="tabular-nums">{experiments.length} experiments</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Ethics disclaimer */}
        <Card className="mb-6 border-warning-yellow bg-warning-yellow/5">
          <CardContent className="py-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning-yellow shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Research Disclaimer:</strong> This system is for research purposes only
              and does not provide medical diagnosis. All models and predictions are experimental and should not be used
              for clinical decision-making. Consult qualified medical professionals for health concerns.
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="validation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="validation" className="gap-1.5 text-xs sm:text-sm">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Validation</span>
            </TabsTrigger>
            <TabsTrigger value="datasets" className="gap-1.5 text-xs sm:text-sm">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Datasets</span>
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-1.5 text-xs sm:text-sm">
              <Play className="h-4 w-4" />
              <span className="hidden sm:inline">Training</span>
            </TabsTrigger>
            <TabsTrigger value="evaluation" className="gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Evaluation</span>
            </TabsTrigger>
            <TabsTrigger value="explainability" className="gap-1.5 text-xs sm:text-sm">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">XAI</span>
            </TabsTrigger>
            <TabsTrigger value="experiments" className="gap-1.5 text-xs sm:text-sm">
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Experiments</span>
            </TabsTrigger>
          </TabsList>

          {/* Validation Study — first tab, always populated */}
          <TabsContent value="validation">
            <ValidationStudy />
          </TabsContent>

          <TabsContent value="datasets">
            <DatasetManager datasets={datasets} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="training">
            <TrainingPipeline datasets={datasets} onTrainingComplete={fetchData} />
          </TabsContent>

          <TabsContent value="evaluation">
            <ModelEvaluation experiments={experiments} />
          </TabsContent>

          <TabsContent value="explainability">
            <ExplainableAI experiments={experiments} />
          </TabsContent>

          <TabsContent value="experiments">
            <ExperimentTracker experiments={experiments} datasets={datasets} onRefresh={fetchData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
