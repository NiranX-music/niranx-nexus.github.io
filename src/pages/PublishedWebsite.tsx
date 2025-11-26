import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function PublishedWebsite() {
  const { slug } = useParams();

  const { data: website, isLoading, error } = useQuery({
    queryKey: ["published-website", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("generated_websites")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading website...</p>
        </div>
      </div>
    );
  }

  if (error || !website) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Website Not Found</h2>
          <p className="text-muted-foreground">
            This website doesn't exist or is no longer published.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const fullHTML = website.html_code;

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur border-b z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{website.title}</span>
            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
              Published
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.open(window.location.href, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Website Content */}
      <div className="pt-12">
        <iframe
          srcDoc={fullHTML}
          className="w-full h-[calc(100vh-48px)] border-0"
          title={website.title}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    </div>
  );
}
