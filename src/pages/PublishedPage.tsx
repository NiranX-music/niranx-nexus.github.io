import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";

export default function PublishedPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!slug) return;
    loadPage();
  }, [slug]);

  useEffect(() => {
    if (page && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;
      const sanitizedHtml = DOMPurify.sanitize(page.html_content, { ADD_TAGS: ["style", "script"], ADD_ATTR: ["onclick"] });
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:system-ui,sans-serif;}${page.css_content || ""}</style></head><body>${sanitizedHtml}<script>${page.js_content || ""}<\/script></body></html>`);
      doc.close();
    }
  }, [page]);

  const loadPage = async () => {
    const { data, error: err } = await supabase
      .from("admin_custom_pages")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (err || !data) {
      setError("Page not found or not published.");
    } else {
      setPage(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">404</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-screen border-0"
      sandbox="allow-scripts allow-same-origin"
      title={page?.title || "Published Page"}
    />
  );
}
