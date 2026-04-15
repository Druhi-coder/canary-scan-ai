import { useState, useEffect } from "react";
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

  // 🔍 FETCH REPORTS (WITH DEBUG)
  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("FETCH DATA:", data);
    console.log("FETCH ERROR:", error);
    console.log("USER:", user);

    if (!error && data) {
      setReports(data);
    }
  };

  // 🧠 ANALYZE + INSERT
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
        console.error("INSERT ERROR:", error);
        toast.error(error.message);
      } else {
        toast.success("Report generated!");
        setInput("");
        fetchReports(); // 🔥 refresh data
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // 🔄 LOAD ON PAGE OPEN
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

      {/* 🔍 DEBUG INFO */}
      <p>Total reports: {reports.length}</p>

      {/* ✅ DISPLAY REPORTS */}
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
