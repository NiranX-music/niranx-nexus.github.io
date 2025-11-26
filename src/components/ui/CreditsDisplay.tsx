import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function CreditsDisplay() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credits, setCredits] = useState<{ remaining: number; limit: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.rpc('ensure_user_credits', {
        _user_id: user.id
      });

      if (error) throw error;
      
      if (data && Array.isArray(data) && data.length > 0) {
        setCredits({
          remaining: data[0].credits_remaining,
          limit: data[0].credits_limit
        });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      toast({
        title: "Error loading credits",
        description: "Could not load your credit balance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [user]);

  if (loading) {
    return (
      <Card className="p-4 flex items-center gap-3 bg-card/50">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading credits...</span>
      </Card>
    );
  }

  if (!credits) return null;

  const isUnlimited = credits.limit > 999000;
  const percentage = isUnlimited ? 100 : (credits.remaining / credits.limit) * 100;
  const isLow = percentage < 20 && !isUnlimited;

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isLow ? 'bg-destructive/10' : 'bg-primary/10'}`}>
            <Coins className={`h-5 w-5 ${isLow ? 'text-destructive' : 'text-primary'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">AI Credits</p>
            <p className="text-xs text-muted-foreground">
              {isUnlimited ? 'Unlimited' : `Resets daily`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${isLow ? 'text-destructive' : 'text-primary'}`}>
            {isUnlimited ? '∞' : credits.remaining}
          </p>
          {!isUnlimited && (
            <p className="text-xs text-muted-foreground">of {credits.limit}</p>
          )}
        </div>
      </div>
      {!isUnlimited && (
        <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              isLow ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </Card>
  );
}
