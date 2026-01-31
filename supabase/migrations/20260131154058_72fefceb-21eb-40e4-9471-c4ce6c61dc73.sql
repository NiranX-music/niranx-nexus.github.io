-- Create admin custom pages table for admin-created pages
CREATE TABLE public.admin_custom_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  html_content TEXT NOT NULL,
  css_content TEXT,
  js_content TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_custom_pages ENABLE ROW LEVEL SECURITY;

-- Public can view published pages
CREATE POLICY "Anyone can view published custom pages"
  ON public.admin_custom_pages FOR SELECT
  USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage custom pages"
  ON public.admin_custom_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create API keys registry table (for display purposes, not storing actual keys)
CREATE TABLE public.admin_api_keys_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_configured BOOLEAN DEFAULT false,
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_api_keys_registry ENABLE ROW LEVEL SECURITY;

-- Admins can view and manage API keys registry
CREATE POLICY "Admins can view API keys registry"
  ON public.admin_api_keys_registry FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage API keys registry"
  ON public.admin_api_keys_registry FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Insert default API keys that the app uses
INSERT INTO public.admin_api_keys_registry (key_name, display_name, description, is_configured) VALUES
('BYTEZ_API_KEY', 'Bytez AI API', 'API key for XNexus AI open-source models', true),
('GROQ_API_KEY', 'Groq API', 'API key for Groq AI chat', true),
('DEEPSEEK_API_KEY', 'DeepSeek API', 'API key for DeepSeek chat', true),
('OPENAI_API_KEY', 'OpenAI API', 'API key for OpenAI models', true),
('LOVABLE_API_KEY', 'Lovable AI API', 'API key for Lovable AI gateway', true),
('GOOGLE_CLIENT_ID', 'Google OAuth Client ID', 'Google OAuth client ID for authentication', true),
('GOOGLE_CLIENT_SECRET', 'Google OAuth Secret', 'Google OAuth client secret', true),
('SPOTIFY_CLIENT_ID', 'Spotify Client ID', 'Spotify API client ID for music integration', true),
('SPOTIFY_CLIENT_SECRET', 'Spotify Client Secret', 'Spotify API client secret', true),
('ELEVENLABS_API_KEY', 'ElevenLabs API', 'API key for voice generation', true),
('PERPLEXITY_API_KEY', 'Perplexity API', 'API key for Perplexity search AI', true),
('RESEND_API_KEY', 'Resend API', 'API key for email sending', true),
('AGORA_APP_ID', 'Agora App ID', 'Agora real-time communication app ID', true),
('AGORA_APP_CERTIFICATE', 'Agora Certificate', 'Agora app certificate', true),
('BACKBLAZE_KEY_ID', 'Backblaze Key ID', 'Backblaze B2 storage key ID', true),
('BACKBLAZE_APPLICATION_KEY', 'Backblaze App Key', 'Backblaze B2 application key', true),
('SONAUTO_API_KEY', 'Sonauto API', 'API key for Sonauto music generation', true),
('OPENROUTER_API_KEY', 'OpenRouter API', 'API key for OpenRouter AI models', true),
('FLUXAPI_API_KEY', 'FluxAPI', 'API key for Flux image generation', true),
('AIML_API_KEY', 'AI/ML API', 'API key for AI/ML services', true),
('RAPIDAPI_KEY', 'RapidAPI Key', 'API key for RapidAPI services', true),
('PRESENTON_API_KEY', 'Presenton API', 'API key for presentation generation', true),
('GOOGLE_SEARCH_API_KEY', 'Google Search API', 'API key for Google Custom Search', false),
('GOOGLE_SEARCH_CX', 'Google Search CX', 'Google Custom Search Engine ID', false);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_custom_pages_updated_at
  BEFORE UPDATE ON public.admin_custom_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();