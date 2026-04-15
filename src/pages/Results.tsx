import { generateAIExplanation } from "../lib/ai";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft, Share2, AlertCircle, TrendingUp,
  Activity, FileText, FileJson, BookOpen
} from "lucide-react";

import { TestResult } from "../lib/storage";
import { RiskCard } from "../components/RiskCard";
import { FactorsList } from "../components/FactorsList";
import { DebugPanel } from "../components/DebugPanel";
import { CancerRiskResult, RiskFactor, DebugData } from "../lib/predictionEngine";
import { getAllCitations } from "../lib/citations";
import { downloadReport } from "../lib/reportExport";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const report = location.state?.report as TestResult | undefined;

  const [aiText, setAiText] = useState("");

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/start-test")}>
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const predictions = report.predictions;
  const rankedFactors: RiskFactor[] = report.rankedFactors || [];
  const debugData: DebugData | undefined = report.debugData;

  useEffect(() => {
    const runAI = async () => {
      try {
        const text = await generateAIExplanation(report);
        setAiText(text);
      } catch (e) {
        console.error(e);
      }
    };
    runAI();
  }, [report]);

  const getCancerResult = (cancer: 'pancreatic' | 'colon' | 'blood'): CancerRiskResult => {
    const p = predictions[cancer];
    return {
      probability: p.probability,
      confidence: p.confidence,
      riskLabel: p.probability < 0.3 ? "Low" : p.probability < 0.6 ? "Medium" : "High",
      explanation: "",
      rawScore: p.probability
    };
  };

  const getColor = (p: number) => {
    if (p < 0.3) return "#22c55e";
    if (p < 0.6) return "#eab308";
    return "#ef4444";
  };

  const pieData = [
    { name: "Pancreatic", value: predictions.pancreatic.probability * 100 },
    { name: "Colon", value: predictions.colon.probability * 100 },
    { name: "Blood", value: predictions.blood.probability * 100 },
  ];

  const barData = pieData.map(d => ({
    ...d,
    fill: getColor(d.value / 100)
  }));

  const reportUrl = `${window.location.origin}/my-reports?id=${report.id}`;

  return (
    <div className="pb-16">

      {/* HEADER */}
      <div className="p-4 border-b">
        <Button onClick={() => navigate("/")}>
          <ArrowLeft /> Back
        </Button>
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-6">
          CANary AI Report
        </h1>

        {/* RISK CARDS */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <RiskCard title="Pancreatic" result={getCancerResult('pancreatic')} />
          <RiskCard title="Colon" result={getCancerResult('colon')} />
          <RiskCard title="Blood" result={getCancerResult('blood')} />
        </div>

        {/* CHARTS */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={80}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={getColor(pieData[i].value / 100)} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {barData.map((d, i) => (
                    <Cell key={i} fill={d.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

          </CardContent>
        </Card>

        {/* AI */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>AI Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            {aiText || "Generating AI insights..."}
          </CardContent>
        </Card>

        {/* FACTORS */}
        {rankedFactors.length > 0 && (
          <FactorsList factors={rankedFactors} />
        )}

        {/* DEBUG */}
        {debugData && <DebugPanel debugData={debugData} />}

        {/* QR */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Share</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <QRCodeSVG value={reportUrl} size={140} />
          </CardContent>
        </Card>

        {/* DOWNLOAD */}
        <div className="mt-6 flex gap-3 justify-center">
          <Button onClick={() => downloadReport(report, "text")}>
            <FileText /> Text
          </Button>

          <Button onClick={() => downloadReport(report, "json")}>
            <FileJson /> JSON
          </Button>
        </div>

      </div>
    </div>
  );
};

export default Results;
