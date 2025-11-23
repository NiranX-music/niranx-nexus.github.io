import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DebateCard } from "@/components/debates/DebateCard";
import { MessageSquare, FileText } from "lucide-react";

export default function MyDebates() {
  const { user } = useAuth();
  const [myDebates, setMyDebates] = useState<any[]>([]);
  const [myComments, setMyComments] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadMyDebates();
      loadMyComments();
    }
  }, [user]);

  const loadMyDebates = async () => {
    const { data } = await supabase
      .from('debate_topics')
      .select(`
        *,
        profiles:user_id (username, avatar_url),
        debate_categories (name, color)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setMyDebates(data);
  };

  const loadMyComments = async () => {
    const { data } = await supabase
      .from('debate_comments')
      .select(`
        *,
        debate_topics (title, id)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setMyComments(data);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">My Debates</h1>

      <Tabs defaultValue="debates">
        <TabsList>
          <TabsTrigger value="debates">
            <MessageSquare className="w-4 h-4 mr-2" />
            My Debates ({myDebates.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            <FileText className="w-4 h-4 mr-2" />
            My Comments ({myComments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="debates" className="space-y-4 mt-6">
          {myDebates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              You haven't created any debates yet.
            </div>
          ) : (
            myDebates.map(debate => (
              <DebateCard key={debate.id} debate={debate} />
            ))
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4 mt-6">
          {myComments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              You haven't posted any comments yet.
            </div>
          ) : (
            myComments.map((comment: any) => (
              <div key={comment.id} className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  in <span className="font-semibold">{comment.debate_topics?.title}</span>
                </div>
                <p className="whitespace-pre-wrap">{comment.content}</p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>👍 {comment.upvotes}</span>
                  <span>👎 {comment.downvotes}</span>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}