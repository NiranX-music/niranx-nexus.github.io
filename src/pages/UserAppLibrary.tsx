import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Search, Code, User, Calendar, Eye, Plus, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface PublishedPage {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  created_at: string;
  created_by: string | null;
  is_published: boolean;
}

export default function UserAppLibrary() {
  const [pages, setPages] = useState<PublishedPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublishedPages();
  }, []);

  const fetchPublishedPages = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_custom_pages")
        .select("id, title, slug, meta_description, created_at, created_by, is_published")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (page.meta_description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Code className="h-8 w-8" />
            User Built App Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Explore apps and pages built by our community
          </p>
        </div>
        <Button 
          onClick={() => navigate("/submit-app")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Submit Your App
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pages.length}</p>
                <p className="text-sm text-muted-foreground">Published Apps</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20">
                <User className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(pages.map(p => p.created_by).filter(Boolean)).size}
                </p>
                <p className="text-sm text-muted-foreground">Contributors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <Sparkles className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Open Source</p>
                <p className="text-sm text-muted-foreground">Community Driven</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPages.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-muted">
              <Code className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Apps Found</h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? "No apps match your search. Try a different query."
                : "Be the first to publish an app to the library!"}
            </p>
            <Button onClick={() => navigate("/submit-app")} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Submit Your App
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <Card
              key={page.id}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 overflow-hidden"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                      {page.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {page.meta_description || "No description available"}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    <Eye className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(page.created_at), "MMM d, yyyy")}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`/p/${page.slug}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open App
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
