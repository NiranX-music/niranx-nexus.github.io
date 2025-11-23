import { Button } from "@/components/ui/button";
import { MessageSquare, Trophy, Bookmark, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { 
      icon: MessageSquare, 
      label: "All Debates", 
      onClick: () => navigate('/debates'),
      color: "text-blue-500"
    },
    { 
      icon: TrendingUp, 
      label: "Trending", 
      onClick: () => navigate('/debates?sort=hot'),
      color: "text-orange-500"
    },
    { 
      icon: Trophy, 
      label: "Leaderboard", 
      onClick: () => navigate('/debates/leaderboard'),
      color: "text-yellow-500"
    },
    { 
      icon: Bookmark, 
      label: "Bookmarked", 
      onClick: () => navigate('/debates/bookmarks'),
      color: "text-purple-500"
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          onClick={action.onClick}
          className="h-auto py-4 flex flex-col gap-2"
        >
          <action.icon className={`w-6 h-6 ${action.color}`} />
          <span className="text-sm">{action.label}</span>
        </Button>
      ))}
    </div>
  );
}
