import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Trash2, Calendar, AlertCircle } from "lucide-react";
import { getReports, deleteReport, TestResult } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const MyReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<TestResult[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const storedReports = getReports();
    setReports(storedReports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      deleteReport(id);
      loadReports();
      toast({
        title: "Report Deleted",
        description: "The report has been removed from your history.",
      });
    }
  };

  const getRiskSummary = (predictions: TestResult["predictions"]) => {
    const risks = [
      { name: "Pancreatic", value: predictions.pancreatic.probability },
      { name: "Colon", value: predictions.colon.probability },
      { name: "Blood", value: predictions.blood.probability },
    ];
    
    const highest = risks.reduce((prev, current) => 
      current.value > prev.value ? current : prev
    );
    
    if (highest.value < 0.3) return { label: "All Low Risk", color: "text-success-green" };
    if (highest.value < 0.6) return { label: `${highest.name} - Medium Risk`, color: "text-warning-yellow" };
    return { label: `${highest.name} - High Risk`, color: "text-danger-red" };
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
          <Button onClick={() => navigate("/start-test")}>New Test</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">My Reports</h1>
          <p className="text-muted-foreground">
            {reports.length} {reports.length === 1 ? "report" : "reports"} stored locally
          </p>
        </div>

        {reports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
              <p className="text-muted-foreground mb-6">
                Take your first CANary scan to see results here
              </p>
              <Button onClick={() => navigate("/start-test")}>Start First Test</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => {
              const summary = getRiskSummary(report.predictions);
              const reportUrl = `${window.location.origin}/my-reports`;
              
              return (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          {new Date(report.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </CardTitle>
                        <CardDescription className={`font-semibold ${summary.color}`}>
                          {summary.label}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(report.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-4 gap-6 items-start">
                      {/* Risk Percentages */}
                      <div className="md:col-span-3 grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Pancreatic</p>
                          <p className="text-2xl font-bold">
                            {(report.predictions.pancreatic.probability * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {report.predictions.pancreatic.confidence}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Colon</p>
                          <p className="text-2xl font-bold">
                            {(report.predictions.colon.probability * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {report.predictions.colon.confidence}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Blood</p>
                          <p className="text-2xl font-bold">
                            {(report.predictions.blood.probability * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {report.predictions.blood.confidence}
                          </p>
                        </div>
                      </div>

                      {/* QR Code */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-white p-2 rounded">
                          <QRCodeSVG value={reportUrl} size={80} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Share Report</p>
                      </div>
                    </div>

                    {/* Top Features */}
                    {report.topFeatures && report.topFeatures.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Key Risk Factors:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {report.topFeatures.slice(0, 3).map((feature, idx) => (
                            <li key={idx}>• {feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReports;
