import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Trash2, Calendar, TrendingUp, TrendingDown, Minus, FileText, ChevronDown, ChevronUp, BarChart3, GitCompare } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getReports, deleteReport, TestResult } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { CancerRiskResult } from "@/lib/predictionEngine";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import RiskTrendChart from "@/components/RiskTrendChart";
import { ReportComparison } from "@/components/ReportComparison";

interface TrendIndicator { direction: 'up' | 'down' | 'stable'; change: number; }

const calculateTrends = (current: TestResult, previous: TestResult | null) => {
  if (!previous) return { pancreatic: null, colon: null, blood: null };
  const calcTrend = (curr: CancerRiskResult | undefined, prev: CancerRiskResult | undefined): TrendIndicator | null => {
    if (!curr || !prev) return null;
    const change = curr.probability - prev.probability;
    if (Math.abs(change) < 2) return { direction: 'stable', change: 0 };
    return { direction: change > 0 ? 'up' : 'down', change: Math.round(Math.abs(change)) };
  };
  return {
    pancreatic: calcTrend(current.predictions?.pancreatic, previous.predictions?.pancreatic),
    colon: calcTrend(current.predictions?.colon, previous.predictions?.colon),
    blood: calcTrend(current.predictions?.blood, previous.predictions?.blood),
  };
};

const TrendBadge = ({ trend, label }: { trend: TrendIndicator | null; label: string }) => {
  if (!trend) return <Badge variant="outline" className="text-muted-foreground">{label}: First Test</Badge>;
  if (trend.direction === 'stable') return <Badge variant="outline" className="bg-muted/50"><Minus className="h-3 w-3 mr-1" />{label}: Stable</Badge>;
  if (trend.direction === 'up') return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><TrendingUp className="h-3 w-3 mr-1" />{label}: +{trend.change}%</Badge>;
  return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20"><TrendingDown className="h-3 w-3 mr-1" />{label}: -{trend.change}%</Badge>;
};

const getRiskSummary = (predictions: TestResult['predictions']) => {
  if (!predictions) return { label: 'Unknown', variant: 'secondary' as const };
  const maxRisk = Math.max(predictions.pancreatic?.probability ?? 0, predictions.colon?.probability ?? 0, predictions.blood?.probability ?? 0);
  if (maxRisk >= 60) return { label: 'High Risk', variant: 'destructive' as const };
  if (maxRisk >= 30) return { label: 'Medium Risk', variant: 'secondary' as const };
  return { label: 'Low Risk', variant: 'outline' as const };
};

const MyReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<TestResult[]>([]);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => { loadReports(); }, []);

  const loadReports = () => {
    const storedReports = getReports();
    storedReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setReports(storedReports);
  };

  const handleDelete = (id: string) => {
    deleteReport(id);
    setSelectedForCompare(prev => prev.filter(i => i !== id));
    loadReports();
    toast({ title: "Report Deleted", description: "The report has been removed." });
  };

  const toggleExpanded = (id: string) => setExpandedReports(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const getPreviousReport = (index: number) => index < reports.length - 1 ? reports[index + 1] : null;
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const toggleCompareSelection = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 2) {
        toast({ title: "Maximum 2 reports", description: "Deselect one to choose another." });
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length !== 2) {
      toast({ title: "Select 2 Reports", description: "Choose exactly 2 reports to compare." });
      return;
    }
    setIsCompareOpen(true);
  };

  const getCompareReports = () => {
    const [idA, idB] = selectedForCompare;
    const reportA = reports.find(r => r.id === idA);
    const reportB = reports.find(r => r.id === idB);
    // Sort by date (older first)
    if (reportA && reportB) {
      return new Date(reportA.date) < new Date(reportB.date) 
        ? { reportA, reportB } 
        : { reportA: reportB, reportB: reportA };
    }
    return { reportA: null, reportB: null };
  };

  const { reportA, reportB } = getCompareReports();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2"><ArrowLeft className="h-4 w-4" />Back</Button>
          <div className="flex items-center gap-2">
            {selectedForCompare.length === 2 && (
              <Button variant="outline" onClick={handleCompare} className="gap-2">
                <GitCompare className="h-4 w-4" />
                Compare Selected
              </Button>
            )}
            <Button onClick={() => navigate('/start-test')} className="gap-2"><Plus className="h-4 w-4" />New Test</Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">My Reports</h1>
            </div>
            <p className="text-muted-foreground">
              {reports.length} {reports.length === 1 ? 'report' : 'reports'} stored • Track your risk trends over time
              {reports.length >= 2 && (
                <span className="ml-2 text-primary">• Select 2 reports to compare</span>
              )}
            </p>
          </div>
          {reports.length === 0 ? (
            <Card className="text-center py-12"><CardContent><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">No Reports Yet</h3><p className="text-muted-foreground mb-6">Complete your first screening.</p><Button onClick={() => navigate('/start-test')}>Start Test</Button></CardContent></Card>
          ) : (
            <>
              <RiskTrendChart reports={reports} />
              <div className="space-y-4">
                {reports.map((report, index) => {
                  const trends = calculateTrends(report, getPreviousReport(index));
                  const riskSummary = getRiskSummary(report.predictions);
                  const isExpanded = expandedReports.has(report.id);
                  const isSelectedForCompare = selectedForCompare.includes(report.id);
                  return (
                    <Card key={report.id} className={isSelectedForCompare ? 'ring-2 ring-primary' : ''}>
                      <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(report.id)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {reports.length >= 2 && (
                                <Checkbox 
                                  checked={isSelectedForCompare}
                                  onCheckedChange={() => toggleCompareSelection(report.id)}
                                  aria-label="Select for comparison"
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">{formatDate(report.date)}</span>
                                  <Badge variant={riskSummary.variant}>{riskSummary.label}</Badge>
                                  {index === 0 && <Badge variant="secondary" className="bg-primary/10 text-primary">Latest</Badge>}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                  <TrendBadge trend={trends.pancreatic} label="Pancreatic" />
                                  <TrendBadge trend={trends.colon} label="Colon" />
                                  <TrendBadge trend={trends.blood} label="Blood" />
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm">{isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</Button>
                              </CollapsibleTrigger>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(report.id)} className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase">Risk Breakdown</h4>
                                {['pancreatic', 'colon', 'blood'].map(type => {
                                  const pred = report.predictions?.[type as keyof typeof report.predictions];
                                  return (
                                    <div key={type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                      <div><span className="font-medium capitalize">{type} Cancer</span><div className="text-sm text-muted-foreground">Confidence: {pred?.confidence || 'N/A'}</div></div>
                                      <div className="text-right"><span className="text-2xl font-bold">{pred?.probability ?? '--'}%</span><Badge variant="outline" className="ml-2">{pred?.riskLabel || 'N/A'}</Badge></div>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="space-y-4">
                                {report.rankedFactors && report.rankedFactors.length > 0 && (
                                  <div><h4 className="font-semibold text-sm text-muted-foreground uppercase mb-3">Key Factors</h4><div className="space-y-2">{report.rankedFactors.slice(0, 5).map((f, i) => <div key={i} className={`text-sm p-2 rounded ${f.impact === 'increases' ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>{f.impact === 'increases' ? '↑' : '↓'} {f.name}</div>)}</div></div>
                                )}
                                <div className="flex flex-col items-center p-4 bg-card border border-border rounded-lg"><p className="text-xs text-muted-foreground mb-2">Scan to share</p><QRCodeSVG value={`${window.location.origin}/results?id=${report.id}`} size={80} level="M" /></div>
                              </div>
                            </div>
                            {index === 0 && reports.length > 1 && <div className="mt-6 p-4 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground"><strong>Trend Analysis:</strong> Comparing to previous test from {formatDate(reports[1].date)}. ↑ = increased risk, ↓ = improvement.</p></div>}
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
          <div className="mt-8 p-4 bg-muted/50 rounded-lg"><p className="text-sm text-muted-foreground text-center"><strong>Disclaimer:</strong> For research purposes only. Consult a healthcare professional for diagnosis.</p></div>
        </div>
      </main>

      <ReportComparison 
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        reportA={reportA}
        reportB={reportB}
      />
    </div>
  );
};

export default MyReports;
