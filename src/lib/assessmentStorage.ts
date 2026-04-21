import { supabase } from "@/integrations/supabase/client";
import { TestResult } from "./storage";

export const saveAssessmentToDb = async (report: TestResult): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("assessments").insert({
    user_id: user.id,
    predictions: report.predictions as any,
    ranked_factors: report.rankedFactors as any,
    debug_data: report.debugData as any,
    input_summary: report.inputSummary as any,
    form_data: report.formData as any,
    top_features: report.topFeatures as any,
    ai_analysis: report.aiAnalysis || null,
    medical_report: report.medicalReport as any,
  });

  if (error) throw error;
};

export const getAssessmentsFromDb = async (): Promise<TestResult[]> => {
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: row.id,
    date: row.created_at,
    predictions: row.predictions,
    rankedFactors: row.ranked_factors,
    debugData: row.debug_data,
    inputSummary: row.input_summary,
    formData: row.form_data,
    topFeatures: row.top_features,
    aiAnalysis: row.ai_analysis,
    medicalReport: row.medical_report,
  }));
};

export const deleteAssessmentFromDb = async (id: string): Promise<void> => {
  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) throw error;
};
