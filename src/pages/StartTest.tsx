import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { generatePrediction, PredictionInput } from "@/lib/prediction";
import { saveReport } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const StartTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Demographics
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    bloodGroup: "",
    occupation: "",
    location: "",
    
    // Medical History
    familyCancerHistory: false,
    diabetesHistory: false,
    ibdHistory: false,
    hepatitisHistory: false,
    anemiaHistory: false,
    autoimmune: false,
    
    // Lifestyle
    smoking: "",
    alcohol: "",
    sleep: "",
    waterIntake: "",
    diet: "",
    fiber: "",
    processedFood: "",
    physicalActivity: "",
    stress: "",
    
    // General Symptoms
    fatigue: false,
    weightLoss: false,
    appetiteLoss: false,
    fever: false,
    dizziness: false,
    bruising: false,
    jaundice: false,
    
    // Pancreatic Specific
    abdominalPain: false,
    backPain: false,
    nausea: false,
    newDiabetes: false,
    itchySkin: false,
    floatingStool: false,
    
    // Colon Specific
    bloodInStool: false,
    constipation: false,
    narrowStool: false,
    bloating: false,
    
    // Blood Cancer Specific
    infections: false,
    nosebleeds: false,
    bonePain: false,
    swollenLymphNodes: false,
    shortBreath: false,
    paleSkin: false,
    
    // Lab Data (optional)
    hemoglobin: "",
    wbcCount: "",
    plateletCount: "",
    bilirubin: "",
    bloodSugar: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!consentGiven) {
      toast({
        variant: "destructive",
        title: "Consent Required",
        description: "Please acknowledge the disclaimer to proceed.",
      });
      return;
    }

    setLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate BMI
    const heightM = parseFloat(formData.height) / 100;
    const weightKg = parseFloat(formData.weight);
    const bmi = weightKg / (heightM * heightM);

    // Prepare prediction input
    const predictionInput: PredictionInput = {
      age: parseInt(formData.age) || 30,
      gender: formData.gender || "other",
      bmi: isNaN(bmi) ? 25 : bmi,
      bloodGroup: formData.bloodGroup || "unknown",
      familyCancerHistory: formData.familyCancerHistory,
      diabetesHistory: formData.diabetesHistory,
      ibdHistory: formData.ibdHistory,
      hepatitisHistory: formData.hepatitisHistory,
      anemiaHistory: formData.anemiaHistory,
      smoking: formData.smoking || "never",
      alcohol: formData.alcohol || "never",
      sleep: formData.sleep || "7-9",
      physicalActivity: formData.physicalActivity || "moderate",
      diet: formData.diet || "mixed",
      stress: formData.stress || "moderate",
      fatigue: formData.fatigue,
      weightLoss: formData.weightLoss,
      jaundice: formData.jaundice,
      abdominalPain: formData.abdominalPain,
      bloodInStool: formData.bloodInStool,
      nausea: formData.nausea,
      paleSkin: formData.paleSkin,
      bruising: formData.bruising,
      backPain: formData.backPain,
      newDiabetes: formData.newDiabetes,
      floatingStool: formData.floatingStool,
      constipation: formData.constipation,
      narrowStool: formData.narrowStool,
      bloating: formData.bloating,
      infections: formData.infections,
      nosebleeds: formData.nosebleeds,
      bonePain: formData.bonePain,
      swollenLymphNodes: formData.swollenLymphNodes,
      hemoglobin: formData.hemoglobin ? parseFloat(formData.hemoglobin) : undefined,
      wbcCount: formData.wbcCount ? parseFloat(formData.wbcCount) : undefined,
      plateletCount: formData.plateletCount ? parseFloat(formData.plateletCount) : undefined,
      bilirubin: formData.bilirubin ? parseFloat(formData.bilirubin) : undefined,
      bloodSugar: formData.bloodSugar ? parseFloat(formData.bloodSugar) : undefined,
    };

    // Generate prediction
    const prediction = generatePrediction(predictionInput);

    // Save report
    const report = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      predictions: prediction,
      formData: formData,
      topFeatures: prediction.topFeatures,
    };
    
    saveReport(report);
    
    setLoading(false);
    navigate("/results", { state: { report } });
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">CANary Health Assessment</h1>
          <p className="text-lg text-muted-foreground">
            Complete the form below for personalized cancer risk analysis
          </p>
        </div>

        <Alert className="mb-8 bg-warning-yellow-light border-warning-yellow">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> CANary is a research tool for educational purposes only. 
            This is not a medical diagnosis. Always consult healthcare professionals for medical advice.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Demographics Section */}
          <Card>
            <CardHeader>
              <CardTitle>1. Basic Demographics</CardTitle>
              <CardDescription>Help us understand your baseline health profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name (Optional)</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={formData.bloodGroup} onValueChange={(value) => setFormData({...formData, bloodGroup: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height" 
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical History Section */}
          <Card>
            <CardHeader>
              <CardTitle>2. Medical & Family History</CardTitle>
              <CardDescription>Check all that apply</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="familyCancerHistory" 
                  checked={formData.familyCancerHistory}
                  onCheckedChange={(checked) => setFormData({...formData, familyCancerHistory: checked as boolean})}
                />
                <Label htmlFor="familyCancerHistory">Family history of cancer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="diabetesHistory" 
                  checked={formData.diabetesHistory}
                  onCheckedChange={(checked) => setFormData({...formData, diabetesHistory: checked as boolean})}
                />
                <Label htmlFor="diabetesHistory">Family history of diabetes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ibdHistory" 
                  checked={formData.ibdHistory}
                  onCheckedChange={(checked) => setFormData({...formData, ibdHistory: checked as boolean})}
                />
                <Label htmlFor="ibdHistory">History of inflammatory bowel disease (IBD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hepatitisHistory" 
                  checked={formData.hepatitisHistory}
                  onCheckedChange={(checked) => setFormData({...formData, hepatitisHistory: checked as boolean})}
                />
                <Label htmlFor="hepatitisHistory">History of hepatitis, pancreatitis, or jaundice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="anemiaHistory" 
                  checked={formData.anemiaHistory}
                  onCheckedChange={(checked) => setFormData({...formData, anemiaHistory: checked as boolean})}
                />
                <Label htmlFor="anemiaHistory">History of anemia or bleeding disorders</Label>
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Section */}
          <Card>
            <CardHeader>
              <CardTitle>3. Lifestyle & Habits</CardTitle>
              <CardDescription>Your daily patterns and behaviors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Smoking Frequency</Label>
                  <Select value={formData.smoking} onValueChange={(value) => setFormData({...formData, smoking: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                      <SelectItem value="regularly">Regularly</SelectItem>
                      <SelectItem value="chain">Chain Smoker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Alcohol Intake</Label>
                  <Select value={formData.alcohol} onValueChange={(value) => setFormData({...formData, alcohol: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="occasionally">Occasionally</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Sleep Duration</Label>
                  <Select value={formData.sleep} onValueChange={(value) => setFormData({...formData, sleep: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<5">&lt;5 hours</SelectItem>
                      <SelectItem value="5-7">5-7 hours</SelectItem>
                      <SelectItem value="7-9">7-9 hours</SelectItem>
                      <SelectItem value=">9">&gt;9 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Physical Activity</Label>
                  <Select value={formData.physicalActivity} onValueChange={(value) => setFormData({...formData, physicalActivity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="intense">Intense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Diet Pattern</Label>
                  <Select value={formData.diet} onValueChange={(value) => setFormData({...formData, diet: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stress Level</Label>
                  <Select value={formData.stress} onValueChange={(value) => setFormData({...formData, stress: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stress level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Symptoms Section */}
          <Card>
            <CardHeader>
              <CardTitle>4. Current Symptoms</CardTitle>
              <CardDescription>Check any symptoms you've experienced in the past 3 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">General Symptoms</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="fatigue" 
                        checked={formData.fatigue}
                        onCheckedChange={(checked) => setFormData({...formData, fatigue: checked as boolean})}
                      />
                      <Label htmlFor="fatigue">Persistent fatigue</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weightLoss" 
                        checked={formData.weightLoss}
                        onCheckedChange={(checked) => setFormData({...formData, weightLoss: checked as boolean})}
                      />
                      <Label htmlFor="weightLoss">Unexplained weight loss</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="jaundice" 
                        checked={formData.jaundice}
                        onCheckedChange={(checked) => setFormData({...formData, jaundice: checked as boolean})}
                      />
                      <Label htmlFor="jaundice">Jaundice (yellowing skin)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="paleSkin" 
                        checked={formData.paleSkin}
                        onCheckedChange={(checked) => setFormData({...formData, paleSkin: checked as boolean})}
                      />
                      <Label htmlFor="paleSkin">Pale or yellowish skin</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bruising" 
                        checked={formData.bruising}
                        onCheckedChange={(checked) => setFormData({...formData, bruising: checked as boolean})}
                      />
                      <Label htmlFor="bruising">Easy bruising or bleeding</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Pancreatic-Specific</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="abdominalPain" 
                        checked={formData.abdominalPain}
                        onCheckedChange={(checked) => setFormData({...formData, abdominalPain: checked as boolean})}
                      />
                      <Label htmlFor="abdominalPain">Upper abdominal pain</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="backPain" 
                        checked={formData.backPain}
                        onCheckedChange={(checked) => setFormData({...formData, backPain: checked as boolean})}
                      />
                      <Label htmlFor="backPain">Pain radiating to back</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="nausea" 
                        checked={formData.nausea}
                        onCheckedChange={(checked) => setFormData({...formData, nausea: checked as boolean})}
                      />
                      <Label htmlFor="nausea">Persistent nausea</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="newDiabetes" 
                        checked={formData.newDiabetes}
                        onCheckedChange={(checked) => setFormData({...formData, newDiabetes: checked as boolean})}
                      />
                      <Label htmlFor="newDiabetes">Newly developed diabetes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="floatingStool" 
                        checked={formData.floatingStool}
                        onCheckedChange={(checked) => setFormData({...formData, floatingStool: checked as boolean})}
                      />
                      <Label htmlFor="floatingStool">Floating, greasy stools</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Colon-Specific</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bloodInStool" 
                        checked={formData.bloodInStool}
                        onCheckedChange={(checked) => setFormData({...formData, bloodInStool: checked as boolean})}
                      />
                      <Label htmlFor="bloodInStool">Blood in stool</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="constipation" 
                        checked={formData.constipation}
                        onCheckedChange={(checked) => setFormData({...formData, constipation: checked as boolean})}
                      />
                      <Label htmlFor="constipation">Alternating constipation/diarrhea</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="narrowStool" 
                        checked={formData.narrowStool}
                        onCheckedChange={(checked) => setFormData({...formData, narrowStool: checked as boolean})}
                      />
                      <Label htmlFor="narrowStool">Narrow, pencil-thin stools</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bloating" 
                        checked={formData.bloating}
                        onCheckedChange={(checked) => setFormData({...formData, bloating: checked as boolean})}
                      />
                      <Label htmlFor="bloating">Persistent bloating</Label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Blood Cancer-Specific</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="infections" 
                        checked={formData.infections}
                        onCheckedChange={(checked) => setFormData({...formData, infections: checked as boolean})}
                      />
                      <Label htmlFor="infections">Recurring infections</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="nosebleeds" 
                        checked={formData.nosebleeds}
                        onCheckedChange={(checked) => setFormData({...formData, nosebleeds: checked as boolean})}
                      />
                      <Label htmlFor="nosebleeds">Frequent nosebleeds</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="bonePain" 
                        checked={formData.bonePain}
                        onCheckedChange={(checked) => setFormData({...formData, bonePain: checked as boolean})}
                      />
                      <Label htmlFor="bonePain">Bone or joint pain</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="swollenLymphNodes" 
                        checked={formData.swollenLymphNodes}
                        onCheckedChange={(checked) => setFormData({...formData, swollenLymphNodes: checked as boolean})}
                      />
                      <Label htmlFor="swollenLymphNodes">Swollen lymph nodes</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lab Data Section */}
          <Card>
            <CardHeader>
              <CardTitle>5. Lab Data (Optional)</CardTitle>
              <CardDescription>Enter recent blood test results if available</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hemoglobin">Hemoglobin (g/dL)</Label>
                  <Input 
                    id="hemoglobin" 
                    type="number" 
                    step="0.1"
                    value={formData.hemoglobin}
                    onChange={(e) => setFormData({...formData, hemoglobin: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="wbcCount">White Blood Cell Count</Label>
                  <Input 
                    id="wbcCount" 
                    type="number"
                    value={formData.wbcCount}
                    onChange={(e) => setFormData({...formData, wbcCount: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="plateletCount">Platelet Count</Label>
                  <Input 
                    id="plateletCount" 
                    type="number"
                    value={formData.plateletCount}
                    onChange={(e) => setFormData({...formData, plateletCount: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="bilirubin">Bilirubin (mg/dL)</Label>
                  <Input 
                    id="bilirubin" 
                    type="number" 
                    step="0.1"
                    value={formData.bilirubin}
                    onChange={(e) => setFormData({...formData, bilirubin: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="bloodSugar">Fasting Blood Sugar (mg/dL)</Label>
                  <Input 
                    id="bloodSugar" 
                    type="number"
                    value={formData.bloodSugar}
                    onChange={(e) => setFormData({...formData, bloodSugar: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consent Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="consent" 
                  checked={consentGiven}
                  onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                  required
                />
                <Label htmlFor="consent" className="text-sm leading-relaxed">
                  I understand that CANary is a research tool for educational purposes only and not a substitute 
                  for professional medical advice, diagnosis, or treatment. I acknowledge that all data is 
                  processed locally and privately on my device.
                </Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button 
              type="submit" 
              size="lg" 
              className="px-12"
              disabled={loading || !consentGiven}
            >
              {loading ? "Analyzing..." : "Run CANary Scan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartTest;
