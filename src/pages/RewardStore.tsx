import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/contexts/XPContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ShoppingBag, Zap, Award, Palette, Star, Check, TrendingUp, History, ArrowUp } from 'lucide-react';
import { toast } from 'sonner';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  item_type: string;
  xp_cost: number;
  image_url: string;
  is_available: boolean;
}

interface XPTransaction {
  id: string;
  amount: number;
  reason: string;
  activity_type: string;
  created_at: string;
}

export default function RewardStore() {
  const { user } = useAuth();
  const { xp, level, getXPProgress, spendXP } = useXP();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [purchases, setPurchases] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<XPTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      Promise.all([fetchStoreItems(), fetchPurchases(), fetchTransactions()]).finally(() => setLoading(false));
    }
  }, [user]);

  const fetchStoreItems = async () => {
    const { data } = await supabase.from('store_items').select('*').eq('is_available', true).order('xp_cost');
    if (data) setItems(data);
  };

  const fetchPurchases = async () => {
    const { data } = await supabase.from('user_purchases').select('item_id').eq('user_id', user?.id);
    if (data) setPurchases(data.map(p => p.item_id));
  };

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setTransactions(data);
  };

  const purchaseItem = async (item: StoreItem) => {
    if (!user) return;
    const success = await spendXP(item.xp_cost, `Purchased: ${item.name}`);
    if (!success) {
      toast.error('Not enough XP!');
      return;
    }
    try {
      const { error } = await supabase.from('user_purchases').insert({ user_id: user.id, item_id: item.id });
      if (error) throw error;
      toast.success(`🎉 Purchased ${item.name}!`);
      fetchPurchases();
      fetchTransactions();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('You already own this item!');
      } else {
        toast.error(error.message);
      }
    }
  };

  const progress = getXPProgress();
  const xpToNext = level * 1000 - xp;

  const filterByType = (type: string) => items.filter(i => i.item_type === type);
  const categories = ['theme', 'avatar', 'badge', 'feature', 'power_up'];

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* XP Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-2xl font-black text-white">
                {level}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold gradient-text">Level {level}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-lg font-bold">{xp.toLocaleString()} XP</span>
                  <span className="text-muted-foreground text-sm">• {xpToNext.toLocaleString()} XP to next level</span>
                </div>
                <Progress value={progress} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
            <TrendingUp className="w-8 h-8 text-primary mb-2" />
            <div className="text-2xl font-bold">{transactions.filter(t => t.amount > 0).length}</div>
            <p className="text-xs text-muted-foreground">Total XP Activities</p>
            <div className="text-sm font-medium text-green-500 mt-1">
              +{transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0).toLocaleString()} earned
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Store */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Reward Store</h1>
          </div>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="theme">Themes</TabsTrigger>
            <TabsTrigger value="badge">Badges</TabsTrigger>
            <TabsTrigger value="power_up">Power-ups</TabsTrigger>
            <TabsTrigger value="feature">Features</TabsTrigger>
            <TabsTrigger value="history">XP History</TabsTrigger>
          </TabsList>
        </div>

        {/* Store items tabs */}
        {['all', ...categories].map(tab => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(tab === 'all' ? items : filterByType(tab)).map(item => {
                const owned = purchases.includes(item.id);
                const canAfford = xp >= item.xp_cost;
                return (
                  <Card key={item.id} className={`glass-card hover-lift transition-all ${owned ? 'border-green-500/50' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{item.image_url}</span>
                          <div>
                            <CardTitle className="text-base">{item.name}</CardTitle>
                            <CardDescription className="text-xs">{item.description}</CardDescription>
                          </div>
                        </div>
                        {owned && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-500 shrink-0">
                            <Check className="w-3 h-3 mr-1" /> Owned
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold">{item.xp_cost.toLocaleString()} XP</span>
                        </div>
                        {!owned && (
                          <Button size="sm" onClick={() => purchaseItem(item)} disabled={!canAfford}>
                            {canAfford ? 'Buy' : 'Need more XP'}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {(tab === 'all' ? items : filterByType(tab)).length === 0 && (
                <Card className="glass-card col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No items available in this category
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}

        {/* XP History tab */}
        <TabsContent value="history" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><History className="w-5 h-5" /> XP Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No XP activity yet. Start exploring to earn XP!</p>
                )}
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {tx.amount > 0 ? <ArrowUp className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.reason}</p>
                        <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} XP
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
