import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DebateCard } from "@/components/debates/DebateCard";
import { Bookmark } from "lucide-react";

export default function DebateBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadBookmarks();
    }
  }, [user]);

  const loadBookmarks = async () => {
    const { data } = await supabase
      .from('debate_bookmarks')
      .select(`
        *,
        debate_topics (
          *,
          profiles:user_id (username, avatar_url),
          debate_categories (name, color)
        )
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setBookmarks(data.map((b: any) => b.debate_topics).filter(Boolean));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Bookmark className="w-10 h-10" />
          Bookmarked Debates
        </h1>
        <p className="text-muted-foreground mt-2">
          Debates you've saved for later
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No bookmarked debates yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map(debate => (
            <DebateCard key={debate.id} debate={debate} />
          ))}
        </div>
      )}
    </div>
  );
}