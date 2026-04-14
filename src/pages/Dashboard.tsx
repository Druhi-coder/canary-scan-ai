import { useState, useEffect } from "react"; // ✅ FIXED
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  const handleAnalyze = async () => {
    if (!input) return;

    setLoading(true);

    try {
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
        fetchReports(); // ✅ IMPORTANT
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReports(data);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

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

      {/* ✅ SHOW REPORTS */}
      <div className="mt-6 space-y-3">
        {reports.map((report) => (
          <div key={report.id} className="p-3 border rounded">
            <p><strong>Input:</strong> {report.input_data?.text}</p>
            <p><strong>Result:</strong> {report.result}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
