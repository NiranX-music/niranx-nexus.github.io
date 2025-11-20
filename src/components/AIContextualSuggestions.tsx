import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIContextualSuggestionsProps {
  context: string;
  title?: string;
  description?: string;
}

export function AIContextualSuggestions({ 
  context, 
  title = "AI Suggestions",
  description = "Smart recommendations based on your activity"
}: AIContextualSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Provide 3 brief, actionable suggestions for ${context}. Return only a JSON array of strings, no other text.`
          }]
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullResponse += decoder.decode(value);
        }
      }

      try {
        const parsed = JSON.parse(fullResponse);
        setSuggestions(parsed);
      } catch {
        // If not JSON, split by newlines and filter
        const lines = fullResponse.split('\n').filter(line => line.trim());
        setSuggestions(lines.slice(0, 3));
      }
    } catch (error) {
      toast.error("Failed to generate suggestions");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Click the refresh button to get AI-powered suggestions
          </p>
        ) : (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-primary font-semibold">{index + 1}.</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
