import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Database, AlertTriangle, CheckCircle, Trash2, FileSpreadsheet } from "lucide-react";
import { parseCSV, validateDataset, type DatasetValidationResult } from "@/lib/datasetUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Dataset {
  id: string;
  name: string;
  source: string;
  row_count: number;
  column_count: number;
  status: string;
  created_at: string;
  schema_info: any;
}

interface Props {
  datasets: Dataset[];
  onRefresh: () => void;
}

export default function DatasetManager({ datasets, onRefresh }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [validation, setValidation] = useState<DatasetValidationResult | null>(null);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      const result = validateDataset(rows);
      setValidation(result);

      if (result.errors.length > 20) {
        toast({ title: "Too many validation errors", description: "Please fix the dataset and try again.", variant: "destructive" });
        return;
      }

      const sampleData = rows.slice(0, 5);

      const { error } = await supabase.from("datasets").insert({
        user_id: user.id,
        name: file.name.replace(/\.csv$/i, ""),
        source: "upload",
        row_count: result.rowCount,
        column_count: result.columnCount,
        schema_info: result.schema,
        sample_data: sampleData,
        status: result.valid ? "ready" : "needs_review",
      });

      if (error) throw error;
      toast({ title: "Dataset uploaded", description: `${result.rowCount} rows, ${result.columnCount} columns` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [user, toast, onRefresh]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("datasets").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      onRefresh();
    }
  };

  const handleGenerateSynthetic = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ml-train", {
        body: { action: "generate_synthetic", hyperparameters: { count: 500 } },
      });
      if (error) throw error;

      const rows = data.data;
      const columns = Object.keys(rows[0]);

      await supabase.from("datasets").insert({
        user_id: user.id,
        name: `synthetic_patients_${new Date().toISOString().slice(0, 10)}`,
        source: "synthetic",
        row_count: rows.length,
        column_count: columns.length,
        schema_info: { columns: columns.map((c: string) => ({ name: c, type: "numeric", nullable: false })) },
        sample_data: rows.slice(0, 5),
        status: "ready",
      });

      toast({ title: "Synthetic dataset generated", description: `${rows.length} patient records created` });
      onRefresh();
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Upload Dataset
            </CardTitle>
            <CardDescription>Import CSV files from Kaggle, UCI, or custom sources</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Supported: Kaggle cancer datasets, UCI ML Repository, custom CSVs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" /> Synthetic Generator
            </CardTitle>
            <CardDescription>Generate synthetic patient data for safe model testing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateSynthetic} disabled={uploading} className="w-full">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Generate 500 Synthetic Patients
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Creates realistic, anonymized patient records with demographic, clinical, and lab features
            </p>
          </CardContent>
        </Card>
      </div>

      {validation && (
        <Card className={validation.valid ? "border-green-300" : "border-destructive/50"}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {validation.valid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">{validation.rowCount} rows, {validation.columnCount} columns</p>
            {validation.errors.map((e, i) => (
              <p key={i} className="text-sm text-destructive">⚠ {e}</p>
            ))}
            {validation.warnings.map((w, i) => (
              <p key={i} className="text-sm text-muted-foreground">ℹ {w}</p>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Datasets</CardTitle>
        </CardHeader>
        <CardContent>
          {datasets.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No datasets yet. Upload a CSV or generate synthetic data to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Rows</TableHead>
                  <TableHead>Columns</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {datasets.map((ds) => (
                  <TableRow key={ds.id}>
                    <TableCell className="font-medium">{ds.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{ds.source}</Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{ds.row_count?.toLocaleString()}</TableCell>
                    <TableCell className="tabular-nums">{ds.column_count}</TableCell>
                    <TableCell>
                      <Badge variant={ds.status === "ready" ? "default" : "secondary"}>
                        {ds.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(ds.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
