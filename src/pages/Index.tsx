import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Activity, Shield, Brain, TrendingUp, LogOut } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary">CANary</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <Button variant="ghost" onClick={() => navigate("/about")}>About</Button>
            <Button variant="ghost" onClick={() => navigate("/research-mode")}>Research</Button>
            <Button variant="ghost" onClick={() => navigate("/research-dashboard")}>ML Dashboard</Button>
            <Button variant="ghost" onClick={() => navigate("/my-reports")}>My Reports</Button>
            {user ? (
              <Button variant="outline" onClick={signOut} className="gap-2">
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            ) : (
             <Button variant="default" onClick={() => navigate("/auth")}>Get Started</Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `url(${heroBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Detecting Cancer Before It Begins
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              AI-powered early detection for pancreatic, colon, and blood cancer. 
              Privacy-first. Offline-capable. Research-backed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/start-test")}
              >
                Start CANary Scan
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => navigate("/my-reports")}
              >
                View My Reports
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Why CANary?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI-Powered"
              description="Advanced machine learning models trained on comprehensive cancer indicators"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Privacy First"
              description="Your data is encrypted and securely stored. Only you can access your reports."
            />
            <FeatureCard
              icon={<Activity className="h-8 w-8" />}
              title="Multi-Cancer Detection"
              description="Screens for pancreatic, colon, and blood cancer simultaneously"
            />
            <FeatureCard
              icon={<TrendingUp className="h-8 w-8" />}
              title="Early Detection"
              description="Identifies risk factors before symptoms become critical"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-accent">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Take Control?</h3>
          <p className="text-xl text-muted-foreground mb-8">
            Start your CANary scan today and get personalized insights in minutes
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/start-test")}
          >
            Begin Assessment
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="mb-2">
            <strong>Disclaimer:</strong> CANary is a research tool for educational purposes. 
            Not a substitute for professional medical diagnosis.
          </p>
          <p>
            Developed by <span className="text-primary font-semibold">Druhi Sarupria</span> | 
            A step toward accessible AI healthcare
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 rounded-lg border border-border bg-background shadow-sm hover:shadow-md transition-shadow">
    <div className="text-primary mb-4">{icon}</div>
    <h4 className="text-xl font-semibold mb-2">{title}</h4>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
