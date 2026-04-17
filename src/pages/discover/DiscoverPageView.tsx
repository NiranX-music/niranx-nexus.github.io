import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { DiscoverPage, ContentBlock, buildPageTree } from "@/types/discover";
import { DiscoverSidebar } from "@/components/discover/DiscoverSidebar";
import { ContentBlockRenderer, blocksToPlainText } from "@/components/discover/ContentBlockRenderer";
import { CommentSection } from "@/components/discover/CommentSection";
import { AISummaryBar } from "@/components/discover/AISummaryBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, Calendar, Edit, ArrowLeft, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function DiscoverPageView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin } = useAdminCheck();
  const [page, setPage] = useState<DiscoverPage | null>(null);
  const [allPages, setAllPages] = useState<DiscoverPage[]>([]);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: pageData }, { data: list }] = await Promise.all([
        supabase.from("discover_pages").select("*").eq("slug", slug).maybeSingle(),
        supabase.from("discover_pages").select("*").eq("is_published", true),
      ]);
      setPage(pageData as DiscoverPage | null);
      setAllPages((list as DiscoverPage[]) || []);
      setLoading(false);

      if (pageData) {
        await supabase.rpc("increment_discover_page_views", { _page_id: pageData.id });
        if (user) {
          const { data: likeRow } = await supabase
            .from("discover_page_likes")
            .select("id")
            .eq("page_id", pageData.id)
            .eq("user_id", user.id)
            .maybeSingle();
          setLiked(!!likeRow);
        }
      }
    })();
  }, [slug, user]);

  const tree = useMemo(() => buildPageTree(allPages), [allPages]);

  const toggleLike = async () => {
    if (!user || !page) {
      toast.error("Sign in to like pages");
      return;
    }
    if (liked) {
      await supabase.from("discover_page_likes").delete().eq("page_id", page.id).eq("user_id", user.id);
      setLiked(false);
      setPage({ ...page, like_count: Math.max(0, page.like_count - 1) });
    } else {
      await supabase.from("discover_page_likes").insert({ page_id: page.id, user_id: user.id });
      setLiked(true);
      setPage({ ...page, like_count: page.like_count + 1 });
    }
  };

  const plainText = useMemo(
    () => (page ? `${page.title}\n\n${page.description || ""}\n\n${blocksToPlainText(page.content)}` : ""),
    [page]
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-72 border-r border-border" />
        <div className="flex-1 p-10 space-y-4 max-w-4xl">
          <div className="h-10 bg-muted/30 rounded-xl animate-pulse w-3/4" />
          <div className="h-4 bg-muted/30 rounded animate-pulse w-1/2" />
          <div className="h-64 bg-muted/30 rounded-2xl animate-pulse mt-8" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <Button onClick={() => navigate("/discover")}>Back to Discover</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{page.title} — Discover NiranX</title>
        <meta name="description" content={page.description || page.title} />
        <meta name="keywords" content={page.tags.join(", ")} />
        <link rel="canonical" href={`/discover/${page.slug}`} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description || ""} />
        <meta property="og:type" content="article" />
        {page.cover_image_url && <meta property="og:image" content={page.cover_image_url} />}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: page.title,
          description: page.description,
          image: page.cover_image_url,
          datePublished: page.published_at,
          dateModified: page.updated_at,
          author: { "@type": "Person", name: page.author_name || "NiranX" },
          keywords: page.tags.join(", "),
        })}</script>
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)]">
        <DiscoverSidebar tree={tree} search={search} onSearchChange={setSearch} currentSlug={page.slug} />

        <main className="flex-1 overflow-y-auto">
          <article className="max-w-3xl mx-auto px-6 py-10 pb-40">
            <div className="flex items-center gap-2 mb-6">
              <Button size="sm" variant="ghost" onClick={() => navigate("/discover")}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Discover
              </Button>
              {isAdmin && (
                <Button size="sm" variant="outline" onClick={() => navigate(`/admin/discover/edit/${page.id}`)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>

            {page.cover_image_url && (
              <img
                src={page.cover_image_url}
                alt={page.title}
                className="w-full max-h-[400px] object-cover rounded-2xl mb-8 border border-border"
              />
            )}

            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {page.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1">
                    <Tag className="h-3 w-3" /> {t}
                  </Badge>
                ))}
              </div>
              <h1 className="text-5xl font-bold leading-tight mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {page.title}
              </h1>
              {page.description && (
                <p className="text-xl text-muted-foreground leading-relaxed">{page.description}</p>
              )}
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-border text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {page.published_at && formatDistanceToNow(new Date(page.published_at), { addSuffix: true })}
                </span>
                {page.author_name && <span>by <strong className="text-foreground">{page.author_name}</strong></span>}
                <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {page.view_count} views</span>
                <button
                  onClick={toggleLike}
                  className="flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-primary text-primary" : ""}`} />
                  {page.like_count}
                </button>
              </div>
            </header>

            <div className="discover-content">
              {(page.content as ContentBlock[]).map((block, i) => (
                <ContentBlockRenderer key={i} block={block} />
              ))}
            </div>

            <CommentSection pageId={page.id} />
          </article>
        </main>

        <AISummaryBar pageContent={plainText} pageTitle={page.title} />
      </div>
    </>
  );
}
