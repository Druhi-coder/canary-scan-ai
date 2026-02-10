
-- Create assessments table to store user test results
CREATE TABLE public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  predictions JSONB NOT NULL,
  ranked_factors JSONB,
  debug_data JSONB,
  input_summary JSONB,
  form_data JSONB,
  top_features JSONB,
  ai_analysis TEXT,
  medical_report JSONB
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Users can only view their own assessments
CREATE POLICY "Users can view own assessments"
  ON public.assessments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own assessments
CREATE POLICY "Users can insert own assessments"
  ON public.assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own assessments
CREATE POLICY "Users can update own assessments"
  ON public.assessments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own assessments
CREATE POLICY "Users can delete own assessments"
  ON public.assessments FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast user lookups
CREATE INDEX idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX idx_assessments_created_at ON public.assessments(created_at DESC);
