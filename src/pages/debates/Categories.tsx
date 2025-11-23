import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";

export default function DebateCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('debate_categories')
      .select('*')
      .order('debate_count', { ascending: false });
    
    if (data) setCategories(data);
  };

  const getIcon = (iconName: string) => {
    const Icon = (Icons as any)[iconName] || Icons.MessageSquare;
    return <Icon className="w-12 h-12" />;
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8">Debate Categories</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <Card
            key={category.id}
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/debates?category=${category.id}`)}
            style={{ borderTop: `4px solid ${category.color}` }}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div style={{ color: category.color }}>
                {getIcon(category.icon)}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="text-muted-foreground text-sm mt-2">{category.description}</p>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{category.debate_count || 0} debates</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}