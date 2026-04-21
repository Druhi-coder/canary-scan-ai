import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, Users, TrendingUp, Activity } from "lucide-react";
import { getReports } from "@/lib/storage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const ResearchMode = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalScans: 0,
    avgAge: 0,
    genderDist: { male: 0, female: 0, other: 0 },
    riskDistribution: {
      pancreatic: { low: 0, medium: 0, high: 0 },
      colon: { low: 0, medium: 0, high: 0 },
      blood: { low: 0, medium: 0, high: 0 },
    },
    commonSymptoms: [] as { name: string; count: number }[],
  });

  useEffect(() => {
    const reports = getReports();
    
    if (reports.length === 0) {
      setStats({
        totalScans: 0,
        avgAge: 0,
        genderDist: { male: 0, female: 0, other: 0 },
        riskDistribution: {
          pancreatic: { low: 0, medium: 0, high: 0 },
          colon: { low: 0, medium: 0, high: 0 },
          blood: { low: 0, medium: 0, high: 0 },
        },
        commonSymptoms: [],
      });
      return;
    }

    // Calculate statistics
    const totalScans = reports.length;
    
    // Age calculation
    const ages = reports
      .map(r => parseInt(r.formData.age))
      .filter(age => !isNaN(age));
    const avgAge = ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0;

    // Gender distribution
    const genderDist = { male: 0, female: 0, other: 0 };
    reports.forEach(r => {
      const gender = r.formData.gender;
      if (gender === "male") genderDist.male++;
      else if (gender === "female") genderDist.female++;
      else genderDist.other++;
    });

    // Risk distribution
    const riskDist = {
      pancreatic: { low: 0, medium: 0, high: 0 },
      colon: { low: 0, medium: 0, high: 0 },
      blood: { low: 0, medium: 0, high: 0 },
    };

    reports.forEach(r => {
      // Pancreatic
      if (r.predictions.pancreatic.probability < 0.3) riskDist.pancreatic.low++;
      else if (r.predictions.pancreatic.probability < 0.6) riskDist.pancreatic.medium++;
      else riskDist.pancreatic.high++;

      // Colon
      if (r.predictions.colon.probability < 0.3) riskDist.colon.low++;
      else if (r.predictions.colon.probability < 0.6) riskDist.colon.medium++;
      else riskDist.colon.high++;

      // Blood
      if (r.predictions.blood.probability < 0.3) riskDist.blood.low++;
      else if (r.predictions.blood.probability < 0.6) riskDist.blood.medium++;
      else riskDist.blood.high++;
    });

    // Common symptoms
    const symptomCounts: Record<string, number> = {};
    const symptomFields = [
      'fatigue', 'weightLoss', 'jaundice', 'abdominalPain', 'bloodInStool',
      'nausea', 'paleSkin', 'bruising', 'backPain', 'infections', 'swollenLymphNodes'
    ];

    reports.forEach(r => {
      symptomFields.forEach(field => {
        if (r.formData[field]) {
          const readableName = field.replace(/([A-Z])/g, ' $1').trim();
          const capitalizedName = readableName.charAt(0).toUpperCase() + readableName.slice(1);
          symptomCounts[capitalizedName] = (symptomCounts[capitalizedName] || 0) + 1;
        }
      });
    });

    const commonSymptoms = Object.entries(symptomCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setStats({
      totalScans,
      avgAge: Math.round(avgAge),
      genderDist,
      riskDistribution: riskDist,
      commonSymptoms,
    });
  }, []);

  const riskChartData = [
    {
      name: "Pancreatic",
      Low: stats.riskDistribution.pancreatic.low,
      Medium: stats.riskDistribution.pancreatic.medium,
      High: stats.riskDistribution.pancreatic.high,
    },
    {
      name: "Colon",
      Low: stats.riskDistribution.colon.low,
      Medium: stats.riskDistribution.colon.medium,
      High: stats.riskDistribution.colon.high,
    },
    {
      name: "Blood",
      Low: stats.riskDistribution.blood.low,
      Medium: stats.riskDistribution.blood.medium,
      High: stats.riskDistribution.blood.high,
    },
  ];

  const genderChartData = [
    { name: "Male", value: stats.genderDist.male },
    { name: "Female", value: stats.genderDist.female },
    { name: "Other", value: stats.genderDist.other },
  ].filter(item => item.value > 0);

  const GENDER_COLORS = ["hsl(var(--medical-blue))", "hsl(var(--warning-yellow))", "hsl(var(--success-green))"];

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Research Mode</h1>
          <p className="text-muted-foreground">
            Anonymized insights from CANary assessments
          </p>
        </div>

        {stats.totalScans === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground mb-6">
                Complete some assessments to see research insights
              </p>
              <Button onClick={() => navigate("/start-test")}>Start First Test</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Total Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalScans}</p>
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
                  <p className="text-3xl font-bold">{stats.avgAge} years</p>
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
                    {stats.commonSymptoms.length > 0 ? stats.commonSymptoms[0].name : "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Risk Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
                <CardDescription>Breakdown by cancer type and risk level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Low" fill="hsl(var(--success-green))" />
                    <Bar dataKey="Medium" fill="hsl(var(--warning-yellow))" />
                    <Bar dataKey="High" fill="hsl(var(--danger-red))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gender Distribution */}
            {genderChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                  <CardDescription>Demographics of assessed individuals</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genderChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Common Symptoms */}
            {stats.commonSymptoms.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Most Reported Symptoms</CardTitle>
                  <CardDescription>Frequency of symptoms across all assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.commonSymptoms} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchMode;
