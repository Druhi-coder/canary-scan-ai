import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Download } from "lucide-react";
import { TestResult } from "@/lib/storage";
import { generateComparisonPDF } from "@/lib/pdfExport";
import { useToast } from "@/hooks/use-toast";

interface ReportComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  reportA: TestResult | null;
  reportB: TestResult | null;
}

const formatDate = (d: string) => 
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const getRiskColor = (prob: number) => {
  if (prob >= 60) return 'text-destructive';
  if (prob >= 30) return 'text-yellow-600';
  return 'text-green-600';
};

const getDiffIcon = (diff: number) => {
  if (Math.abs(diff) < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
  if (diff > 0) return <TrendingUp className="h-4 w-4 text-destructive" />;
  return <TrendingDown className="h-4 w-4 text-green-600" />;
};

const getDiffBadge = (diff: number) => {
  if (Math.abs(diff) < 2) return <Badge variant="outline" className="bg-muted/50">No Change</Badge>;
  if (diff > 0) return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">+{Math.round(diff)}%</Badge>;
  return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">{Math.round(diff)}%</Badge>;
};

export const ReportComparison = ({ isOpen, onClose, reportA, reportB }: ReportComparisonProps) => {
  const { toast } = useToast();
  
  if (!reportA || !reportB) return null;

  const cancerTypes = ['pancreatic', 'colon', 'blood'] as const;
  
  const getFactorChanges = () => {
    const factorsA = new Set(reportA.rankedFactors?.map(f => f.name) || []);
    const factorsB = new Set(reportB.rankedFactors?.map(f => f.name) || []);
    
    const added = reportB.rankedFactors?.filter(f => !factorsA.has(f.name)) || [];
    const removed = reportA.rankedFactors?.filter(f => !factorsB.has(f.name)) || [];
    const common = reportA.rankedFactors?.filter(f => factorsB.has(f.name)) || [];
    
    return { added, removed, common };
  };

  const factorChanges = getFactorChanges();

  const handleExportPDF = () => {
    generateComparisonPDF(reportA, reportB);
    toast({ title: "PDF Exported", description: "Comparison saved to PDF." });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              Report Comparison
              <Badge variant="secondary">{formatDate(reportA.date)}</Badge>
              <ArrowRight className="h-4 w-4" />
              <Badge variant="secondary">{formatDate(reportB.date)}</Badge>
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Metrics Comparison */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Risk Probability Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cancerTypes.map(type => {
                  const probA = reportA.predictions?.[type]?.probability ?? 0;
                  const probB = reportB.predictions?.[type]?.probability ?? 0;
                  const diff = probB - probA;
                  
                  return (
                    <div key={type} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDiffIcon(diff)}
                        <span className="font-medium capitalize">{type} Cancer</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getRiskColor(probA)}`}>{probA}%</span>
                          <div className="text-xs text-muted-foreground">{formatDate(reportA.date)}</div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="text-right">
                          <span className={`text-lg font-bold ${getRiskColor(probB)}`}>{probB}%</span>
                          <div className="text-xs text-muted-foreground">{formatDate(reportB.date)}</div>
                        </div>
                        <div className="w-24 text-right">
                          {getDiffBadge(diff)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Confidence Level Changes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Confidence Level Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {cancerTypes.map(type => {
                  const confA = reportA.predictions?.[type]?.confidence || 'N/A';
                  const confB = reportB.predictions?.[type]?.confidence || 'N/A';
                  const changed = confA !== confB;
                  
                  return (
                    <div key={type} className={`p-4 rounded-lg ${changed ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'}`}>
                      <div className="font-medium capitalize mb-2">{type}</div>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">{confA}</Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant={changed ? "default" : "outline"}>{confB}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Factor Changes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Risk Factor Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {/* Removed Factors */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    No Longer Present ({factorChanges.removed.length})
                  </h4>
                  <div className="space-y-2">
                    {factorChanges.removed.length === 0 ? (
                      <p className="text-sm text-muted-foreground">None</p>
                    ) : (
                      factorChanges.removed.map((f, i) => (
                        <div key={i} className="text-sm p-2 rounded bg-green-500/10 text-green-600">
                          {f.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* New Factors */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    Newly Identified ({factorChanges.added.length})
                  </h4>
                  <div className="space-y-2">
                    {factorChanges.added.length === 0 ? (
                      <p className="text-sm text-muted-foreground">None</p>
                    ) : (
                      factorChanges.added.map((f, i) => (
                        <div key={i} className={`text-sm p-2 rounded ${f.impact === 'increases' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                          {f.impact === 'increases' ? '↑' : '↓'} {f.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Persistent Factors */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Persistent ({factorChanges.common.length})
                  </h4>
                  <div className="space-y-2">
                    {factorChanges.common.length === 0 ? (
                      <p className="text-sm text-muted-foreground">None</p>
                    ) : (
                      factorChanges.common.slice(0, 5).map((f, i) => (
                        <div key={i} className={`text-sm p-2 rounded ${f.impact === 'increases' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-muted/50'}`}>
                          {f.name}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Time Difference:</strong> {Math.round((new Date(reportB.date).getTime() - new Date(reportA.date).getTime()) / (1000 * 60 * 60 * 24))} days between tests
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
