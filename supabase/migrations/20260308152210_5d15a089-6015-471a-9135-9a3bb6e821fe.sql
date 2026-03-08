
-- API Keys table
CREATE TABLE public.developer_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name text NOT NULL DEFAULT 'Default Key',
  api_key text NOT NULL UNIQUE,
  key_prefix text NOT NULL,
  permissions text[] NOT NULL DEFAULT ARRAY['read'],
  is_active boolean NOT NULL DEFAULT true,
  rate_limit_per_minute integer NOT NULL DEFAULT 60,
  total_requests bigint NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- API Usage Logs
CREATE TABLE public.api_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid NOT NULL REFERENCES public.developer_api_keys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL DEFAULT 'GET',
  status_code integer NOT NULL DEFAULT 200,
  response_time_ms integer,
  request_body jsonb,
  response_size_bytes integer,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Webhooks table
CREATE TABLE public.developer_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT ARRAY['*'],
  secret text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_api_keys_user ON public.developer_api_keys(user_id);
CREATE INDEX idx_api_keys_key ON public.developer_api_keys(api_key);
CREATE INDEX idx_api_usage_key ON public.api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_user ON public.api_usage_logs(user_id);
CREATE INDEX idx_api_usage_created ON public.api_usage_logs(created_at);
CREATE INDEX idx_webhooks_user ON public.developer_webhooks(user_id);

-- RLS
ALTER TABLE public.developer_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_webhooks ENABLE ROW LEVEL SECURITY;

-- Users can manage their own API keys
CREATE POLICY "Users manage own api keys" ON public.developer_api_keys
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Users can view their own usage logs
CREATE POLICY "Users view own usage logs" ON public.api_usage_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Users can manage their own webhooks
CREATE POLICY "Users manage own webhooks" ON public.developer_webhooks
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Function to generate API key
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_key text;
BEGIN
  new_key := 'nxk_' || encode(gen_random_bytes(32), 'base64url');
  RETURN new_key;
END;
$$;

-- Function to validate API key and return user info
CREATE OR REPLACE FUNCTION public.validate_api_key(p_api_key text)
RETURNS TABLE(key_id uuid, key_user_id uuid, permissions text[], rate_limit integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT dk.id, dk.user_id, dk.permissions, dk.rate_limit_per_minute
  FROM public.developer_api_keys dk
  WHERE dk.api_key = p_api_key
    AND dk.is_active = true
    AND (dk.expires_at IS NULL OR dk.expires_at > now());
    
  -- Update last used
  UPDATE public.developer_api_keys
  SET last_used_at = now(), total_requests = total_requests + 1
  WHERE api_key = p_api_key;
END;
$$;
