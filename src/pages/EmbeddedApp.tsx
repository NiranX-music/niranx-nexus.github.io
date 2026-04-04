import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ExternalLink, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/layout/AppLayout';

interface LauncherApp {
  id: string;
  name: string;
  icon: string;
  url: string;
  description: string | null;
  color: string | null;
}

export default function EmbeddedApp() {
  const { appId } = useParams();
  const location = useLocation();
  const [app, setApp] = useState<LauncherApp | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Extract sub-path after /apps/:appId/
  const subPath = location.pathname.replace(`/apps/${appId}`, '') || '/';

  useEffect(() => {
    const load = async () => {
      if (!appId) return;
      const { data } = await supabase
        .from('niranx_launcher_apps')
        .select('*')
        .eq('id', appId)
        .single();
      if (data) setApp(data as LauncherApp);
      setLoading(false);
    };
    load();
  }, [appId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen bg-background">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    );
  }

  if (!app) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
          <p className="text-muted-foreground">App not found</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Build the proxied URL
  const buildProxyUrl = () => {
    if (!app.url.startsWith('http')) {
      // Internal route - just navigate there
      return null;
    }
    const targetUrl = subPath !== '/' 
      ? `${app.url.replace(/\/$/, '')}${subPath}`
      : app.url;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://tophenwypevlfbznlwil.supabase.co`;
    return `${supabaseUrl}/functions/v1/proxy-app?url=${encodeURIComponent(targetUrl)}`;
  };

  const proxyUrl = buildProxyUrl();

  // If it's an internal route, redirect
  if (!proxyUrl) {
    window.location.href = app.url;
    return null;
  }

  const content = (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-[9999]' : 'h-[calc(100vh-64px)]'} bg-background`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur border-b border-border/50">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground truncate">{app.name}</h2>
            {app.description && (
              <span className="text-xs text-muted-foreground hidden sm:inline">— {app.description}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setIframeKey(k => k + 1)} title="Refresh">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.open(app.url, '_blank')} title="Open externally">
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle fullscreen">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Iframe */}
      <iframe
        key={iframeKey}
        src={proxyUrl}
        className="flex-1 w-full border-0"
        title={app.name}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );

  if (isFullscreen) return content;

  return <AppLayout>{content}</AppLayout>;
}
