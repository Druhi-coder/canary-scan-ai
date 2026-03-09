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
import { generatePrediction, PredictionInput } from "@/lib/predictionEngine";
import { saveReport } from "@/lib/storage";
import { saveAssessmentToDb } from "@/lib/assessmentStorage";
import { useToast } from "@/hooks/use-toast";
import { MedicalReportUpload } from "@/components/MedicalReportUpload";
import { BMIDisplay } from "@/components/BMIDisplay";
import { SymptomCheckbox } from "@/components/SymptomCheckbox";
import { HemoglobinInput, WBCInput, PlateletInput, BilirubinInput, BloodSugarInput } from "@/components/LabValueInput";
import { supabase } from "@/integrations/supabase/client";
import { isOnline, analyzeReportOffline } from "@/lib/offlineAI";

const StartTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedReport, setUploadedReport] = useState<{ text: string; fileName: string } | null>(null);

  // Form state with IEEE-ready structure
  const [formData, setFormData] = useState({
    // Demographics
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    bloodGroup: "",
    
    // Medical History
    familyCancerHistory: false,
    familyCancerType: "",
    diabetesHistory: false,
    ibdHistory: false,
    hepatitisHistory: false,
    anemiaHistory: false,
    autoimmune: false,
    noMedicalHistory: false,
    
    // Lifestyle
    smoking: "",
    alcohol: "",
    sleep: "",
    physicalActivity: "",
    diet: "",
    stress: "",
    
    // General Symptoms with duration
    fatigue: false,
    fatigueDuration: "",
    weightLoss: false,
    weightLossDuration: "",
    appetiteLoss: false,
    fever: false,
    dizziness: false,
    jaundice: false,
    jaundiceDuration: "",
    noGeneralSymptoms: false,
    
    // Pancreatic Specific
    abdominalPain: false,
    backPain: false,
    nausea: false,
    newDiabetes: false,
    itchySkin: false,
    floatingStool: false,
    noPancreaticSymptoms: false,
    
    // Colon Specific
    bloodInStool: false,
    bloodInStoolDuration: "",
    constipation: false,
    narrowStool: false,
    bloating: false,
    noColonSymptoms: false,
    
    // Blood Cancer Specific
    infections: false,
    infectionsDuration: "",
    nosebleeds: false,
    bonePain: false,
    swollenLymphNodes: false,
    shortBreath: false,
    paleSkin: false,
    bruising: false,
    noBloodSymptoms: false,
    
    // Lab Data (optional)
    hemoglobin: "",
    wbcCount: "",
    plateletCount: "",
    bilirubin: "",
    bloodSugar: "",
    
    // Tumor Markers (optional, v3.0)
    ca199: "",
    cea: "",
    ldh: "",
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = "Age is required";
    } else if (age < 0 || age > 120) {
      newErrors.age = "Age must be between 0 and 120";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }

    // Height validation (if provided)
    if (formData.height) {
      const height = parseFloat(formData.height);
      if (height < 50 || height > 300) {
        newErrors.height = "Height must be between 50 and 300 cm";
      }
    }

    // Weight validation (if provided)
    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (weight < 10 || weight > 500) {
        newErrors.weight = "Weight must be between 10 and 500 kg";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler for "None of the above" checkboxes
  const handleNoneOfAbove = (group: 'medical' | 'general' | 'pancreatic' | 'colon' | 'blood', checked: boolean) => {
    if (group === 'medical') {
      setFormData({
        ...formData,
        noMedicalHistory: checked,
        ...(checked && {
          familyCancerHistory: false,
          diabetesHistory: false,
          ibdHistory: false,
          hepatitisHistory: false,
          anemiaHistory: false,
          autoimmune: false,
        }),
      });
    } else if (group === 'general') {
      setFormData({
        ...formData,
        noGeneralSymptoms: checked,
        ...(checked && {
          fatigue: false,
          fatigueDuration: "",
          weightLoss: false,
          weightLossDuration: "",
          appetiteLoss: false,
          fever: false,
          dizziness: false,
          jaundice: false,
          jaundiceDuration: "",
        }),
      });
    } else if (group === 'pancreatic') {
      setFormData({
        ...formData,
        noPancreaticSymptoms: checked,
        ...(checked && {
          abdominalPain: false,
          backPain: false,
          nausea: false,
          newDiabetes: false,
          itchySkin: false,
          floatingStool: false,
        }),
      });
    } else if (group === 'colon') {
      setFormData({
        ...formData,
        noColonSymptoms: checked,
        ...(checked && {
          bloodInStool: false,
          bloodInStoolDuration: "",
          constipation: false,
          narrowStool: false,
          bloating: false,
        }),
      });
    } else if (group === 'blood') {
      setFormData({
        ...formData,
        noBloodSymptoms: checked,
        ...(checked && {
          infections: false,
          infectionsDuration: "",
          nosebleeds: false,
          bonePain: false,
          swollenLymphNodes: false,
          shortBreath: false,
          paleSkin: false,
          bruising: false,
        }),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fix the errors in the form.",
      });
      return;
    }

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

    // Prepare prediction input matching PredictionInput type from predictionEngine
    const predictionInput: PredictionInput = {
      age: parseInt(formData.age) || 30,
      gender: formData.gender || "other",
      bmi: isNaN(bmi) ? 25 : bmi,
      bloodGroup: formData.bloodGroup || "unknown",
      
      // Medical history
      familyCancerHistory: formData.familyCancerHistory,
      familyCancerType: formData.familyCancerType,
      diabetesHistory: formData.diabetesHistory,
      ibdHistory: formData.ibdHistory,
      hepatitisHistory: formData.hepatitisHistory,
      anemiaHistory: formData.anemiaHistory,
      noMedicalHistory: formData.noMedicalHistory,
      
      // Lifestyle
      smoking: formData.smoking || "never",
      alcohol: formData.alcohol || "never",
      sleep: formData.sleep || "7-9",
      physicalActivity: formData.physicalActivity || "moderate",
      diet: formData.diet || "mixed",
      stress: formData.stress || "moderate",
      
      // General symptoms with duration
      fatigue: formData.fatigue,
      fatigueDuration: formData.fatigueDuration,
      weightLoss: formData.weightLoss,
      weightLossDuration: formData.weightLossDuration,
      jaundice: formData.jaundice,
      jaundiceDuration: formData.jaundiceDuration,
      noGeneralSymptoms: formData.noGeneralSymptoms,
      
      // Pancreatic symptoms
      abdominalPain: formData.abdominalPain,
      backPain: formData.backPain,
      nausea: formData.nausea,
      newDiabetes: formData.newDiabetes,
      floatingStool: formData.floatingStool,
      noPancreaticSymptoms: formData.noPancreaticSymptoms,
      
      // Colon symptoms
      bloodInStool: formData.bloodInStool,
      bloodInStoolDuration: formData.bloodInStoolDuration,
      constipation: formData.constipation,
      narrowStool: formData.narrowStool,
      bloating: formData.bloating,
      noColonSymptoms: formData.noColonSymptoms,
      
      // Blood symptoms
      infections: formData.infections,
      infectionsDuration: formData.infectionsDuration,
      nosebleeds: formData.nosebleeds,
      bonePain: formData.bonePain,
      swollenLymphNodes: formData.swollenLymphNodes,
      paleSkin: formData.paleSkin,
      bruising: formData.bruising,
      noBloodSymptoms: formData.noBloodSymptoms,
      
      // Lab values
      hemoglobin: formData.hemoglobin ? parseFloat(formData.hemoglobin) : undefined,
      wbcCount: formData.wbcCount ? parseFloat(formData.wbcCount) : undefined,
      plateletCount: formData.plateletCount ? parseFloat(formData.plateletCount) : undefined,
      bilirubin: formData.bilirubin ? parseFloat(formData.bilirubin) : undefined,
      bloodSugar: formData.bloodSugar ? parseFloat(formData.bloodSugar) : undefined,
    };

    // Generate prediction using the new engine
    const prediction = generatePrediction(predictionInput);

    // Analyze medical report with AI if uploaded
    let aiAnalysis = null;
    if (uploadedReport) {
      try {
        const online = isOnline();
        
        if (online) {
          toast({
            title: "Analyzing Report",
            description: "AI is analyzing your medical report...",
          });

          const { data, error } = await supabase.functions.invoke("analyze-medical-report", {
            body: {
              reportText: uploadedReport.text,
              testResults: prediction,
            },
          });

          if (error) {
            console.error("AI analysis error:", error);
            aiAnalysis = await analyzeReportOffline(uploadedReport.text, formData);
            toast({
              title: "Using Offline Analysis",
              description: "Cloud AI unavailable, using offline analysis instead.",
            });
          } else {
            aiAnalysis = data.analysis;
          }
        } else {
          toast({
            title: "Analyzing Offline",
            description: "Using offline analysis...",
          });
          aiAnalysis = await analyzeReportOffline(uploadedReport.text, formData);
          toast({
            title: "Offline Analysis Complete",
            description: "Basic analysis completed. Connect to internet for detailed AI insights.",
          });
        }
      } catch (error) {
        console.error("Error analyzing report:", error);
        toast({
          variant: "destructive",
          title: "Analysis Warning",
          description: "Could not analyze medical report, but your test results are ready.",
        });
      }
    }

    // Save report with IEEE-ready structure
    const report = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      predictions: prediction,
      formData: formData,
      input: predictionInput,
      topFeatures: prediction.topFeatures,
      rankedFactors: prediction.rankedFactors,
      debugData: prediction.debugData,
      medicalReport: uploadedReport,
      aiAnalysis: aiAnalysis,
    };
    
    // Save locally for offline access
    saveReport(report);
    
    // Save to database for persistence
    try {
      await saveAssessmentToDb(report);
    } catch (dbError) {
      console.error("Failed to save to database:", dbError);
      // Local save succeeded, so we continue
    }
    
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
          {/* Section 1: Demographics */}
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
                    min="0"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className={errors.age ? 'border-destructive' : ''}
                  />
                  {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger className={errors.gender ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-destructive mt-1">{errors.gender}</p>}
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
                    min="50"
                    max="300"
                    value={formData.height}
                    onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className={errors.height ? 'border-destructive' : ''}
                  />
                  {errors.height && <p className="text-xs text-destructive mt-1">{errors.height}</p>}
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number"
                    min="10"
                    max="500"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className={errors.weight ? 'border-destructive' : ''}
                  />
                  {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight}</p>}
                </div>
                
                {/* BMI Display */}
                <BMIDisplay height={formData.height} weight={formData.weight} />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Medical History */}
          <Card>
            <CardHeader>
              <CardTitle>2. Medical & Family History</CardTitle>
              <CardDescription>Check all that apply to you or your immediate family</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="familyCancerHistory" 
                  checked={formData.familyCancerHistory}
                  disabled={formData.noMedicalHistory}
                  onCheckedChange={(checked) => setFormData({...formData, familyCancerHistory: checked as boolean, noMedicalHistory: false})}
                />
                <Label htmlFor="familyCancerHistory" className="cursor-pointer">Family history of cancer</Label>
              </div>
              {formData.familyCancerHistory && (
                <div className="ml-6">
                  <Select value={formData.familyCancerType} onValueChange={(value) => setFormData({...formData, familyCancerType: value})}>
                    <SelectTrigger className="w-64 h-8 text-sm">
                      <SelectValue placeholder="Specify cancer type (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pancreatic">Pancreatic</SelectItem>
                      <SelectItem value="colon">Colon/Colorectal</SelectItem>
                      <SelectItem value="blood">Blood (Leukemia/Lymphoma)</SelectItem>
                      <SelectItem value="breast">Breast</SelectItem>
                      <SelectItem value="lung">Lung</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="diabetesHistory" 
                  checked={formData.diabetesHistory}
                  disabled={formData.noMedicalHistory}
                  onCheckedChange={(checked) => setFormData({...formData, diabetesHistory: checked as boolean, noMedicalHistory: false})}
                />
                <Label htmlFor="diabetesHistory" className="cursor-pointer">Family history of diabetes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ibdHistory" 
                  checked={formData.ibdHistory}
                  disabled={formData.noMedicalHistory}
                  onCheckedChange={(checked) => setFormData({...formData, ibdHistory: checked as boolean, noMedicalHistory: false})}
                />
                <Label htmlFor="ibdHistory" className="cursor-pointer">History of inflammatory bowel disease (IBD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hepatitisHistory" 
                  checked={formData.hepatitisHistory}
                  disabled={formData.noMedicalHistory}
                  onCheckedChange={(checked) => setFormData({...formData, hepatitisHistory: checked as boolean, noMedicalHistory: false})}
                />
                <Label htmlFor="hepatitisHistory" className="cursor-pointer">History of hepatitis, pancreatitis, or jaundice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="anemiaHistory" 
                  checked={formData.anemiaHistory}
                  disabled={formData.noMedicalHistory}
                  onCheckedChange={(checked) => setFormData({...formData, anemiaHistory: checked as boolean, noMedicalHistory: false})}
                />
                <Label htmlFor="anemiaHistory" className="cursor-pointer">History of anemia or bleeding disorders</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoimmune" 
                  checked={formData.autoimmune}
                  disabled={formData.noMedicalHistory}
                  onCheckedChange={(checked) => setFormData({...formData, autoimmune: checked as boolean, noMedicalHistory: false})}
                />
                <Label htmlFor="autoimmune" className="cursor-pointer">Autoimmune disorders</Label>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="noMedicalHistory" 
                    checked={formData.noMedicalHistory}
                    onCheckedChange={(checked) => handleNoneOfAbove('medical', checked as boolean)}
                  />
                  <Label htmlFor="noMedicalHistory" className="cursor-pointer text-muted-foreground">None of the above</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Lifestyle */}
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
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                      <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
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

          {/* Section 4: Symptoms */}
          <Card>
            <CardHeader>
              <CardTitle>4. Current Symptoms</CardTitle>
              <CardDescription>Check any symptoms you've experienced in the past 3 months. For major symptoms, please indicate duration.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* General Symptoms */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">General Symptoms</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <SymptomCheckbox
                      id="fatigue"
                      label="Persistent fatigue (>2 weeks)"
                      checked={formData.fatigue}
                      onCheckedChange={(checked) => setFormData({...formData, fatigue: checked, noGeneralSymptoms: false})}
                      showDuration
                      duration={formData.fatigueDuration}
                      onDurationChange={(d) => setFormData({...formData, fatigueDuration: d})}
                    />
                    <SymptomCheckbox
                      id="weightLoss"
                      label="Unexplained weight loss (>5% in 3 months)"
                      checked={formData.weightLoss}
                      onCheckedChange={(checked) => setFormData({...formData, weightLoss: checked, noGeneralSymptoms: false})}
                      showDuration
                      duration={formData.weightLossDuration}
                      onDurationChange={(d) => setFormData({...formData, weightLossDuration: d})}
                    />
                    <SymptomCheckbox
                      id="jaundice"
                      label="Jaundice (yellowing skin/eyes)"
                      checked={formData.jaundice}
                      onCheckedChange={(checked) => setFormData({...formData, jaundice: checked, noGeneralSymptoms: false})}
                      showDuration
                      duration={formData.jaundiceDuration}
                      onDurationChange={(d) => setFormData({...formData, jaundiceDuration: d})}
                    />
                    <SymptomCheckbox
                      id="appetiteLoss"
                      label="Loss of appetite"
                      checked={formData.appetiteLoss}
                      onCheckedChange={(checked) => setFormData({...formData, appetiteLoss: checked, noGeneralSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="fever"
                      label="Recurring low-grade fever"
                      checked={formData.fever}
                      onCheckedChange={(checked) => setFormData({...formData, fever: checked, noGeneralSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="dizziness"
                      label="Dizziness or lightheadedness"
                      checked={formData.dizziness}
                      onCheckedChange={(checked) => setFormData({...formData, dizziness: checked, noGeneralSymptoms: false})}
                    />
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <SymptomCheckbox
                      id="noGeneralSymptoms"
                      label="None of the above"
                      checked={formData.noGeneralSymptoms}
                      onCheckedChange={(checked) => handleNoneOfAbove('general', checked)}
                    />
                  </div>
                </div>

                {/* Pancreatic-Specific */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Pancreatic-Related</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <SymptomCheckbox
                      id="abdominalPain"
                      label="Upper abdominal pain"
                      checked={formData.abdominalPain}
                      onCheckedChange={(checked) => setFormData({...formData, abdominalPain: checked, noPancreaticSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="backPain"
                      label="Pain radiating to back"
                      checked={formData.backPain}
                      onCheckedChange={(checked) => setFormData({...formData, backPain: checked, noPancreaticSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="nausea"
                      label="Persistent nausea"
                      checked={formData.nausea}
                      onCheckedChange={(checked) => setFormData({...formData, nausea: checked, noPancreaticSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="newDiabetes"
                      label="Newly developed diabetes"
                      checked={formData.newDiabetes}
                      onCheckedChange={(checked) => setFormData({...formData, newDiabetes: checked, noPancreaticSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="itchySkin"
                      label="Itchy skin"
                      checked={formData.itchySkin}
                      onCheckedChange={(checked) => setFormData({...formData, itchySkin: checked, noPancreaticSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="floatingStool"
                      label="Floating, greasy stools"
                      checked={formData.floatingStool}
                      onCheckedChange={(checked) => setFormData({...formData, floatingStool: checked, noPancreaticSymptoms: false})}
                    />
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <SymptomCheckbox
                      id="noPancreaticSymptoms"
                      label="None of the above"
                      checked={formData.noPancreaticSymptoms}
                      onCheckedChange={(checked) => handleNoneOfAbove('pancreatic', checked)}
                    />
                  </div>
                </div>

                {/* Colon-Specific */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Colon-Related</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <SymptomCheckbox
                      id="bloodInStool"
                      label="Blood in stool"
                      checked={formData.bloodInStool}
                      onCheckedChange={(checked) => setFormData({...formData, bloodInStool: checked, noColonSymptoms: false})}
                      showDuration
                      duration={formData.bloodInStoolDuration}
                      onDurationChange={(d) => setFormData({...formData, bloodInStoolDuration: d})}
                    />
                    <SymptomCheckbox
                      id="constipation"
                      label="Alternating constipation/diarrhea"
                      checked={formData.constipation}
                      onCheckedChange={(checked) => setFormData({...formData, constipation: checked, noColonSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="narrowStool"
                      label="Narrow, pencil-thin stools"
                      checked={formData.narrowStool}
                      onCheckedChange={(checked) => setFormData({...formData, narrowStool: checked, noColonSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="bloating"
                      label="Persistent bloating"
                      checked={formData.bloating}
                      onCheckedChange={(checked) => setFormData({...formData, bloating: checked, noColonSymptoms: false})}
                    />
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <SymptomCheckbox
                      id="noColonSymptoms"
                      label="None of the above"
                      checked={formData.noColonSymptoms}
                      onCheckedChange={(checked) => handleNoneOfAbove('colon', checked)}
                    />
                  </div>
                </div>

                {/* Blood Cancer-Specific */}
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Blood Cancer-Related</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <SymptomCheckbox
                      id="infections"
                      label="Recurring infections"
                      checked={formData.infections}
                      onCheckedChange={(checked) => setFormData({...formData, infections: checked, noBloodSymptoms: false})}
                      showDuration
                      duration={formData.infectionsDuration}
                      onDurationChange={(d) => setFormData({...formData, infectionsDuration: d})}
                    />
                    <SymptomCheckbox
                      id="nosebleeds"
                      label="Frequent nosebleeds"
                      checked={formData.nosebleeds}
                      onCheckedChange={(checked) => setFormData({...formData, nosebleeds: checked, noBloodSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="bonePain"
                      label="Bone or joint pain"
                      checked={formData.bonePain}
                      onCheckedChange={(checked) => setFormData({...formData, bonePain: checked, noBloodSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="swollenLymphNodes"
                      label="Swollen lymph nodes"
                      checked={formData.swollenLymphNodes}
                      onCheckedChange={(checked) => setFormData({...formData, swollenLymphNodes: checked, noBloodSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="shortBreath"
                      label="Shortness of breath"
                      checked={formData.shortBreath}
                      onCheckedChange={(checked) => setFormData({...formData, shortBreath: checked, noBloodSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="paleSkin"
                      label="Pale or yellowish skin"
                      checked={formData.paleSkin}
                      onCheckedChange={(checked) => setFormData({...formData, paleSkin: checked, noBloodSymptoms: false})}
                    />
                    <SymptomCheckbox
                      id="bruising"
                      label="Easy bruising or bleeding"
                      checked={formData.bruising}
                      onCheckedChange={(checked) => setFormData({...formData, bruising: checked, noBloodSymptoms: false})}
                    />
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <SymptomCheckbox
                      id="noBloodSymptoms"
                      label="None of the above"
                      checked={formData.noBloodSymptoms}
                      onCheckedChange={(checked) => handleNoneOfAbove('blood', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Lab Data */}
          <Card>
            <CardHeader>
              <CardTitle>5. Lab Data (Optional)</CardTitle>
              <CardDescription>Enter recent blood test results if available. Values outside normal ranges will be highlighted.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <HemoglobinInput
                  value={formData.hemoglobin}
                  onChange={(v) => setFormData({...formData, hemoglobin: v})}
                />
                <WBCInput
                  value={formData.wbcCount}
                  onChange={(v) => setFormData({...formData, wbcCount: v})}
                />
                <PlateletInput
                  value={formData.plateletCount}
                  onChange={(v) => setFormData({...formData, plateletCount: v})}
                />
                <BilirubinInput
                  value={formData.bilirubin}
                  onChange={(v) => setFormData({...formData, bilirubin: v})}
                />
                <BloodSugarInput
                  value={formData.bloodSugar}
                  onChange={(v) => setFormData({...formData, bloodSugar: v})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 6: Medical Report Upload */}
          <MedicalReportUpload
            onReportUploaded={(text, fileName) => setUploadedReport({ text, fileName })}
            uploadedReport={uploadedReport}
            onRemoveReport={() => setUploadedReport(null)}
          />

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
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
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
