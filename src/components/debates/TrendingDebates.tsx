import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MessageSquare, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TrendingDebates() {
  const [trending, setTrending] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    const { data } = await supabase
      .from('debate_topics')
      .select(`
        id,
        title,
        upvotes,
        downvotes,
        comment_count,
        debate_categories (name, color)
      `)
      .order('hotness_score', { ascending: false })
      .limit(5);
    
    if (data) setTrending(data);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-500" />
        <h3 className="font-semibold">🔥 Trending Now</h3>
      </div>
      <div className="space-y-3">
        {trending.map((debate, index) => (
          <div
            key={debate.id}
            className="flex gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-lg transition-colors"
            onClick={() => navigate(`/debates/${debate.id}`)}
          >
            <div className="text-sm font-bold text-muted-foreground w-6">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium line-clamp-2">{debate.title}</p>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  {debate.upvotes - debate.downvotes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {debate.comment_count}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
