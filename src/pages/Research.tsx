import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Database, AlertTriangle, BookOpen, Code } from "lucide-react";

const Research = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How CANary Works</h1>
          <p className="text-xl text-muted-foreground">
            Understanding the methodology behind AI-assisted cancer risk screening
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              CANary is an AI-driven early cancer detection research platform focused on screening for 
              <strong> pancreatic, colon, and blood cancers</strong>. The system collects structured 
              health information through a comprehensive questionnaire and applies a rule-based scoring 
              algorithm to estimate relative risk levels.
            </p>
            <h4>Data Collection</h4>
            <ul>
              <li><strong>Demographics:</strong> Age, gender, BMI, blood group</li>
              <li><strong>Medical History:</strong> Family cancer history, diabetes, IBD, hepatitis, anemia</li>
              <li><strong>Lifestyle Factors:</strong> Smoking, alcohol, sleep, physical activity, diet, stress</li>
              <li><strong>Symptoms:</strong> Categorized by cancer type with duration tracking</li>
              <li><strong>Lab Values:</strong> Hemoglobin, WBC, platelets, bilirubin, blood sugar</li>
              <li><strong>Medical Reports:</strong> Optional document upload for AI analysis</li>
            </ul>
          </CardContent>
        </Card>

        {/* Feature Engineering */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Feature Engineering
            </CardTitle>
            <CardDescription>How inputs are transformed for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Normalization</h4>
              <p className="text-sm text-muted-foreground">
                All inputs are normalized to a 0-1 scale. Age uses min-max normalization (0-100 range). 
                BMI uses deviation from healthy range (22.5 center). Lab values are normalized based on 
                deviation from clinical reference ranges.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Feature Vector</h4>
              <p className="text-sm text-muted-foreground mb-2">
                The system generates a standardized feature vector with the following groups:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <strong>Demographics (4 features)</strong>
                  <p className="text-muted-foreground">age_normalized, bmi_normalized, is_male, is_female</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <strong>Medical History (5 features)</strong>
                  <p className="text-muted-foreground">Binary flags for each condition</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <strong>Lifestyle (6 features)</strong>
                  <p className="text-muted-foreground">Ordinal scores 0-1 for each factor</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <strong>Symptoms (16 features)</strong>
                  <p className="text-muted-foreground">Binary flags grouped by cancer type</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <strong>Lab Values (5 features)</strong>
                  <p className="text-muted-foreground">Normalized deviation from reference ranges</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <strong>Data Quality (1 feature)</strong>
                  <p className="text-muted-foreground">lab_data_available (completeness metric)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Calculation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Risk Calculation
            </CardTitle>
            <CardDescription>For Researchers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Scoring Algorithm</h4>
              <p className="text-sm text-muted-foreground">
                Each cancer type has weighted risk factors based on medical literature. The algorithm 
                computes a weighted sum of contributing factors, normalized to 0-1 range.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Risk Thresholds</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Score Range</th>
                      <th className="text-left p-2">Risk Label</th>
                      <th className="text-left p-2">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">0.00 - 0.29</td>
                      <td className="p-2 text-success-green font-semibold">Low</td>
                      <td className="p-2 text-muted-foreground">Below average population risk</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">0.30 - 0.59</td>
                      <td className="p-2 text-warning-yellow font-semibold">Medium</td>
                      <td className="p-2 text-muted-foreground">Elevated risk, monitoring recommended</td>
                    </tr>
                    <tr>
                      <td className="p-2">0.60 - 1.00</td>
                      <td className="p-2 text-danger-red font-semibold">High</td>
                      <td className="p-2 text-muted-foreground">Significantly elevated, professional evaluation needed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Confidence Levels</h4>
              <p className="text-sm text-muted-foreground">
                Confidence is determined by data completeness (especially lab values) and pattern clarity. 
                Low confidence indicates insufficient data; High confidence indicates comprehensive input with 
                clear patterns.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Limitations */}
        <Card className="mb-8 border-warning-yellow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning-yellow">
              <AlertTriangle className="h-5 w-5" />
              Important Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-warning-yellow">•</span>
                <span><strong>Not Clinically Validated:</strong> CANary uses synthetic weights and has not been validated on clinical datasets.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning-yellow">•</span>
                <span><strong>Research Tool Only:</strong> Results are for educational and research purposes. Not a diagnostic device.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning-yellow">•</span>
                <span><strong>Rule-Based System:</strong> Uses weighted scoring, not trained machine learning models.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning-yellow">•</span>
                <span><strong>No Substitute for Professional Care:</strong> Always consult healthcare providers for medical decisions.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* References */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              For Researchers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-4">
            <p>
              The debug panel on the Results page exposes the complete feature vector and raw scores 
              for research purposes. This data can be exported in JSON format for further analysis.
            </p>
            <p>
              Feature weights are derived from general medical literature on cancer risk factors but 
              should be recalibrated using validated clinical datasets before any real-world application.
            </p>
            <div className="flex gap-4 mt-6">
              <Button onClick={() => navigate("/start-test")}>Try the Assessment</Button>
              <Button variant="outline" onClick={() => navigate("/my-reports")}>View Reports</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Research;
