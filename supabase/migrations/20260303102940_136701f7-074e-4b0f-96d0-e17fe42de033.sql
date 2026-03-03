
-- Add unique constraint on file_url for upsert support
ALTER TABLE public.optimization_audit ADD CONSTRAINT optimization_audit_file_url_key UNIQUE (file_url);
