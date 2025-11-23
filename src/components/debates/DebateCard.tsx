import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ArrowUp, ArrowDown, Clock, Eye } from "lucide-react";
import { VoteButtons } from "./VoteButtons";
import { formatDistanceToNow } from "date-fns";

interface DebateCardProps {
  debate: any;
}

export function DebateCard({ debate }: DebateCardProps) {
  const navigate = useNavigate();
  
  const stanceTotal = (debate.stance_for_count || 0) + (debate.stance_against_count || 0) + (debate.stance_neutral_count || 0);
  const forPercent = stanceTotal > 0 ? (debate.stance_for_count / stanceTotal * 100) : 0;
  const againstPercent = stanceTotal > 0 ? (debate.stance_against_count / stanceTotal * 100) : 0;

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/debates/${debate.id}`)}
    >
      <div className="flex gap-4">
        {/* Vote Section */}
        <VoteButtons
          targetId={debate.id}
          targetType="topic"
          upvotes={debate.upvotes}
          downvotes={debate.downvotes}
        />

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Title */}
          <h3 className="text-xl font-semibold hover:text-primary">
            {debate.title}
          </h3>

          {/* Description Preview */}
          <p className="text-muted-foreground line-clamp-2">
            {debate.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={debate.profiles?.avatar_url} />
                <AvatarFallback>{debate.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{debate.profiles?.username || 'Anonymous'}</span>
            </div>

            {debate.debate_categories && (
              <Badge style={{ backgroundColor: debate.debate_categories.color }}>
                {debate.debate_categories.name}
              </Badge>
            )}

            {debate.tags && debate.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}

            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {debate.comment_count || 0}
            </div>

            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {debate.view_count || 0}
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(debate.created_at), { addSuffix: true })}
            </div>
          </div>

          {/* Stance Distribution Bar */}
          {stanceTotal > 0 && (
            <div className="space-y-2">
              <div className="flex gap-2 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500"
                  style={{ width: `${forPercent}%` }}
                />
                <div 
                  className="bg-red-500"
                  style={{ width: `${againstPercent}%` }}
                />
                <div 
                  className="bg-gray-400"
                  style={{ width: `${100 - forPercent - againstPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="text-green-600">👍 For: {debate.stance_for_count}</span>
                <span className="text-red-600">👎 Against: {debate.stance_against_count}</span>
                <span>😐 Neutral: {debate.stance_neutral_count}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}