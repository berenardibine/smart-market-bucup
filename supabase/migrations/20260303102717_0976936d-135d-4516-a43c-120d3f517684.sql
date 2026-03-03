
-- Optimization audit table to track file optimization status
CREATE TABLE public.optimization_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  original_size BIGINT NOT NULL DEFAULT 0,
  current_size BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('optimized', 'not_optimized', 'pending', 'error')),
  auto_fixed BOOLEAN DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fixed_at TIMESTAMPTZ
);

ALTER TABLE public.optimization_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access optimization_audit"
  ON public.optimization_audit FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public read optimization_audit"
  ON public.optimization_audit FOR SELECT
  USING (true);

-- Optimization errors table for tracking failures
CREATE TABLE public.optimization_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_url TEXT,
  error_message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.optimization_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access optimization_errors"
  ON public.optimization_errors FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- System logs table for cron job history
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access system_logs"
  ON public.system_logs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for faster lookups
CREATE INDEX idx_optimization_audit_status ON public.optimization_audit(status);
CREATE INDEX idx_optimization_errors_resolved ON public.optimization_errors(resolved);
CREATE INDEX idx_system_logs_job_type ON public.system_logs(job_type);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
