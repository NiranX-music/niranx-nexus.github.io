import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Plus, Search, TrendingUp } from "lucide-react";
import { DebateCard } from "@/components/debates/DebateCard";
import { CreateDebateModal } from "@/components/debates/CreateDebateModal";
import { TrendingDebates } from "@/components/debates/TrendingDebates";
import { DebateStats } from "@/components/debates/DebateStats";
import { QuickActions } from "@/components/debates/QuickActions";
import { MobileDebateFilters } from "@/components/debates/MobileDebateFilters";
import { useToast } from "@/hooks/use-toast";
import { useDebateXP } from "@/hooks/useDebateXP";
import { useAuth } from "@/contexts/AuthContext";
import { DebateNotifications } from "@/components/debates/DebateNotifications";

export default function DebateHub() {
  const { user } = useAuth();
  const [debates, setDebates] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { toast } = useToast();
  
  // Integrate XP system
  useDebateXP();

  useEffect(() => {
    loadCategories();
    loadDebates();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('debate_topics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debate_topics' }, () => {
        loadDebates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sortBy, selectedCategory, searchQuery]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('debate_categories')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const loadDebates = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('debate_topics')
        .select(`
          *,
          debate_categories (name, color)
        `);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      switch (sortBy) {
        case 'hot':
          query = query.order('hotness_score', { ascending: false, nullsFirst: false });
          break;
        case 'new':
          query = query.order('created_at', { ascending: false });
          break;
        case 'top':
          query = query.order('upvotes', { ascending: false });
          break;
        case 'controversial':
          query = query.order('controversy_score', { ascending: false, nullsFirst: false });
          break;
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Debate loading error:', error);
        toast({ title: "Error loading debates", description: error.message, variant: "destructive" });
        setDebates([]);
      } else {
        // Fetch profile data separately to avoid join issues
        const debatesWithProfiles = await Promise.all(
          (data || []).map(async (debate) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('user_id', debate.user_id)
              .maybeSingle();
            return { ...debate, profiles: profile };
          })
        );
        setDebates(debatesWithProfiles);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      toast({ title: "Error loading debates", variant: "destructive" });
      setDebates([]);
    }
    setLoading(false);
  };

  return (
    <>
      <DebateNotifications />
      <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <MessageSquare className="w-10 h-10" />
            Debate Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Engage in thoughtful discussions and challenge ideas
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Create Debate
        </Button>
      </div>

      {/* Quick Actions - Mobile Friendly */}
      <div className="lg:hidden">
        <QuickActions />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search debates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Desktop Filters */}
        <div className="hidden md:flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">🔥 Hot</SelectItem>
              <SelectItem value="new">🆕 New</SelectItem>
              <SelectItem value="top">📈 Top</SelectItem>
              <SelectItem value="controversial">⚡ Controversial</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCategory || "all"} onValueChange={(v) => setSelectedCategory(v === "all" ? null : v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Filters */}
        <div className="md:hidden">
          <MobileDebateFilters
            sortBy={sortBy}
            setSortBy={setSortBy}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Debates List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-12">Loading debates...</div>
          ) : debates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No debates found. Be the first to create one!
            </div>
          ) : (
            <div className="grid gap-4">
              {debates.map(debate => (
                <DebateCard key={debate.id} debate={debate} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Trending & Stats */}
        <div className="hidden lg:block space-y-6">
          {user && <DebateStats />}
          <TrendingDebates />
        </div>
      </div>

      <CreateDebateModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      </div>
    </>
  );
}