import { generateAIExplanation } from "@/lib/ai";
import { downloadPDFReport } from "@/lib/reportExport";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import QRCodeSVG from "qrcode.react";
import { ArrowLeft, Download, Share2, AlertCircle, TrendingUp, Activity, FileText, FileJson, BookOpen } from "lucide-react";
import { TestResult } from "@/lib/storage";
import { RiskCard } from "@/components/RiskCard";
import { FactorsList } from "@/components/FactorsList";
import { DebugPanel } from "@/components/DebugPanel";
import { downloadReport, convertToExportable } from "@/lib/reportExport";
import { CancerRiskResult, RiskFactor, DebugData } from "@/lib/predictionEngine";
import { getAllCitations, formatCitation } from "@/lib/citations";
// CANary Results Processing Module
// Handles visualization, interpretation, and reporting of risk outputs
// Author: Druhi

// Core logic: transforms raw model outputs into user-facing clinical insights
const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report as TestResult | undefined;
  const [aiText, setAiText] = useState("");
  
  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
            <CardDescription>Please complete a test first</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/start-test")}>Start New Test</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract predictions with IEEE-ready structure
  const predictions = report.predictions;
  const rankedFactors: RiskFactor[] = report.rankedFactors || [];
  const debugData: DebugData | undefined = report.debugData;

  // Helper to generate default explanation
  const generateDefaultExplanation = (cancer: string, probability: number): string => {
    if (probability < 0.3) {
      return `Your ${cancer} cancer risk is within the low range based on the factors provided.`;
    } else if (probability < 0.6) {
      return `Your ${cancer} cancer risk is moderate. Consider discussing with a healthcare provider.`;
    }
    return `Your ${cancer} cancer risk is elevated. Please consult a healthcare professional promptly.`;
  };

  // Helper to create CancerRiskResult from legacy or new format
  const getCancerResult = (cancer: 'pancreatic' | 'colon' | 'blood'): CancerRiskResult => {
    const pred = predictions[cancer];
    return {
      probability: pred.probability,
      confidence: pred.confidence as 'Low' | 'Medium' | 'High',
      riskLabel: (pred as any).riskLabel || (pred.probability < 0.3 ? 'Low' : pred.probability < 0.6 ? 'Medium' : 'High'),
      explanation: (pred as any).explanation || generateDefaultExplanation(cancer, pred.probability),
      rawScore: (pred as any).rawScore || pred.probability,
    };
  };

  const getRiskColor = (probability: number) => {
    if (probability < 0.3) return "hsl(var(--success-green))";
    if (probability < 0.6) return "hsl(var(--warning-yellow))";
    return "hsl(var(--danger-red))";
  };

  // Chart data
  const pieChartData = [
    { name: "Pancreatic", value: predictions.pancreatic.probability * 100 },
    { name: "Colon", value: predictions.colon.probability * 100 },
    { name: "Blood", value: predictions.blood.probability * 100 },
  ];

  const barChartData = [
    { 
      name: "Pancreatic", 
      risk: predictions.pancreatic.probability * 100,
      fill: getRiskColor(predictions.pancreatic.probability)
    },
    { 
      name: "Colon", 
      risk: predictions.colon.probability * 100,
      fill: getRiskColor(predictions.colon.probability)
    },
    { 
      name: "Blood", 
      risk: predictions.blood.probability * 100,
      fill: getRiskColor(predictions.blood.probability)
    },
  ];

  const COLORS = [
    getRiskColor(predictions.pancreatic.probability),
    getRiskColor(predictions.colon.probability),
    getRiskColor(predictions.blood.probability),
  ];

  const reportUrl = `${window.location.origin}/my-reports?id=${report.id}`;
  useEffect(() => {
  const runAI = async () => {
    if (!report) return;
    try {
      const text = await generateAIExplanation(report);
      setAiText(text);
    } catch (e) {
      console.error("AI error:", e);
    }
  };

  runAI();
}, [report]);
  const handleDownloadText = () => {
    downloadReport(report, 'text');
  };

  const handleDownloadJSON = () => {
    downloadReport(report, 'json');
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
  CANary AI Risk Assessment Report
</h1>

{/* 🔥 ADD THIS BLOCK RIGHT HERE */}
<div className="mt-4 p-4 border rounded-lg bg-accent">
  <h2 className="text-lg font-semibold mb-2">Final Risk Verdict</h2>

  {(() => {
    const maxRisk = Math.max(
      predictions.pancreatic.probability,
      predictions.colon.probability,
      predictions.blood.probability
    );

    let verdict = "Low Risk";
    let color = "text-green-500";

    if (maxRisk >= 0.6) {
      verdict = "High Risk";
      color = "text-red-500";
    } else if (maxRisk >= 0.3) {
      verdict = "Moderate Risk";
      color = "text-yellow-500";
    }

    return (
      <p className={`text-2xl font-bold ${color}`}>
        {verdict}
      </p>
    );
  })()}
</div>

<p className="text-sm text-muted-foreground mt-2">
  CANary v3.0 | Validated on synthetic dataset (N=600) | Research Use Only
</p>
<p className="text-sm text-muted-foreground">
            Analysis completed on {new Date(report.date).toLocaleDateString()} at {new Date(report.date).toLocaleTimeString()}
          </p>
        </div>

        <Alert className="mb-8 bg-accent border-primary">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>⚠️ Research Tool Disclaimer:</strong> These results are generated by a rule-based screening engine 
            with risk weights calibrated from published epidemiological meta-analyses. They represent 
            <strong> population-level risk estimates</strong>, NOT individual diagnostic probabilities. 
            This tool has NOT been clinically validated and is NOT approved by any regulatory body (FDA, CE, etc.). 
            <strong> Always consult a qualified healthcare professional for medical evaluation.</strong>
          </AlertDescription>
        </Alert>

        {/* Risk Overview Cards - Using new RiskCard component */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <RiskCard
            title="Pancreatic Cancer"
            result={getCancerResult('pancreatic')}
          />
          <RiskCard
            title="Colon Cancer"
            result={getCancerResult('colon')}
          />
          <RiskCard
            title="Blood Cancer"
            result={getCancerResult('blood')}
          />
        </div>
        <div className="text-sm text-muted-foreground mb-8 text-center">
  Confidence indicates how reliable the prediction is based on available data, model agreement, and input completeness.
</div>
        <div className="mb-8">
  <h2 className="text-xl font-semibold mb-4">Risk Levels</h2>

  {[
    { label: "Pancreatic", value: predictions.pancreatic.probability },
    { label: "Colon", value: predictions.colon.probability },
    { label: "Blood", value: predictions.blood.probability },
  ].map((item) => {
    const percentage = (item.value * 100).toFixed(1);

    let color = "bg-green-500";
    if (item.value >= 0.6) color = "bg-red-500";
    else if (item.value >= 0.3) color = "bg-yellow-500";

    return (
      <div key={item.label} className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>{item.label}</span>
          <span>{percentage}%</span>
        </div>

        <div className="w-full bg-muted rounded-full h-3">
          <div
            className={`${color} h-3 rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  })}
</div>

        {/* Risk Distribution Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
            <CardDescription>
              Comparative analysis across cancer types. These are <strong>screening risk estimates</strong> based on 
              your profile, not diagnostic probabilities. The visualization helps compare relative risk levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">Proportional View</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }: any) => `${name}: ${Number(value).toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">Risk Comparison</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%" />
                    <YAxis type="category" dataKey="name" width={80} />
                    <Tooltip formatter={(value: any) => `${Number(value).toFixed(1)}%`} />
                    <Bar dataKey="risk" fill="#8884d8">
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🤖 AI Explanation */}
        <div className="p-4 border rounded-lg mt-6">
          <h2 className="font-semibold mb-2">AI Explanation</h2>

             <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {aiText || "Generating AI insights..."}
             </p>
        </div>
        
        {/* AI Interpretation - Using new FactorsList component */}
        {rankedFactors && rankedFactors.length > 0 ? (
          <div className="mb-8">
            <FactorsList factors={rankedFactors} maxFactors={8} />
          </div>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AI Interpretation
              </CardTitle>
              <CardDescription>Top factors influencing your results</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.topFeatures?.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Medical Report AI Analysis */}
        {report.aiAnalysis && (
          <Card className="mb-8 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Medical Report AI Analysis
              </CardTitle>
              <CardDescription>
                Combined analysis of your medical report and CANary assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-foreground">
                  {report.aiAnalysis}
                </div>
              </div>
              {report.medicalReport && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Analyzed File:</strong> {report.medicalReport.fileName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Debug Panel for Researchers */}
        {debugData && (
          <div className="mb-8">
            <DebugPanel debugData={debugData} />
          </div>
        )}

        {/* What to Do Next */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              What Should I Do Next?
            </CardTitle>
            <CardDescription>
              Recommended actions based on your screening results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-primary">1. Consult a Healthcare Professional</h4>
              <p className="text-sm text-muted-foreground">
                Schedule an appointment with your doctor to discuss these results. Bring this report to help them 
                understand your risk factors. Remember, CANary is a screening tool, not a diagnostic device.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2 text-primary">2. Get Recommended Medical Tests</h4>
              <p className="text-sm text-muted-foreground">
                Based on your results, your doctor may recommend:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                <li>Blood work (CBC, tumor markers like CEA, CA 19-9)</li>
                <li>Imaging tests (CT scan, MRI, ultrasound)</li>
                <li>Colonoscopy (for colon cancer screening)</li>
                <li>Endoscopic procedures (for pancreatic evaluation)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-primary">3. Lifestyle Modifications</h4>
              <p className="text-sm text-muted-foreground">
                Reduce your risk by adopting healthier habits:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside mt-2 space-y-1">
                <li>Quit smoking and limit alcohol consumption</li>
                <li>Increase fiber intake and reduce processed foods</li>
                <li>Exercise regularly (at least 150 minutes per week)</li>
                <li>Maintain a healthy weight and manage stress</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-primary">4. Monitor and Retest</h4>
              <p className="text-sm text-muted-foreground">
                Take another CANary test in 3-6 months to track changes in your risk profile. Keep a record 
                of all your reports in the "My Reports" section to observe trends over time.
              </p>
            </div>

            <Alert className="mt-4 bg-accent border-primary">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> If any results show medium or high risk, seek medical attention 
                promptly. Early detection significantly improves treatment outcomes and survival rates.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Evidence Base & Citations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Evidence Base & References
            </CardTitle>
            <CardDescription>
              Risk weights are derived from these peer-reviewed studies (v2.0 — literature-calibrated)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {getAllCitations().map((citation) => (
                <div key={citation.id} className="text-sm border-l-2 border-primary/30 pl-3">
                  <p className="text-foreground">
                    <span className="font-mono text-xs text-primary mr-2">[{citation.id}]</span>
                    {citation.authors} ({citation.year}). <em>{citation.title}</em>. {citation.journal}.
                  </p>
                  {citation.doi && (
                    <a 
                      href={`https://doi.org/${citation.doi}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      DOI: {citation.doi}
                    </a>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">↳ {citation.relevance}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* QR Code & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share & Save Report
            </CardTitle>
            <CardDescription>Access your report anytime or export for research</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-3">
                <QRCodeSVG value={reportUrl} size={150} />
              </div>
              <p className="text-sm text-muted-foreground">Scan to view all reports</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate("/my-reports")} className="gap-2">
                <TrendingUp className="h-4 w-4" />
                View All Reports
              </Button>
              <Button variant="outline" onClick={handleDownloadText} className="gap-2">
                <FileText className="h-4 w-4" />
                Download Text Report
              </Button>
              <Button 
               variant="outline" 
               onClick={() => downloadPDFReport(report)} 
               className="gap-2"
              >
              <FileText className="h-4 w-4" />
                Download PDF Report
              </Button>
              <Button variant="outline" onClick={handleDownloadJSON} className="gap-2">
                <FileJson className="h-4 w-4" />
                Download JSON (Research)
              </Button>
              <Button variant="outline" onClick={() => navigate("/start-test")}>
                Take Another Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;
