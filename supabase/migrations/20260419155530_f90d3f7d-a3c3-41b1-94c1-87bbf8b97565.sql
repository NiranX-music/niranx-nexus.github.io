
-- NiranX Core AI: dedicated tables for AI API platform
CREATE TABLE IF NOT EXISTS public.niranx_core_ai_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  key_name TEXT NOT NULL DEFAULT 'NiranX Core AI Key',
  api_key TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  monthly_quota INTEGER NOT NULL DEFAULT 1000,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 30,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_niranx_core_ai_keys_user ON public.niranx_core_ai_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_niranx_core_ai_keys_apikey ON public.niranx_core_ai_keys(api_key);

ALTER TABLE public.niranx_core_ai_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own AI keys" ON public.niranx_core_ai_keys
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all AI keys" ON public.niranx_core_ai_keys
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- AI request logs
CREATE TABLE IF NOT EXISTS public.niranx_core_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES public.niranx_core_ai_keys(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  model TEXT,
  request_type TEXT NOT NULL DEFAULT 'chat',
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  response_time_ms INTEGER,
  status_code INTEGER NOT NULL,
  error_message TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_niranx_core_ai_logs_user ON public.niranx_core_ai_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_niranx_core_ai_logs_key ON public.niranx_core_ai_logs(api_key_id, created_at DESC);

ALTER TABLE public.niranx_core_ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own AI logs" ON public.niranx_core_ai_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role inserts AI logs" ON public.niranx_core_ai_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins view all AI logs" ON public.niranx_core_ai_logs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Validate AI API key (security definer)
CREATE OR REPLACE FUNCTION public.validate_niranx_core_ai_key(p_api_key TEXT)
RETURNS TABLE(key_id UUID, key_user_id UUID, rate_limit INTEGER, monthly_quota INTEGER, current_month_requests BIGINT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.id,
    k.user_id,
    k.rate_limit_per_minute,
    k.monthly_quota,
    (SELECT COUNT(*) FROM public.niranx_core_ai_logs 
      WHERE api_key_id = k.id 
      AND created_at >= date_trunc('month', now()))
  FROM public.niranx_core_ai_keys k
  WHERE k.api_key = p_api_key
    AND k.is_active = true
    AND (k.expires_at IS NULL OR k.expires_at > now());
  
  UPDATE public.niranx_core_ai_keys
  SET last_used_at = now(), total_requests = total_requests + 1
  WHERE api_key = p_api_key;
END;
$$;

-- Updated_at trigger
CREATE TRIGGER set_niranx_core_ai_keys_updated_at
  BEFORE UPDATE ON public.niranx_core_ai_keys
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
