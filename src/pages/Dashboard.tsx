import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!input) return;

    setLoading(true);

    try {
      // 🧠 Fake AI result (we upgrade later)
      const result = `Analysis result for: ${input}`;

      const { error } = await supabase.from("reports").insert([
        {
          user_id: user?.id,
          input_data: { text: input },
          result: result,
        },
      ]);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Report generated!");
        setInput("");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <Input
        placeholder="Enter patient data..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <Button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </Button>
    </div>
  );
};

export default Dashboard;
