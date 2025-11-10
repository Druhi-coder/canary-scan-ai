import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Target, Shield, Brain, Heart, Zap, Database } from "lucide-react";
import canaryLogo from "@/assets/canary-logo.png";

const About = () => {
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <img src={canaryLogo} alt="CANary Logo" className="h-24 w-24 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">About CANary</h1>
          <p className="text-xl text-muted-foreground">
            Empowering early cancer detection through accessible AI technology
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="mb-8 bg-accent border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              CANary was built to make early cancer detection accessible, private, and reliable — 
              empowering individuals through AI that works locally, not in the cloud. We believe 
              that advanced healthcare technology should be available to everyone, everywhere, 
              without compromising personal privacy.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Why CANary?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="AI-Powered Analysis"
              description="Advanced machine learning models analyze comprehensive health data to identify early cancer risk patterns across pancreatic, colon, and blood cancer."
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Privacy First"
              description="All processing happens locally on your device. Your health data never leaves your computer, ensuring complete privacy and security."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Offline Capable"
              description="Once loaded, CANary works completely offline. No internet connection required for assessments or viewing past reports."
            />
            <FeatureCard
              icon={<Database className="h-6 w-6" />}
              title="Research Backed"
              description="Built on evidence-based risk factors and medical research, providing interpretable results with clear explanations."
            />
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How CANary Works</CardTitle>
            <CardDescription>Understanding the assessment process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProcessStep
              number={1}
              title="Comprehensive Data Collection"
              description="You provide information about demographics, medical history, lifestyle habits, current symptoms, and optional lab results."
            />
            <ProcessStep
              number={2}
              title="AI Analysis"
              description="Our machine learning model processes your data, weighing multiple risk factors including age, family history, symptoms, and biomarkers."
            />
            <ProcessStep
              number={3}
              title="Risk Calculation"
              description="The system generates probability scores for each cancer type, identifying the most influential factors in your assessment."
            />
            <ProcessStep
              number={4}
              title="Interpretable Results"
              description="You receive clear risk categorizations (Low/Medium/High) with explanations of key contributing factors and recommendations."
            />
          </CardContent>
        </Card>

        {/* Important Disclaimers */}
        <Card className="mb-8 border-warning-yellow bg-warning-yellow-light">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold mb-1">Research Tool, Not Diagnostic Device</p>
              <p className="text-sm">
                CANary is designed for educational and research purposes. It is not a medical device 
                and cannot diagnose cancer. Always consult healthcare professionals for medical advice.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Seek Professional Medical Care</p>
              <p className="text-sm">
                If CANary indicates medium or high risk, or if you have concerning symptoms, please 
                schedule an appointment with a qualified healthcare provider for proper screening and evaluation.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Early Detection Saves Lives</p>
              <p className="text-sm">
                The goal of CANary is to encourage proactive health monitoring. Early detection 
                significantly improves treatment outcomes for all types of cancer.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="text-center">
          <CardContent className="pt-6">
            <p className="text-lg mb-2">
              <strong>Created by Druhi Sarupria</strong>
            </p>
            <p className="text-muted-foreground mb-4">Udaipur, Rajasthan</p>
            <p className="text-sm text-muted-foreground">
              A step toward accessible AI healthcare for everyone
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate("/start-test")} size="lg">
                Try CANary Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>Built with modern web technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-1">Frontend</p>
                <p className="text-muted-foreground">React, TypeScript, TailwindCSS</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Data Visualization</p>
                <p className="text-muted-foreground">Recharts, QR Code Generation</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Storage</p>
                <p className="text-muted-foreground">Local Browser Storage (SQLite-like)</p>
              </div>
              <div>
                <p className="font-semibold mb-1">AI Model</p>
                <p className="text-muted-foreground">Weighted Risk Scoring Algorithm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <div className="text-primary">{icon}</div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const ProcessStep = ({ 
  number, 
  title, 
  description 
}: { 
  number: number; 
  title: string; 
  description: string 
}) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
      {number}
    </div>
    <div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default About;
