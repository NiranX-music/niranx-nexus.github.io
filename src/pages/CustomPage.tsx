import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!slug) {
        navigate('/404');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_custom_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (error || !data) {
          setError('Page not found');
          return;
        }

        // Build full HTML content
        let html = data.html_content;

        // Inject CSS if present
        if (data.css_content) {
          html = html.replace('</head>', `<style>${data.css_content}</style></head>`);
        }

        // Inject JS if present
        if (data.js_content) {
          html = html.replace('</body>', `<script>${data.js_content}</script></body>`);
        }

        // Update meta description if present
        if (data.meta_description) {
          if (html.includes('<meta name="description"')) {
            html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${data.meta_description}">`);
          } else {
            html = html.replace('</head>', `<meta name="description" content="${data.meta_description}"></head>`);
          }
        }

        setContent(html);
      } catch (err) {
        console.error('Error loading custom page:', err);
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="text-primary hover:underline"
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={content || ''}
      className="w-full min-h-screen border-0"
      title="Custom Page"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}
