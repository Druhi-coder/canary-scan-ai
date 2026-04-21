import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);

  // 🔍 FETCH REPORTS
  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReports(data);
    }
  };

  // 🔄 LOAD ON PAGE OPEN
  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* 🚀 ACTION */}
      <Button onClick={() => navigate("/start-test")}>
        Start New Analysis
      </Button>

      {/* 📊 REPORTS */}
      <div className="mt-6 space-y-3">
        <p className="text-lg font-semibold">Your Reports</p>

        {reports.length === 0 ? (
          <p className="text-gray-500">No reports yet</p>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="p-4 border rounded-lg shadow-sm">
              <p><strong>Input:</strong> {report.input_data?.text}</p>
              <p><strong>Result:</strong> {report.result}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
