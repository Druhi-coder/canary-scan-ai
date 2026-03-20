
-- Datasets table for uploaded/imported medical datasets
CREATE TABLE public.datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  source text NOT NULL DEFAULT 'upload',
  description text,
  row_count integer DEFAULT 0,
  column_count integer DEFAULT 0,
  schema_info jsonb,
  sample_data jsonb,
  status text NOT NULL DEFAULT 'uploaded',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own datasets" ON public.datasets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own datasets" ON public.datasets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own datasets" ON public.datasets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own datasets" ON public.datasets FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Experiments table for ML training runs
CREATE TABLE public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dataset_id uuid REFERENCES public.datasets(id) ON DELETE CASCADE,
  name text NOT NULL,
  model_type text NOT NULL,
  hyperparameters jsonb DEFAULT '{}'::jsonb,
  metrics jsonb,
  confusion_matrix jsonb,
  roc_data jsonb,
  feature_importance jsonb,
  shap_values jsonb,
  model_version text,
  status text NOT NULL DEFAULT 'pending',
  training_duration_ms integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own experiments" ON public.experiments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own experiments" ON public.experiments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experiments" ON public.experiments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experiments" ON public.experiments FOR DELETE TO authenticated USING (auth.uid() = user_id);
