import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import {
  ArrowLeft, AlertCircle, TrendingUp, Activity,
  FileText, Share2, Brain, ChevronDown, ChevronUp
} from "lucide-react";
import { TestResult } from "../lib/storage";
import { generateAIExplanation, AIExplanationResult } from "../lib/ai";

// ─── Colour palette ───────────────────────────────────────────────────────────
const RISK_COLORS = {
  Low:    { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100" },
  Medium: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", badge: "bg-yellow-100" },
  High:   { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100" },
};
const CANCER_COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

// ─── Sub-components ───────────────────────────────────────────────────────────

const RiskBadge = ({ label }: { label: "Low" | "Medium" | "High" }) => {
  const c = RISK_COLORS[label];
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${c.badge} ${c.text}`}>
      {label} Risk
    </span>
  );
};

interface RiskCardProps {
  title: string;
  probability: number;
  riskLabel: "Low" | "Medium" | "High";
  confidence: "Low" | "Medium" | "High";
  explanation: string;
  aiText?: string;
}

const RiskCard = ({ title, probability, riskLabel, confidence, explanation, aiText }: RiskCardProps) => {
  const c = RISK_COLORS[riskLabel];
  const p = Math.round(probability * 100);
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={`border-2 ${c.border} ${c.bg}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title} Cancer</CardTitle>
          <RiskBadge label={riskLabel} />
        </div>
        <p className="text-sm text-muted-foreground">
          Confidence: <span className="font-medium">{confidence}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Risk Score</span>
            <span className={`font-bold text-lg ${c.text}`}>{p}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                riskLabel === "High" ? "bg-red-500" :
                riskLabel === "Medium" ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${p}%` }}
            />
          </div>
        </div>

        {/* Short engine explanation */}
        <p className="text-sm text-muted-foreground">{explanation}</p>

        {/* AI explanation — expandable */}
        {aiText && (
          <div>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Brain className="h-3 w-3" />
              {expanded ? "Hide" : "Show"} detailed AI analysis
              {expanded
                ? <ChevronUp className="h-3 w-3" />
                : <ChevronDown className="h-3 w-3" />}
            </button>
            {expanded && (
              <div className="mt-2 p-3 rounded-lg bg-white/70 border border-border text-sm text-foreground leading-relaxed">
                {aiText}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Results = () => {
  interface InputData {
  age: number;
  gender: string;
  // add more fields later if needed
}

interface PredictionResult {
  pancreatic: any;
  colon: any;
  blood: any;
}

const inputData  = location.state?.inputData as InputData | undefined;
const predResult = location.state?.predResult as PredictionResult | undefined;

  const report     = location.state?.report     as TestResult | undefined;
  const inputData  = location.state?.inputData  as any | undefined;
  const predResult = location.state?.predResult as any | undefined;

  const [aiExplanation, setAiExplanation] = useState<AIExplanationResult | null>(null);
  const [aiLoading, setAiLoading]         = useState(false);
  const [copied, setCopied]               = useState(false);
  const [showOverall, setShowOverall]     = useState(false);

  // Redirect if no report
  useEffect(() => {
    if (!report) navigate("/start-test");
  }, [report, navigate]);

  // Generate AI explanations once data is available
  useEffect(() => {
    if (!report || !inputData || !predResult) return;
    setAiLoading(true);
    generateAIExplanation(predResult, inputData)
      .then(result => {
        setAiExplanation(result);
        setAiLoading(false);
      })
        .catch(() => {
       setAiLoading(false);
       setAiExplanation(null);
      });
  }, [report, inputData, predResult]);

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              No Report Found
            </CardTitle>
            <CardDescription>
              No assessment data found. Please complete the assessment first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/start-test")} className="w-full">
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { predictions, rankedFactors, inputSummary } = report;

  // Chart data
  const barData = [
    { name: "Pancreatic", risk: Math.round(predictions.pancreatic.probability * 100), fill: CANCER_COLORS[0] },
    { name: "Colon",      risk: Math.round(predictions.colon.probability * 100),      fill: CANCER_COLORS[1] },
    { name: "Blood",      risk: Math.round(predictions.blood.probability * 100),      fill: CANCER_COLORS[2] },
  ];
  const pieData = barData.map(d => ({ name: d.name, value: d.risk }));

  // Overall risk level
  const riskLabels = [
    predictions.pancreatic.riskLabel,
    predictions.colon.riskLabel,
    predictions.blood.riskLabel,
  ];
  const overallRisk: "Low" | "Medium" | "High" =
    riskLabels.includes("High")   ? "High"   :
    riskLabels.includes("Medium") ? "Medium" : "Low";

  // Share handler
  const handleShare = () => {
    const text =
      `CANary Scan Results (${new Date(report.date).toLocaleDateString()})\n` +
      `Pancreatic: ${predictions.pancreatic.riskLabel} (${Math.round(predictions.pancreatic.probability * 100)}%)\n` +
      `Colon:      ${predictions.colon.riskLabel} (${Math.round(predictions.colon.probability * 100)}%)\n` +
      `Blood:      ${predictions.blood.riskLabel} (${Math.round(predictions.blood.probability * 100)}%)\n\n` +
      `Note: This is a screening tool, not a diagnosis. Consult your doctor.\n` +
      `https://canary-scan-ai.vercel.app`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const topRisk       = rankedFactors?.filter(f => f.impact === "increases").slice(0, 4) ?? [];
  const topProtective = rankedFactors?.filter(f => f.impact === "decreases").slice(0, 3) ?? [];

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ── */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Home
            </Button>
            <h1 className="text-xl font-bold text-primary">CANary Results</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              {copied ? "Copied!" : "Share"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/my-reports")} className="gap-2">
              <FileText className="h-4 w-4" /> My Reports
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">

        {/* ── Disclaimer ── */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-sm">
            <strong>Important:</strong> CANary is a research-grade screening tool, not a diagnostic system.
            These scores estimate population-level risk and do not diagnose cancer.
            Always consult a qualified healthcare professional for medical advice.
          </AlertDescription>
        </Alert>

        {/* ── Overall summary card ── */}
        <Card className={`border-2 ${RISK_COLORS[overallRisk].border} ${RISK_COLORS[overallRisk].bg}`}>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary" />
                  Assessment Complete
                </CardTitle>
                <CardDescription className="mt-1">
                  {new Date(report.date).toLocaleString()}
                  {inputSummary ? ` · Age ${inputSummary.age}, ${inputSummary.gender}` : ""}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Overall Risk Level</p>
                <RiskBadge label={overallRisk} />
              </div>
            </div>
          </CardHeader>

          {/* AI Overall Summary */}
          {(aiLoading || aiExplanation) && (
            <CardContent className="pt-0">
              <div className="p-4 rounded-lg bg-white/60 border border-border">
                <button
                  onClick={() => setShowOverall(!showOverall)}
                  className="flex items-center gap-2 text-sm font-semibold text-primary w-full text-left"
                >
                  <Brain className="h-4 w-4" />
                  {aiLoading
                    ? "Generating personalised AI summary…"
                    : "View your personalised AI summary"}
                  {!aiLoading && (
                    showOverall
                      ? <ChevronUp className="h-4 w-4 ml-auto" />
                      : <ChevronDown className="h-4 w-4 ml-auto" />
                  )}
                </button>
                {!aiLoading && showOverall && aiExplanation && (
                  <p className="mt-3 text-sm text-foreground leading-relaxed">
                    {aiExplanation.overall}
                  </p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* ── Risk Cards ── */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Cancer Risk Scores
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <RiskCard
              title="Pancreatic"
              probability={predictions.pancreatic.probability}
              riskLabel={predictions.pancreatic.riskLabel}
              confidence={predictions.pancreatic.confidence}
              explanation={predictions.pancreatic.explanation}
              aiText={aiExplanation?.pancreatic}
            />
            <RiskCard
              title="Colon"
              probability={predictions.colon.probability}
              riskLabel={predictions.colon.riskLabel}
              confidence={predictions.colon.confidence}
              explanation={predictions.colon.explanation}
              aiText={aiExplanation?.colon}
            />
            <RiskCard
              title="Blood"
              probability={predictions.blood.probability}
              riskLabel={predictions.blood.riskLabel}
              confidence={predictions.blood.confidence}
              explanation={predictions.blood.explanation}
              aiText={aiExplanation?.blood}
            />
          </div>
        </section>

        {/* ── Charts ── */}
        <section className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Score Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => [`${v}%`, "Risk"]} />
                  <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CANCER_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`, "Score"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        {/* ── Risk Factors ── */}
        {(topRisk.length > 0 || topProtective.length > 0) && (
          <section className="grid md:grid-cols-2 gap-6">
            {topRisk.length > 0 && (
              <Card className="border-red-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-red-700">⚠️ Risk Factors Identified</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topRisk.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-red-400 flex-shrink-0" />
                        <span>
                          <span className="font-medium">{f.name}</span>
                          <span className="text-muted-foreground ml-1 text-xs capitalize">
                            ({f.cancerType})
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {topProtective.length > 0 && (
              <Card className="border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-green-700">✅ Protective Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topProtective.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 h-2 w-2 rounded-full bg-green-400 flex-shrink-0" />
                        <span className="font-medium">{f.name}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </section>
        )}

        {/* ── Next Steps ── */}
        <Card className="border-blue-100 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base text-blue-800">📋 Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            {overallRisk === "High" && (
              <p>🔴 <strong>High risk detected.</strong> Please consult a doctor soon and share these results. Do not delay seeking professional evaluation.</p>
            )}
            {overallRisk === "Medium" && (
              <p>🟡 <strong>Moderate risk detected.</strong> Schedule a check-up with your doctor and mention these findings. Regular screening is recommended.</p>
            )}
            {overallRisk === "Low" && (
              <p>🟢 <strong>Low risk detected.</strong> Continue healthy habits and maintain regular annual check-ups with your healthcare provider.</p>
            )}
            <p>• These results are for informational purposes only and <strong>do not replace medical diagnosis</strong>.</p>
            <p>• Bring a printed or digital copy of this report to your next doctor's visit.</p>
            <p>• Repeat this assessment in 6–12 months or if new symptoms develop.</p>
          </CardContent>
        </Card>

        {/* ── Action Buttons ── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <Button onClick={() => navigate("/start-test")} size="lg" className="gap-2">
            <Activity className="h-4 w-4" /> New Assessment
          </Button>
          <Button onClick={() => navigate("/my-reports")} variant="outline" size="lg" className="gap-2">
            <FileText className="h-4 w-4" /> View All Reports
          </Button>
          <Button onClick={() => navigate("/research-mode")} variant="outline" size="lg">
            Research Mode
          </Button>
        </div>

      </main>
    </div>
  );
};

export default Results;
