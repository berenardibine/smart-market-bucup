-- Create file optimization logs table
CREATE TABLE public.file_optimization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  original_url TEXT NOT NULL,
  optimized_url TEXT NOT NULL,
  original_size BIGINT NOT NULL DEFAULT 0,
  optimized_size BIGINT NOT NULL DEFAULT 0,
  compression_ratio INTEGER NOT NULL DEFAULT 0,
  was_enhanced BOOLEAN DEFAULT false,
  target_type TEXT DEFAULT 'product_card',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create batch optimization jobs table
CREATE TABLE public.batch_optimization_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  files_processed INTEGER DEFAULT 0,
  files_failed INTEGER DEFAULT 0,
  files_skipped INTEGER DEFAULT 0,
  original_size_total BIGINT DEFAULT 0,
  optimized_size_total BIGINT DEFAULT 0,
  space_saved BIGINT DEFAULT 0,
  compression_ratio INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for analytics
CREATE INDEX idx_file_optimization_logs_created_at ON public.file_optimization_logs(created_at);
CREATE INDEX idx_file_optimization_logs_user_id ON public.file_optimization_logs(user_id);
CREATE INDEX idx_batch_optimization_jobs_created_at ON public.batch_optimization_jobs(created_at);

-- Enable RLS
ALTER TABLE public.file_optimization_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_optimization_jobs ENABLE ROW LEVEL SECURITY;

-- Allow admins to read optimization logs
CREATE POLICY "Admins can view optimization logs" 
ON public.file_optimization_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can view batch jobs" 
ON public.batch_optimization_jobs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Allow edge functions / service role to insert
CREATE POLICY "Allow insert for optimization logs" 
ON public.file_optimization_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow insert for batch jobs" 
ON public.batch_optimization_jobs 
FOR INSERT 
WITH CHECK (true);