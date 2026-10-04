import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, FileText } from "lucide-react";

interface AssessmentRow {
  id: string;
  created_at: string;
  predictions: {
    pancreatic?: { probability?: number; riskLabel?: string };
    colon?:      { probability?: number; riskLabel?: string };
    blood?:      { probability?: number; riskLabel?: string };
  } | null;
}

const labelVariant = (label: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
  if (label === "High") return "destructive";
  if (label === "Medium") return "secondary";
  return "outline";
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssessments = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data, error } = await supabase
      .from("assessments")
      .select("id, created_at, predictions")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Dashboard] load error:", error);
      setAssessments([]);
    } else {
      setAssessments((data ?? []) as AssessmentRow[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Activity className="h-6 w-6 text-primary" />
            Research Assessment Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Investigational prototype — relative risk stratification scores, not clinical diagnoses.
          </p>
        </div>
        <Button onClick={() => navigate("/start-test")} className="gap-2">
          <Plus className="h-4 w-4" /> New Assessment
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Saved Assessment Records</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading records…</p>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-base font-medium">No saved assessments found</p>
              <p className="text-sm mt-1">Run an assessment to generate your first research record.</p>
              <Button onClick={() => navigate("/start-test")} className="mt-4" variant="outline">
                Start Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          assessments.map((a) => {
            const p = a.predictions ?? {};
            const rows: Array<["Pancreatic" | "Colon" | "Blood", { probability?: number; riskLabel?: string } | undefined]> = [
              ["Pancreatic", p.pancreatic],
              ["Colon", p.colon],
              ["Blood", p.blood],
            ];
            return (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-mono text-muted-foreground">
                    Record ID: {a.id} • {new Date(a.created_at).toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                  {rows.map(([name, r]) => (
                    <div key={name} className="rounded-lg bg-muted/40 p-3">
                      <div className="text-xs text-muted-foreground font-medium">{name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-lg font-semibold tabular-nums">
                          {typeof r?.probability === "number"
                            ? `${Math.round(r.probability * 100)}%`
                            : "—"}
                        </span>
                        <Badge variant={labelVariant(r?.riskLabel)}>
                          {r?.riskLabel ?? "—"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;
