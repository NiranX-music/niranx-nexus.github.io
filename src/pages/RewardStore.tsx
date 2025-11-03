import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/contexts/XPContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Zap, Award, Palette, Star, Check } from 'lucide-react';
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

interface UserPurchase {
  item_id: string;
}

export default function RewardStore() {
  const { user } = useAuth();
  const { xp } = useXP();
  const [items, setItems] = useState<StoreItem[]>([]);
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStoreItems();
      fetchPurchases();
    }
  }, [user]);

  const fetchStoreItems = async () => {
    const { data, error } = await supabase
      .from('store_items')
      .select('*')
      .eq('is_available', true)
      .order('xp_cost', { ascending: true });

    if (data) {
      setItems(data);
    }
    setLoading(false);
  };

  const fetchPurchases = async () => {
    const { data } = await supabase
      .from('user_purchases')
      .select('item_id')
      .eq('user_id', user?.id);

    if (data) {
      setPurchases(data);
    }
  };

  const purchaseItem = async (item: StoreItem) => {
    if (!user) return;

    if (xp < item.xp_cost) {
      toast.error('Not enough XP!');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_purchases')
        .insert({
          user_id: user.id,
          item_id: item.id,
        });

      if (error) throw error;

      toast.success(`Purchased ${item.name}! (-${item.xp_cost} XP)`);
      fetchPurchases();
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error('You already own this item!');
      } else {
        toast.error(error.message);
      }
    }
  };

  const isPurchased = (itemId: string) => {
    return purchases.some(p => p.item_id === itemId);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'theme':
        return <Palette className="w-5 h-5" />;
      case 'avatar':
        return <Star className="w-5 h-5" />;
      case 'badge':
        return <Award className="w-5 h-5" />;
      case 'feature':
        return <Zap className="w-5 h-5" />;
      case 'power_up':
        return <Star className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  const ItemCard = ({ item }: { item: StoreItem }) => {
    const purchased = isPurchased(item.id);
    const canAfford = xp >= item.xp_cost;

    return (
      <Card className={`glass-card hover-lift ${purchased ? 'border-green-500' : ''}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {getItemIcon(item.item_type)}
              </div>
              <div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
            </div>
            {purchased && (
              <Badge variant="secondary" className="bg-green-500/20 text-green-600">
                <Check className="w-3 h-3 mr-1" />
                Owned
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-lg font-bold">{item.xp_cost} XP</span>
            </div>
            {!purchased && (
              <Button
                onClick={() => purchaseItem(item)}
                disabled={!canAfford}
                className={canAfford ? 'bg-gradient-to-r from-primary to-primary-glow' : ''}
              >
                {canAfford ? 'Purchase' : 'Not enough XP'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const filterByType = (type: string) => items.filter(i => i.item_type === type);

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold gradient-text">Reward Store</h1>
            <p className="text-muted-foreground">Spend your XP on awesome rewards</p>
          </div>
        </div>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold">{xp} XP</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available to spend</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="theme">Themes</TabsTrigger>
          <TabsTrigger value="avatar">Avatars</TabsTrigger>
          <TabsTrigger value="badge">Badges</TabsTrigger>
          <TabsTrigger value="feature">Features</TabsTrigger>
          <TabsTrigger value="power_up">Power-ups</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        {['theme', 'avatar', 'badge', 'feature', 'power_up'].map(type => (
          <TabsContent key={type} value={type} className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterByType(type).length > 0 ? (
                filterByType(type).map(item => (
                  <ItemCard key={item.id} item={item} />
                ))
              ) : (
                <Card className="glass-card col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No items available in this category yet
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}