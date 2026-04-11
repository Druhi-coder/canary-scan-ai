import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";

export interface ColumnMapping {
  [canaryFeature: string]: string; // canary feature -> CSV column name
}

export const CANARY_FEATURES = [
  { id: "age", label: "Age", type: "numeric", required: false },
  { id: "gender", label: "Gender", type: "categorical", required: false },
  { id: "bmi", label: "BMI", type: "numeric", required: false },
  { id: "smoking", label: "Smoking Status", type: "categorical", required: false },
  { id: "alcohol", label: "Alcohol Consumption", type: "categorical", required: false },
  { id: "family_history", label: "Family History of Cancer", type: "categorical", required: false },
  { id: "crp", label: "CRP", type: "numeric", required: false },
  { id: "hemoglobin", label: "Hemoglobin", type: "numeric", required: false },
  { id: "wbc", label: "White Blood Cell Count", type: "numeric", required: false },
  { id: "cea", label: "CEA", type: "numeric", required: false },
  { id: "ca_19_9", label: "CA 19-9", type: "numeric", required: false },
  { id: "cancer_risk", label: "Cancer Risk (Target Label)", type: "target", required: true },
] as const;

const NONE_VALUE = "__none__";

/** Simple auto-matching heuristic */
function autoMap(csvColumns: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const lower = csvColumns.map((c) => c.toLowerCase().replace(/[\s_-]+/g, ""));

  const rules: [string, string[]][] = [
    ["age", ["age"]],
    ["gender", ["gender", "sex"]],
    ["bmi", ["bmi", "bodymassindex"]],
    ["smoking", ["smoking", "smoker", "smokingstatus"]],
    ["alcohol", ["alcohol", "alcoholintake", "alcoholconsumption", "alcoholuse"]],
    ["family_history", ["familyhistory", "cancerhistory", "familycancerhistory", "geneticrisk"]],
    ["crp", ["crp", "creactiveprotein"]],
    ["hemoglobin", ["hemoglobin", "hgb", "hb"]],
    ["wbc", ["wbc", "whitebloodcell", "whitebloodcellcount", "whitecellcount"]],
    ["cea", ["cea"]],
    ["ca_19_9", ["ca199", "ca19_9"]],
    ["cancer_risk", ["cancerrisk", "cancerrisklabel", "diagnosis", "label", "target"]],
  ];

  for (const [feature, aliases] of rules) {
    const idx = lower.findIndex((col) => aliases.includes(col));
    if (idx !== -1) {
      mapping[feature] = csvColumns[idx];
    }
  }
  return mapping;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvColumns: string[];
  sampleRows: Record<string, string>[];
  onConfirm: (mapping: ColumnMapping) => void;
}

export default function ColumnMappingDialog({ open, onOpenChange, csvColumns, sampleRows, onConfirm }: Props) {
  const [mapping, setMapping] = useState<ColumnMapping>(() => autoMap(csvColumns));

  const mappedCount = useMemo(() => Object.values(mapping).filter(Boolean).length, [mapping]);
  const hasTarget = !!mapping.cancer_risk;

  const handleChange = (feature: string, csvCol: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (csvCol === NONE_VALUE) {
        delete next[feature];
      } else {
        next[feature] = csvCol;
      }
      return next;
    });
  };

  const usedColumns = new Set(Object.values(mapping));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Map Dataset Columns to CANary Features</DialogTitle>
          <DialogDescription>
            Match your CSV columns to CANary's expected features. A target label column is required for training.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {/* Mapping table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">CANary Feature</TableHead>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>CSV Column</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CANARY_FEATURES.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{feature.label}</span>
                        {feature.required && (
                          <Badge variant="destructive" className="text-[10px] px-1 py-0">required</Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-1 py-0">{feature.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={mapping[feature.id] || NONE_VALUE}
                        onValueChange={(v) => handleChange(feature.id, v)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>— None —</SelectItem>
                          {csvColumns.map((col) => (
                            <SelectItem
                              key={col}
                              value={col}
                              disabled={usedColumns.has(col) && mapping[feature.id] !== col}
                            >
                              {col}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Data preview */}
            {sampleRows.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Data Preview (first 3 rows)</Label>
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {csvColumns.map((col) => (
                          <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleRows.slice(0, 3).map((row, i) => (
                        <TableRow key={i}>
                          {csvColumns.map((col) => (
                            <TableCell key={col} className="text-xs tabular-nums py-1">{row[col]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            {hasTarget ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <span className="text-muted-foreground">
              {mappedCount} / {CANARY_FEATURES.length} features mapped
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => onConfirm(mapping)} disabled={!hasTarget}>
              Confirm Mapping
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
