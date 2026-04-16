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
