import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  BarChart3,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type RiskLevel = "low" | "medium" | "high";

interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
}

interface ResearchStats {
  totalScans: number;
  avgAge: number;
  riskDistribution: {
    pancreatic: RiskDistribution;
    colon: RiskDistribution;
    blood: RiskDistribution;
  };
  mostCommonSymptom: string;
}

const EMPTY_STATS: ResearchStats = {
  totalScans: 0,
  avgAge: 0,
  riskDistribution: {
    pancreatic: {
      low: 0,
      medium: 0,
      high: 0,
    },
    colon: {
      low: 0,
      medium: 0,
      high: 0,
    },
    blood: {
      low: 0,
      medium: 0,
      high: 0,
    },
  },
  mostCommonSymptom: "N/A",
};

const ResearchMode = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<ResearchStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadResearchData = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /*
         * IMPORTANT:
         *
         * Do NOT query the reports table directly here.
         *
         * The reports table has RLS policies that allow users
         * to see only their own reports.
         *
         * Research Mode needs the anonymized aggregate data
         * returned by the SECURITY DEFINER RPC function.
         */

        const { data, error } = await supabase.rpc(
          "get_research_summary"
        );

        if (error) {
          console.error(
            "Error loading research summary:",
            error
          );

          setErrorMessage(
            "Unable to load research data. Please try again later."
          );

          return;
        }

        console.log(
          "Research Mode RPC response:",
          data
        );

        if (!data) {
          setStats(EMPTY_STATS);
          return;
        }

        /*
         * Depending on how the PostgreSQL function is declared,
         * Supabase can return either:
         *
         * 1. an object
         * 2. an array containing one object
         *
         * Handle both safely.
         */

        const rawData: any = Array.isArray(data)
          ? data[0]
          : data;

        if (!rawData) {
          setStats(EMPTY_STATS);
          return;
        }

        /*
         * The RPC currently returns:
         *
         * {
         *   averageAge: 26.3,
         *   riskDistribution: {
         *     blood: { low: 31, medium: 4, high: 0 },
         *     colon: { low: 33, medium: 2, high: 0 },
         *     pancreatic: { low: 32, medium: 3, high: 0 }
         *   },
         *   totalAssessments: 38,
         *   mostCommonSymptom: "Constipation"
         * }
         */

        const riskDistribution =
          rawData.riskDistribution || {};

        const pancreatic =
          riskDistribution.pancreatic || {};

        const colon =
          riskDistribution.colon || {};

        const blood =
          riskDistribution.blood || {};

        const researchStats: ResearchStats = {
          totalScans:
            Number(rawData.totalAssessments) || 0,

          /*
           * Keep one decimal place because the RPC
           * returns 26.3 rather than an integer.
           */
          avgAge:
            Number(rawData.averageAge) || 0,

          riskDistribution: {
            pancreatic: {
              low: Number(pancreatic.low) || 0,
              medium: Number(pancreatic.medium) || 0,
              high: Number(pancreatic.high) || 0,
            },

            colon: {
              low: Number(colon.low) || 0,
              medium: Number(colon.medium) || 0,
              high: Number(colon.high) || 0,
            },

            blood: {
              low: Number(blood.low) || 0,
              medium: Number(blood.medium) || 0,
              high: Number(blood.high) || 0,
            },
          },

          mostCommonSymptom:
            rawData.mostCommonSymptom || "N/A",
        };

        console.log(
          "Processed Research Mode statistics:",
          researchStats
        );

        setStats(researchStats);
      } catch (error) {
        console.error(
          "Unexpected Research Mode error:",
          error
        );

        setErrorMessage(
          "Something went wrong while loading research data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadResearchData();
  }, []);

  /*
   * RISK CHART
   */

  const riskChartData = [
    {
      name: "Pancreatic",
      Low: stats.riskDistribution.pancreatic.low,
      Medium:
        stats.riskDistribution.pancreatic.medium,
      High:
        stats.riskDistribution.pancreatic.high,
    },

    {
      name: "Colon",
      Low: stats.riskDistribution.colon.low,
      Medium:
        stats.riskDistribution.colon.medium,
      High:
        stats.riskDistribution.colon.high,
    },

    {
      name: "Blood",
      Low: stats.riskDistribution.blood.low,
      Medium:
        stats.riskDistribution.blood.medium,
      High:
        stats.riskDistribution.blood.high,
    },
  ];

  /*
   * LOADING STATE
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 max-w-6xl text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 animate-pulse text-muted-foreground" />

          <h2 className="text-2xl font-semibold">
            Loading Research Data...
          </h2>

          <p className="text-muted-foreground mt-2">
            Fetching anonymized CANary assessment
            statistics.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ERROR STATE
   */

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <Card className="text-center">
            <CardHeader>
              <CardTitle>
                Unable to Load Research Data
              </CardTitle>

              <CardDescription>
                {errorMessage}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /*
   * MAIN RESEARCH DASHBOARD
   */

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            Research Mode
          </h1>

          <p className="text-muted-foreground">
            Anonymized insights from CANary assessments
          </p>
        </div>

        {stats.totalScans === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />

              <h3 className="text-xl font-semibold mb-2">
                No Data Available
              </h3>

              <p className="text-muted-foreground mb-6">
                Complete some assessments to see
                research insights.
              </p>

              <Button
                onClick={() =>
                  navigate("/start-test")
                }
              >
                Start First Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* OVERVIEW STATS */}

            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Assessments
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-3xl font-bold">
                    {stats.totalScans}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Average Age
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-3xl font-bold">
                    {stats.avgAge} years
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Most Common Symptom
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-3xl font-bold">
                    {stats.mostCommonSymptom}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* RISK DISTRIBUTION */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Risk Score Distribution
                </CardTitle>

                <CardDescription>
                  Breakdown by cancer type and risk
                  level
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ResponsiveContainer
                  width="100%"
                  height={350}
                >
                  <BarChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis />

                    <Tooltip />

                    <Legend />

                    <Bar
                      dataKey="Low"
                      fill="hsl(var(--success-green))"
                    />

                    <Bar
                      dataKey="Medium"
                      fill="hsl(var(--warning-yellow))"
                    />

                    <Bar
                      dataKey="High"
                      fill="hsl(var(--danger-red))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* RESEARCH DATA NOTE */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Research Dataset
                </CardTitle>

                <CardDescription>
                  Aggregate statistics generated from
                  anonymized CANary assessments.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Total assessments included:{" "}
                    <strong className="text-foreground">
                      {stats.totalScans}
                    </strong>
                  </p>

                  <p>
                    Average participant age:{" "}
                    <strong className="text-foreground">
                      {stats.avgAge}
                    </strong>
                  </p>

                  <p>
                    Most frequently reported symptom:{" "}
                    <strong className="text-foreground">
                      {stats.mostCommonSymptom}
                    </strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchMode;
